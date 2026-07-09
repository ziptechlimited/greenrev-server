"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductMedia = uploadProductMedia;
const cloudinary_1 = require("../utils/cloudinary");
const apiResponse_1 = require("../utils/apiResponse");
async function uploadProductMedia(req, res) {
    try {
        const file = req.file;
        if (!file) {
            return (0, apiResponse_1.sendError)(res, 400, {
                code: "NO_FILE",
                message: "No file uploaded",
            });
        }
        const buffer = file.buffer;
        const mimetype = file.mimetype;
        const url = await (0, cloudinary_1.uploadFile)(buffer, mimetype);
        return (0, apiResponse_1.sendSuccess)(res, 200, { url });
    }
    catch (error) {
        console.error("Upload error:", error);
        return (0, apiResponse_1.sendError)(res, 500, {
            code: "UPLOAD_ERROR",
            message: "Failed to upload file to Cloudinary",
        });
    }
}
