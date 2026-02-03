import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "driver_kyc",
    allowed_formats: ["jpg", "png", "jpeg", "pdf","webp"],
  },
});

const upload = multer({ storage });

export default upload;
