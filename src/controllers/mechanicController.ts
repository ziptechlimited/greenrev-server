import type { Response } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/errors";
import { sendSuccess } from "../utils/apiResponse";
import type { CustomReq } from "../types/auth";
import { uploadImage } from "../utils/cloudinary";
import { ExpertMessage } from "../models/ExpertMessage";
import { sendEmail } from "../services/emailService";

export async function getProfile(req: CustomReq, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  return sendSuccess(res, 200, {
    profile: {
      name: user.name ?? "",
      bio: user.bio ?? "",
      phone: user.phone ?? "",
      specialization: user.specialization ?? [],
      hourlyRate: user.hourlyRate ?? 0,
      city: user.city ?? "",
      country: user.country ?? "",
      address: user.address ?? "",
      lat: user.lat ?? 0,
      lng: user.lng ?? 0,
      profileImage: user.profileImage ?? null,
    },
  });
}

export async function updateProfile(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
    }

    const { name, bio, phone, specialization, hourlyRate, profileImageBase64 } = req.body as Record<string, unknown>;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    }

    if (typeof name === "string") user.name = name;
    if (typeof bio === "string") user.bio = bio;
    if (typeof phone === "string") user.phone = phone;
    if (Array.isArray(specialization)) {
      user.specialization = specialization.filter(s => typeof s === "string");
    }
    if (typeof hourlyRate === "number") user.hourlyRate = hourlyRate;
    else if (typeof hourlyRate === "string" && !isNaN(Number(hourlyRate))) {
      user.hourlyRate = Number(hourlyRate);
    }

    if (typeof profileImageBase64 === "string" && profileImageBase64) {
      const imageUrl = await uploadImage(profileImageBase64, "greenrev_profiles");
      user.profileImage = imageUrl;
    }

    await user.save();

    return sendSuccess(res, 200, {
      profile: {
        name: user.name ?? "",
        bio: user.bio ?? "",
        phone: user.phone ?? "",
        specialization: user.specialization ?? [],
        hourlyRate: user.hourlyRate ?? 0,
        profileImage: user.profileImage ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to update profile", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function updateLocation(req: CustomReq, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const { city, country, address, lat, lng } = req.body as Record<string, unknown>;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  if (typeof city === "string") user.city = city;
  if (typeof country === "string") user.country = country;
  if (typeof address === "string") user.address = address;
  
  if (typeof lat === "number") user.lat = lat;
  else if (typeof lat === "string" && !isNaN(Number(lat))) user.lat = Number(lat);
  
  if (typeof lng === "number") user.lng = lng;
  else if (typeof lng === "string" && !isNaN(Number(lng))) user.lng = Number(lng);

  await user.save();

  return sendSuccess(res, 200, {
    location: {
      city: user.city ?? "",
      country: user.country ?? "",
      address: user.address ?? "",
      lat: user.lat ?? 0,
      lng: user.lng ?? 0,
    },
  });
}

export async function getExpertMessages(req: CustomReq, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const messages = await ExpertMessage.find({ expertId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return sendSuccess(res, 200, { messages });
}

export async function replyToExpertMessage(req: CustomReq, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const messageId = req.params.id;
  const { reply } = req.body;

  if (!reply || typeof reply !== "string" || !reply.trim()) {
    throw new ApiError(400, "INVALID_INPUT", "Reply content is required");
  }

  const message = await ExpertMessage.findById(messageId);
  if (!message) {
    throw new ApiError(404, "MESSAGE_NOT_FOUND", "Message not found");
  }

  if (message.expertId.toString() !== req.user.id) {
    throw new ApiError(403, "FORBIDDEN", "Not authorized to reply to this message");
  }

  message.reply = reply.trim();
  message.replyDate = new Date();
  message.status = "REPLIED";

  await message.save();

  // Find the expert's name
  const expert = await User.findById(req.user.id).select("name email");
  const expertName = expert?.name || "An Expert";

  // Send an email to the user
  const emailHtml = `
    <h2>You received a reply from ${expertName}!</h2>
    <p>They responded to the message you sent on GreenRev.</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Your Original Message:</strong></p>
      <p style="color: #666;">${message.message}</p>
    </div>
    <div style="background: #eef8ee; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p><strong>${expertName}'s Reply:</strong></p>
      <p>${message.reply}</p>
    </div>
    <p>Log in to GreenRev to view all your messages.</p>
  `;

  await sendEmail({
    to: message.senderEmail,
    subject: `Reply from ${expertName} - GreenRev`,
    html: emailHtml,
  }).catch(err => console.error("Failed to send expert reply email:", err));

  return sendSuccess(res, 200, { message });
}
