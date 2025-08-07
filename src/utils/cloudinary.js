import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_KEY_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCLoudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uplaoded successfully
    console.log("File is upload on Cloudinary ",uploadResult.url)

    // if(fs.existsSync(localFilePath)){
    // fs.unlinkSync(localFilePath);
    //  return uploadResult;
    // }else{
    //   console.log("file Delete or not found:",localFilePath)
    // }
    fs.unlinkSync(localFilePath)
    return uploadResult
   
  } catch (err) {
    fs.unlinkSync(localFilePath);
    console.log("File UploadFailed to Cloudinary:", err);
    return null;
    // remove the locally saved temp file as the upload operation got failed
  }
};

export { uploadOnCLoudinary };
