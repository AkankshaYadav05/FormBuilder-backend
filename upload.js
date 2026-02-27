import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './config/cloudinary.js';

// Storage for profile images (profiles folder)
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'formbuilder/profiles',
    resource_type: 'auto',
  },
});

// Storage for document uploads (documents folder)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'formbuilder/documents',
    resource_type: 'auto',
  },
});

// Upload handler for profile images only
export const uploadImage = multer({ 
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
  fileFilter: (req, file, cb) => {
    console.log(`🖼️ profile image attempt: ${file.originalname} (${file.mimetype})`);
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only image files (JPG, PNG, WebP, GIF, BMP) are allowed. Got: ${file.mimetype}`), false);
    }
  },
});

// Upload handler for documents
export const uploadDocument = multer({ 
  storage: documentStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    console.log(`📄 document upload attempt: ${file.originalname} (${file.mimetype})`);
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only PDF, Word, Excel, and TXT files are allowed. Got: ${file.mimetype}`), false);
    }
  },
});

// Default export for backwards compatibility
export default uploadImage;
