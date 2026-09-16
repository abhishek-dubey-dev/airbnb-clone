require("dotenv").config();

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const CloudinaryStorage = require("multer-storage-cloudinary");

const cloudName = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUD_API_KEY || process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUD_API_SECRET || process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (!isCloudinaryConfigured) {
  console.warn("Cloudinary env vars missing. Falling back to local file upload storage.");
}

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  },
});

const storage = isCloudinaryConfigured
  ? CloudinaryStorage({
      cloudinary,
      params: {
        folder: "wanderlust_DEV",
        allowed_formats: ["png", "jpg", "jpeg"],
      },
    })
  : localStorage;

module.exports = {
  cloudinary,
  storage,
  localStorage,
};