import type { Response } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/errors";
import { sendSuccess } from "../utils/apiResponse";
import type { CustomReq } from "../types/auth";

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
  if (!req.user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const { name, bio, specialization, hourlyRate, profileImageBase64 } = req.body as Record<string, unknown>;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  if (typeof name === "string") user.name = name;
  if (typeof bio === "string") user.bio = bio;
  if (Array.isArray(specialization)) {
    user.specialization = specialization.filter(s => typeof s === "string");
  }
  if (typeof hourlyRate === "number") user.hourlyRate = hourlyRate;
  else if (typeof hourlyRate === "string" && !isNaN(Number(hourlyRate))) {
    user.hourlyRate = Number(hourlyRate);
  }

  if (typeof profileImageBase64 === "string" && profileImageBase64) {
    const { uploadImage } = await import("../utils/cloudinary.js");
    const imageUrl = await uploadImage(profileImageBase64, "greenrev_profiles");
    user.profileImage = imageUrl;
  }

  await user.save();

  return sendSuccess(res, 200, {
    profile: {
      name: user.name ?? "",
      bio: user.bio ?? "",
      specialization: user.specialization ?? [],
      hourlyRate: user.hourlyRate ?? 0,
      profileImage: user.profileImage ?? null,
    },
  });
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
