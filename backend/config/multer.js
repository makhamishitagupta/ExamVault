import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

// Papers storage
export const paperStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "examRelatedWeb/papers",
    resource_type: "raw",     
    format: "pdf",
  },
});

// Notes storage
export const notesStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "examRelatedWeb/notes",
    resource_type: "raw",
    format: "pdf",
  },
});

export const uploadPaper = multer({ storage: paperStorage });
export const uploadNotes = multer({ storage: notesStorage });
