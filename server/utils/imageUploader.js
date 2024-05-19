const cloudinar = require("cloudinary").v2; 

exports.uploadImageToCloudinary = async (file,folder,height,quality)=>{ 
 console.log("printing file..",file)
 const options = {folder}; 
 if(height){
    options.height= height; 
 }  
 if(quality){
    options.quality = quality; 
 } 

 options.resource_type = "auto"; 
 
 return await cloudinar.uploader.upload(file.tempFilePath,options);

}