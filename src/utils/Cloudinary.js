import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadCloudinary = async (filePathUrl)=>{
    try{
        if(!filePathUrl) return null;
        const res=await cloudinary.uploader.upload(filePathUrl,{resource_type:'auto'});
        fs.unlinkSync(filePathUrl);
        return res;
    }
    catch(err){
       fs.unlinkSync(filePathUrl);
       return null;
    }
}

export {uploadCloudinary}