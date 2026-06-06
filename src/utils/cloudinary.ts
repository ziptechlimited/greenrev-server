import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
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
export async function uploadImage(
  base64Image: string,
  folder: string = "greenrev_profiles",
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Uploads a file buffer to Cloudinary
 * @param buffer The file buffer to upload
 * @param mimetype The mime type of the file
 * @param folder The folder in cloudinary to store the file
 * @returns The secure URL of the uploaded file
 */
export async function uploadFile(
  buffer: Buffer,
  mimetype: string,
  folder: string = "greenrev_products",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith("image/") ? "image" : "raw";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary stream upload error:", error);
          return reject(new Error("Failed to upload file to Cloudinary"));
        }
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Cloudinary upload failed to return a URL"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}
