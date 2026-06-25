import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const UPLOAD_PATH = process.env.UPLOAD_PATH || 'uploads/';

// Ensure upload directory exists for local fallback
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

let storage;

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const folder = 'meetory';
      let resource_type = 'auto';
      if (file.mimetype.startsWith('video/')) {
        resource_type = 'video';
      } else if (file.mimetype.startsWith('image/')) {
        resource_type = 'image';
      }
      return {
        folder: folder,
        resource_type: resource_type,
      };
    },
  });
  console.log('☁️ Cloudinary file storage initialized');
} else {
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, UPLOAD_PATH);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });
  console.log('📁 Local disk storage initialized (Cloudinary env keys missing)');
}

const fileFilter = (_req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10 MB
  },
});

export const getFileUrl = (file) => {
  if (!file) return '';
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  const baseUrl = process.env.BASE_URL || '';
  return `${baseUrl}/uploads/${file.filename}`;
};

export default upload;
