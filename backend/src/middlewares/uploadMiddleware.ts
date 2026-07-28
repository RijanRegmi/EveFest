import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dkmbfnuch",
  api_key: process.env.CLOUDINARY_API_KEY || "826757367917691",
  api_secret: process.env.CLOUDINARY_API_SECRET || "uu6KmtsVu9VGD9J_UtBVl598K0c",
});

export { cloudinary };

// Configure Cloudinary storage engine for Multer
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req: Request, file: Express.Multer.File) => {
    const isLogo = file.fieldname === "logo";
    const folder = isLogo ? "evefest/logos" : "evefest/events";
    const rawExt = path.extname(file.originalname).substring(1).toLowerCase();
    const format = rawExt || "jpg";

    return {
      folder: folder,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf"],
      public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      format: format,
    };
  },
});

// File filter: allow images and documents
const imageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype =
    allowedTypes.test(file.mimetype) || file.mimetype === "application/pdf";

  if (extname || mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image and document files are allowed"));
  }
};

// Single banner upload (up to 10MB)
export const uploadBanner = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("banner");

// Single logo upload (up to 5MB)
export const uploadLogo = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("logo");

// Combined upload for both banner and logo
export const uploadEventImages = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
}).fields([
  { name: "banner", maxCount: 1 },
  { name: "logo", maxCount: 1 },
]);
