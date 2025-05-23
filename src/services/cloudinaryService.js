import cloudinary from "../lib/cloudinary.js";
import fs from "fs";

const extractPublicIdFromUrl = (url) => {
  // Use regex to extract the public ID from the URL
  const regex = /\/upload\/(?:v\d+\/)?([^\.]+)\./; // Matches '/upload/v1738082876/n7wxyzxpg85x5sb2i7x4.webp'
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const uploadToCloudinary = async (filePath, folder) => {
  try {
    // Make sure the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }

    // Read the file as a buffer
    fs.readFileSync(filePath);

    // Upload the file to Cloudinary using buffer upload
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: folder,
    });

    return result.secure_url;
  } catch (error) {
    console.log("Error in uploadToCloudinary", error);
    throw new Error("Error uploading to cloudinary");
  }
};

export const deleteFromCloudinary = async (url) => {
  const publicId = extractPublicIdFromUrl(url);

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Error in deleteFromCloudinary", error);
    throw new Error("Error deleting from cloudinary");
  }
};
