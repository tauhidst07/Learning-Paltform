// const SubSection = require("../models/SubSection"); 
// const Section = require("../models/Section"); 
// const { uploadImageToCloudinary } = require("../utils/imageUploader");

// // create SucSection 

// exports.createSubSection = async (req,res)=>{
//     try{

//     // fetch data from req body  
//     const {sectionId, title, timeDuration, description} = req.body;
//     // fetch file/video  
//     const video = req.files.videoFile;
//     // validation  
//     if(!sectionId || !title || !timeDuration || !description || !video){
//         return res.status(400).json({
//             success:false, 
//             message:"All fields are required"
//         })
//     }
//     // upload video to cloudinary  
//     const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME)
//     // create a sub section  
//     const subSectionDetails = await SubSection.create({
//         title:title, 
//         timeDuration:timeDuration,  
//         description:description, 
//         videoUrl: uploadDetails.secure_url,

//     })
//     // update section with this sub section ObjectId  
//     const updatedSection = await Section.findByIdAndUpdate(
//         {_id:sectionId}, 
//         {
//             $push:{
//                 subSection:subSectionDetails._id,
//             }
//         }, 
//         {new:true}
//     ).populate("subSection").exec() 
//     // log updated section here after adding populate query
//     // return response   
//       return res.status(200).json({
//         success:true, 
//         message:"Sub Section created Successfully", 
//         updatedSection,
//       })

//     } 
//     catch(error){
//       return res.status(500).json({
//         success:false, 
//         message:"Something went wrong while creating subSection", 
//         error:error.message 

//     })
//     }
// }  


// // HW updateSubSection  
// exports.updateSubSection = async (req,res)=>{
//    try{ 

//     // fetch data  
//     const {title, timeDuration, description} = req.body; 
//     const {subSectionId} = req.params;
//     // fetch new video  
//     const newVideo = req.files.videoFile;
//     // validation   
//     const subSection = await SubSection.findById(subSectionId); 
//     if(!subSection){
//         return res.status(404).json({
//             success:false, 
//             message:"Subsection not found"
//         })
//     }
//     if( !title || !timeDuration || !description || !video){
//         return res.status(400).json({
//             success:false, 
//             message:"All fields are required"
//         })
//     }
//     // upload new video 
//     const uploadDetails = uploadImageToCloudinary(newVideo,process.env.FOLDER_NAME); 
//     // update data by Id  
//     const updatedSubSectionDetails=await  SubSection.findByIdAndUpdate(
//                              {_id:subSectionId}, 
//                             {title:title,
//                             timeDuration:timeDuration, 
//                             description:description,
//                             videoUrl:uploadDetails.secure_url
//                             }, 
//                             {new:true}
//                             )
//     // return response  
//     return res.status(200).json({
//         success:true, 
//         message:"sub section updated successfully", 
//         updatedSubSectionDetails,
//     })

//    } 
//    catch(error){
//     return res.status(500).json({
//         success:false, 
//         message:"Something went wrong while updating subSection", 
//         error:error.message,
//     })
//    }
// }
// // HW deleteSubSection 

// exports.deleteSubSection = async (req,res)=>{ 

//     try{

//     // fetch section and subSection Id  
//     const {sectionId}= req.body; 
//     const {subSectionId}= req.params; 

//     // validation
//     const subSection = await SubSection.findById(subSectionId); 
//     if(!subSection){
//         return res.status(404).json({
//             success:false, 
//             message:"sub section not found"
//         })
//     } 
//     const section = await Section.findById(sectionId); 
//     if(!section){
//         return res.status(404).json({
//             success:false, 
//             message:"section not found"
//         })
//     } 

//     // delete sub section from Section
//      await Section.findByIdAndUpdate(
//         {_id:section}, 
//         {
//             $pull:{
//                subSection:subSectionId 
//             }
//         }
//      ) 

//     //  delete subsection 
//     await SubSection.findByIdAndDelete({_id:subSectionId}) 

//     // return response 
//      return res.status(200).json({
//         success:true, 
//         message:"subsection deleted successfully"
//      })


//     } 

//     catch(error){
//         return res.status(500).json({
//             success:false, 
//             message:"Something went wrong while deleting subSection", 
//             error:error.message,
//         })
//        }
 
// } 

// Import necessary modules
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
	try {
		// Extract necessary information from the request body
		const { sectionId, title , description,courseId } = req.body;
		const video = req.files.videoFile;

		// Check if all necessary fields are provided
		if (!sectionId || !title || !description || !video || !courseId ) {
			return res
				.status(404)
				.json({ success: false, message: "All Fields are Required" });
		}

		const ifsection= await Section.findById(sectionId);
		if (!ifsection) {
            return res
                .status(404)
                .json({ success: false, message: "Section not found" });
        }


		// Upload the video file to Cloudinary
		const uploadDetails = await uploadImageToCloudinary(
			video,
			process.env.FOLDER_VIDEO
		);

		console.log(uploadDetails);
		// Create a new sub-section with the necessary information
		const SubSectionDetails = await SubSection.create({
			title: title,
			// timeDuration: timeDuration,
			description: description,
			videoUrl: uploadDetails.secure_url,
		});

		// Update the corresponding section with the newly created sub-section
		const updatedSection = await Section.findByIdAndUpdate(
			{ _id: sectionId },
			{ $push: { subSection: SubSectionDetails._id } },
			{ new: true }
		).populate("subSection");

		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
		// Return the updated section in the response
		return res.status(200).json({ success: true, data: updatedCourse });
	} catch (error) {
		// Handle any errors that may occur during the process
		console.error("Error creating new sub-section:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};


// UPDATE a sub-section
exports.updateSubSection = async (req,res) => {

	try {
		// Extract necessary information from the request body
		const { SubsectionId, title , description,courseId } = req.body;
		const video = req?.files?.videoFile;

		
		let uploadDetails = null;
		// Upload the video file to Cloudinary
		if(video){
		 uploadDetails = await uploadImageToCloudinary(
			video,
			process.env.FOLDER_VIDEO
		);
		}

		// Create a new sub-section with the necessary information
		const SubSectionDetails = await SubSection.findByIdAndUpdate({_id:SubsectionId},{
			title: title || SubSection.title,
			// timeDuration: timeDuration,
			description: description || SubSection.description,
			videoUrl: uploadDetails?.secure_url || SubSection.videoUrl,
		},{ new: true });

		
		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
		// Return the updated section in the response
		return res.status(200).json({ success: true, data: updatedCourse });
	} catch (error) {
		// Handle any errors that may occur during the process
		console.error("Error creating new sub-section:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}

}


exports.deleteSubSection = async(req, res) => {

	try {
		const {subSectionId,courseId} = req.body;
		const sectionId=req.body.sectionId;
	if(!subSectionId || !sectionId){
		return res.status(404).json({
            success: false,
            message: "all fields are required",
        });
	}
	const ifsubSection = await SubSection.findById({_id:subSectionId});
	const ifsection= await Section.findById({_id:sectionId});
	if(!ifsubSection){
		return res.status(404).json({
            success: false,
            message: "Sub-section not found",
        });
	}
	if(!ifsection){
		return res.status(404).json({
            success: false,
            message: "Section not found",
        });
    }
	await SubSection.findByIdAndDelete(subSectionId);
	await Section.findByIdAndUpdate({_id:sectionId},{$pull:{subSection:subSectionId}},{new:true});
	const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
	return res.status(200).json({ success: true, message: "Sub-section deleted", data: updatedCourse });
		
	} catch (error) {
		// Handle any errors that may occur during the process
        console.error("Error deleting sub-section:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
		
	}
};