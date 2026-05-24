"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * Uploads a base64 encoded image to Cloudinary
 * @param base64Image The base64 string of the image (including data URI prefix)
 * @param folder The folder in cloudinary to store the image
 * @returns The secure URL of the uploaded image
 */
async function uploadImage(base64Image, folder = "greenrev_profiles") {
    try {
        const result = await cloudinary_1.v2.uploader.upload(base64Image, {
            folder: folder,
        });
        return result.secure_url;
    }
    catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload image");
    }
}
