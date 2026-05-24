"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
const User_1 = require("../models/User");
const apiResponse_1 = require("../utils/apiResponse");
const cloudinary_1 = require("../utils/cloudinary");
async function getProfile(req, res) {
    try {
        const user = await User_1.User.findById(req.user?.id).select("-passwordHash -__v");
        if (!user) {
            return (0, apiResponse_1.sendError)(res, 404, {
                code: "NOT_FOUND",
                message: "User not found",
            });
        }
        return (0, apiResponse_1.sendSuccess)(res, 200, { user });
    }
    catch (error) {
        console.error("Get profile error:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Server error",
        });
    }
}
async function updateProfile(req, res) {
    try {
        const { name, companyName, garageName, phone, bio, profileImageBase64 } = req.body;
        const user = await User_1.User.findById(req.user?.id);
        if (!user) {
            return (0, apiResponse_1.sendError)(res, 404, {
                code: "NOT_FOUND",
                message: "User not found",
            });
        }
        if (name !== undefined)
            user.name = name;
        if (companyName !== undefined)
            user.companyName = companyName;
        if (garageName !== undefined)
            user.garageName = garageName;
        if (phone !== undefined)
            user.phone = phone;
        if (bio !== undefined)
            user.bio = bio;
        if (profileImageBase64) {
            const imageUrl = await (0, cloudinary_1.uploadImage)(profileImageBase64, "greenrev_profiles");
            user.profileImage = imageUrl;
        }
        await user.save();
        const updatedUser = await User_1.User.findById(req.user?.id).select("-passwordHash -__v");
        return (0, apiResponse_1.sendSuccess)(res, 200, { user: updatedUser });
    }
    catch (error) {
        console.error("Update profile error:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "INTERNAL_ERROR",
            message: "Server error",
        });
    }
}
