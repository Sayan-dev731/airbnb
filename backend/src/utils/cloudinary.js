import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a single local file to Cloudinary
 * @param {string} localFilePath - Path of the file on local disk
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<Object|null>} Cloudinary upload result
 */
export const uploadOnCloudinary = async (
  localFilePath,
  folder = "airbnb/listings"
) => {
  try {
    if (!localFilePath) return null;

    // Check if file exists locally
    if (!fs.existsSync(localFilePath)) return null;

    // Upload to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folder,
    });

    // Remove local file after successful upload
    try {
      fs.unlinkSync(localFilePath);
    } catch (err) {
      console.error("Error removing temp file:", err);
    }

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Cleanup local temp file if upload failed
    if (localFilePath && fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error("Error removing failed temp file:", err);
      }
    }
    return null;
  }
};

/**
 * Upload multiple files to Cloudinary in parallel
 * @param {Array<Object>} files - Array of multer file objects
 * @param {string} folder - Destination folder
 * @returns {Promise<Array<Object>>} Array of uploaded image objects
 */
export const uploadMultipleOnCloudinary = async (
  files = [],
  folder = "airbnb/listings"
) => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map((file) =>
    uploadOnCloudinary(file.path, folder)
  );
  const results = await Promise.all(uploadPromises);

  return results.filter((res) => res !== null);
};

/**
 * Delete an asset from Cloudinary by public ID
 * @param {string} publicId - Cloudinary asset public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return null;
  }
};
