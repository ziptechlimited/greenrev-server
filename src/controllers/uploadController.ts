import type { Request, Response } from "express";
import { uploadFile } from "../utils/cloudinary";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function uploadProductMedia(req: Request, res: Response) {
  try {
    const files = (req as any).files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return sendError(res, 400, {
        code: "NO_FILE",
        message: "No files uploaded",
      });
    }

    // Upload all files concurrently
    const urls = await Promise.all(
      files.map((file) => uploadFile(file.buffer, file.mimetype))
    );

    return sendSuccess(res, 200, { urls });
  } catch (error) {
    console.error("Upload error:", error);
    return sendError(res, 500, {
      code: "UPLOAD_ERROR",
      message: "Failed to upload file(s) to Cloudinary",
    });
  }
}
