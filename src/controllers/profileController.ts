import type { Response } from "express";
import { User } from "../models/User";
import { sendSuccess, sendError } from "../utils/apiResponse";
import type { CustomReq } from "../types/auth";
import { uploadImage } from "../utils/cloudinary";

export async function getProfile(req: CustomReq, res: Response) {
  try {
    const user = await User.findById(req.user?.id).select("-passwordHash -__v");
    if (!user) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    return sendSuccess(res, 200, { user });
  } catch (error) {
    console.error("Get profile error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Server error",
    });
  }
}

export async function updateProfile(req: CustomReq, res: Response) {
  try {
    const { name, companyName, garageName, phone, bio, profileImageBase64 } =
      req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (name !== undefined) user.name = name;
    if (companyName !== undefined) user.companyName = companyName;
    if (garageName !== undefined) user.garageName = garageName;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;

    if (profileImageBase64) {
      const imageUrl = await uploadImage(
        profileImageBase64,
        "greenrev_profiles",
      );
      user.profileImage = imageUrl;
    }

    await user.save();

    const updatedUser = await User.findById(req.user?.id).select(
      "-passwordHash -__v",
    );
    return sendSuccess(res, 200, { user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Server error",
    });
  }
}
