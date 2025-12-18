import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUpload = async (file: string, folder: string) => {
  // `file` puede ser una URL temporal o un base64 que se recibe desde el cliente.
  // En un entorno real, se recomienda firmar las subidas desde el backend
  // o usar directamente el widget de Cloudinary en el cliente.
  const result = await cloudinary.uploader.upload(file, {
    folder,
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};


