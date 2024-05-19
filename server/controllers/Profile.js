const User = require("../models/User"); 
const Profile = require("../models/Profile");  
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader"); 
const { convertSecondsToDuration } = require("../utils/secToDuration"); 
const CourseProgress = require("../models/CourseProgress")


// updateProfile handler 

exports.updateProfile = async (req, res)=>{
    try{
        // fetch data   
        const {dateOfBirth="", about="",contactNumber, gender} = req.body;
        // get user id  
        const id = req.user.id;
        // validation  
        if(!contactNumber || !gender){
            return res.status(400).json({
                success:false, 
                message:"All fileds are required"
            })
        }
        //  find profile  
        const userDetails = await User.findById(id); 
        const profileId = userDetails.additionalDetails;   
        const profileDetails = await Profile.findById(profileId); 
        // update profile 
        profileDetails.dateOfBirth = dateOfBirth;  
        profileDetails.about= about; 
        profileDetails.gender = gender; 
        profileDetails.contactNumebr = contactNumber; 
        await profileDetails.save();

        // return response  
        return res.status(200).json({
            success:true, 
            message:"Profile updated Successfully", 
            profileDetails
        });

    } 
    catch(error){
      return res.status(500).json({
        success:false, 
        message:"something went wrong while updating profile", 
        error:error.message,
      })
    }
} 

// deleteAccount 
// Explore -> how can we schedule this deletion operation
exports.deleteAccount = async (req,res)=>{
    try{ 
        // get Id  
        const id = req.user.id;  
        console.log("user id..",id)
        // validation  
        const userDetails = await User.findById({_id:id}).exec();  
        if(!userDetails){
            return res.status(404).json({
                success:false, 
                message:"User not found"
            })
        }  
        // const user = userDetails.schema.obj;
        console.log("user..",userDetails)
        // delete profile 
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails}) 
        // Todo: Hw unenroll user form all enroll courses   
        // const enrolledCourses = userDetails.courses; 
        // for(const courseId  of enrolledCourses){
        //     await Course.findByIdAndUpdate({_id:courseId},{
        //         $pull:{
        //            studentsEnrolled:id, 
        //         }
        //     })
        // }
        
        // delet user   
        console.log("just before user deletion..")
        await User.findByIdAndDelete({_id:id}) 
        // return response  
        return res.status(200).json({
            success:true, 
            message:"User deleted"
        })

    } 
    catch(error){
        return res.status(500).json({
          success:false, 
          message:"something went wrong while deleting profile", 
          error:error.message,
        })
      }
} 

// getUserDetails 

exports.getAllUserDetails = async (req,res)=>{
    try{

    // get id 
    const id = req.user.id; 
    // validation and get user details 
    const userDetails = await User.findById(id).populate("additionalDetails").exec()
    if(!userDetails){
       return res.status(404).json({
        success:false, 
        message:"User not Found"
       });
    }
    // return response 
    return res.status(200).json({
        success:true, 
        message:"User Data fetched Successfully", 
        userDetails
    });

    } 
    catch(error){
    return res.status(500).json({
        success:false, 
        message:"Something went wrong while fetching userDetails", 
        error:error.message
    })
    }
} 

// update display picture 

// exports.updateDisplayPicture = async (req, res)=>{
//     try{ 
//     //  fetch file
//       const displayPicture = req.files.displayPicture;  
//       const userId = req.user.id;  
//     //   upload image to cloudinary
//       const image = await uploadImageToCloudinary(
//         displayPicture, 
//         process.env.FOLDER_NAME, 
//         1000, 
//         1000
//       ) 
//       console.log(image); 
//     //   update user profile 
//       const updatedProfile = await User.findByIdAndUpdate(
//         userId, 
//         {image:image.secure_url}, 
//         {new:true},
//       ) 
//     // return response 
//      return res.send({
//         success:true, 
//         message:"Profile picture updated successfully", 
//         data:updatedProfile
//     })
//     } 
//     catch(error){
//        return res.status(500).json({
//         success:false, 
//         message:error.message,
//        })
//     }
// }  
exports.updateDisplayPicture = async (req, res) => {
	try {

		const id = req.user.id;
	const user = await User.findById(id);
	if (!user) {
		return res.status(404).json({
            success: false,
            message: "User not found",
        });
	}
	const image = req.files.pfp;
	if (!image) {
		return res.status(404).json({
            success: false,
            message: "Image not found",
        });
    }
	const uploadDetails = await uploadImageToCloudinary(
		image,
		process.env.FOLDER_NAME
	);
	console.log(uploadDetails);

	const updatedImage = await User.findByIdAndUpdate({_id:id},{image:uploadDetails.secure_url},{ new: true });

    res.status(200).json({
        success: true,
        message: "Image updated successfully",
        data: updatedImage,
    });
		
	} catch (error) {
		return res.status(500).json({
            success: false,
            message: error.message,
        });
		
	}



}

// get enrolled courses 

// exports.getEnrolledCourses = async (req, res) => {
//     try {
//       const userId = req.user.id
//       let userDetails = await User.findOne({
//         _id: userId,
//       })
//         .populate({
//           path: "courses",
//           populate: {
//             path: "courseContent",
//             populate: {
//               path: "subSection",
//             },
//           },
//         })
//         .populate("courseProgress") 
//         .exec()
//       userDetails = userDetails.toObject()
//       var SubsectionLength = 0
//       for (var i = 0; i < userDetails.courses.length; i++) {
//         let totalDurationInSeconds = 0
//         SubsectionLength = 0
//         for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
//           totalDurationInSeconds += userDetails.courses[i].courseContent[
//             j
//           ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
//           userDetails.courses[i].totalDuration = convertSecondsToDuration(
//             totalDurationInSeconds
//           )
//           SubsectionLength +=
//             userDetails.courses[i].courseContent[j].subSection.length
//         }
//         let courseProgressCount = await CourseProgress.findOne({
//           courseID: userDetails.courses[i]._id,
//           userId: userId,
//         })
//         courseProgressCount = courseProgressCount?.completedVideos.length
//         if (SubsectionLength === 0) {
//           userDetails.courses[i].progressPercentage = 100
//         } else {
//           // To make it up to 2 decimal point
//           const multiplier = Math.pow(10, 2)
//           userDetails.courses[i].progressPercentage =
//             Math.round(
//               (courseProgressCount / SubsectionLength) * 100 * multiplier
//             ) / multiplier
//         }
//       }
  
//       if (!userDetails) {
//         return res.status(400).json({
//           success: false,
//           message: `Could not find user with id: ${userDetails}`,
//         })
//       }
//       return res.status(200).json({
//         success: true,
//         data: userDetails,
//       })
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       })
//     }
//   }  
exports.getEnrolledCourses=async (req,res) => {
	try {
        const id = req.user.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const enrolledCourses = await User.findById(id).populate({
			path : "courses",
				populate : {
					path: "courseContent",
			}
		}
		).populate("courseProgress").exec();
        // console.log(enrolledCourses);
        res.status(200).json({
            success: true,
            message: "User Data fetched successfully",
            data: enrolledCourses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
// intsructor Dashboard
exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({
        success:true, 
        data:courseData,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }