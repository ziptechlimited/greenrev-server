import type { Request, Response } from "express";
import { uploadFile } from "../utils/cloudinary";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function uploadProductMedia(req: Request, res: Response) {
  try {
    if (!req.file) {
      return sendError(res, 400, {
        code: "NO_FILE",
        message: "No file uploaded",
      });
    }

    const buffer = req.file.buffer;
    const mimetype = req.file.mimetype;

    const url = await uploadFile(buffer, mimetype);

    return sendSuccess(res, 200, { url });
  } catch (error) {
    console.error("Upload error:", error);
    return sendError(res, 500, {
      code: "UPLOAD_ERROR",
      message: "Failed to upload file to Cloudinary",
    });
  }
}
