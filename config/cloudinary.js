import { v2 as cloudinary } from 'cloudinary';

// Validate environment variables
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  console.warn('⚠️  Cloudinary environment variables are missing!');
  if (!cloudName) console.error('  - CLOUD_NAME');
  console.warn('Please add CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET to your .env file');
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

console.log('✓ Cloudinary configured with cloud name:', process.env.CLOUD_NAME);

export default cloudinary;
