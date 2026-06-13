import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage for event banner images
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../../uploads/events");
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `banner-${uniqueSuffix}${ext}`);
  },
});

// Storage for event logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../../uploads/logos");
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo-${uniqueSuffix}${ext}`);
  },
});

// File filter: only allow images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, png, gif, webp, svg)"));
  }
};

// Upload for event banners (up to 10MB)
export const uploadBanner = multer({
  storage: bannerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("banner");

// Upload for logos (up to 5MB)
export const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("logo");

// Combined multi-field upload (banner + logo in one request)
export const uploadEventImages = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = file.fieldname === "logo" ? "logos" : "events";
      const uploadPath = path.join(__dirname, `../../../uploads/${folder}`);
      ensureDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const prefix = file.fieldname === "logo" ? "logo" : "banner";
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
}).fields([
  { name: "banner", maxCount: 1 },
  { name: "logo", maxCount: 1 },
]);
