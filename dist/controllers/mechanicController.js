"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.updateLocation = updateLocation;
const User_1 = require("../models/User");
const errors_1 = require("../utils/errors");
const apiResponse_1 = require("../utils/apiResponse");
const cloudinary_1 = require("../utils/cloudinary");
async function getProfile(req, res) {
    if (!req.user) {
        throw new errors_1.ApiError(401, "UNAUTHENTICATED", "Authentication required");
    }
    const user = await User_1.User.findById(req.user.id);
    if (!user) {
        throw new errors_1.ApiError(404, "USER_NOT_FOUND", "User not found");
    }
    return (0, apiResponse_1.sendSuccess)(res, 200, {
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
async function updateProfile(req, res) {
    try {
        if (!req.user) {
            throw new errors_1.ApiError(401, "UNAUTHENTICATED", "Authentication required");
        }
        const { name, bio, specialization, hourlyRate, profileImageBase64 } = req.body;
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            throw new errors_1.ApiError(404, "USER_NOT_FOUND", "User not found");
        }
        if (typeof name === "string")
            user.name = name;
        if (typeof bio === "string")
            user.bio = bio;
        if (Array.isArray(specialization)) {
            user.specialization = specialization.filter(s => typeof s === "string");
        }
        if (typeof hourlyRate === "number")
            user.hourlyRate = hourlyRate;
        else if (typeof hourlyRate === "string" && !isNaN(Number(hourlyRate))) {
            user.hourlyRate = Number(hourlyRate);
        }
        if (typeof profileImageBase64 === "string" && profileImageBase64) {
            const imageUrl = await (0, cloudinary_1.uploadImage)(profileImageBase64, "greenrev_profiles");
            user.profileImage = imageUrl;
        }
        await user.save();
        return (0, apiResponse_1.sendSuccess)(res, 200, {
            profile: {
                name: user.name ?? "",
                bio: user.bio ?? "",
                specialization: user.specialization ?? [],
                hourlyRate: user.hourlyRate ?? 0,
                profileImage: user.profileImage ?? null,
            },
        });
    }
    catch (error) {
        console.error("Failed to update profile", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
async function updateLocation(req, res) {
    if (!req.user) {
        throw new errors_1.ApiError(401, "UNAUTHENTICATED", "Authentication required");
    }
    const { city, country, address, lat, lng } = req.body;
    const user = await User_1.User.findById(req.user.id);
    if (!user) {
        throw new errors_1.ApiError(404, "USER_NOT_FOUND", "User not found");
    }
    if (typeof city === "string")
        user.city = city;
    if (typeof country === "string")
        user.country = country;
    if (typeof address === "string")
        user.address = address;
    if (typeof lat === "number")
        user.lat = lat;
    else if (typeof lat === "string" && !isNaN(Number(lat)))
        user.lat = Number(lat);
    if (typeof lng === "number")
        user.lng = lng;
    else if (typeof lng === "string" && !isNaN(Number(lng)))
        user.lng = Number(lng);
    await user.save();
    return (0, apiResponse_1.sendSuccess)(res, 200, {
        location: {
            city: user.city ?? "",
            country: user.country ?? "",
            address: user.address ?? "",
            lat: user.lat ?? 0,
            lng: user.lng ?? 0,
        },
    });
}
