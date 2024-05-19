const Section = require("../models/Section"); 
const Course = require("../models/Course"); 
 
// createSection Handler 

exports.createSection = async (req,res)=>{
    try{
        //  data fetch  
        const {sectionName, courseId} = req.body; 
        // data validation  
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false, 
                message:"Missing Properties",
            })
        } 
        const ifCourse = Course.findById(courseId); 
        if(!ifCourse){
            return res.status(200).json({
                success:false, 
                message:"Course not found",
            })
        }
        // create section  
        const newSection = await Section.create({sectionName});
        // update course with section ObjectID    
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId, 
            {
                $push:{
                    courseContent:newSection._id,
                }
            }, 
            {new:true}
        ).populate({
            path:"courseContent", 
            populate:{
                path:"subSection"
            }
        }).exec()
        // use populate to replace section and sub section both in the updatedCourseDetails 
          
        // return response 
        return res.status(200).json({
            success:true, 
            message:"Section created Successfully", 
            updatedCourseDetails
        }) 

    } 
    catch(error){
         return res.status(500).json({
            success:false, 
            message:"unable to create section, please try again", 
            error:error.message,
         })
    }
} 


// updateSection Handler 

exports.updateSection = async (req,res)=>{
    try{
        // data input  
        const {sectionName,sectionId} = req.body;
        // data validation  
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false, 
                message:"Missing Properties",
            })
        }
        // update data  
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId, {sectionName}, {new:true}
        )
        // return response  
        return res.status(200).json({
            success:true, 
            message:"Section updated successfully"
        })
    } 
    catch(error){
        return res.status(500).json({
           success:false, 
           message:"unable to update section, please try again", 
           error:error.message,
        })
   }
} 
 
// delete section handler  


exports.deleteSection = async (req, res) => {
	try {
		const { sectionId,courseId } = req.body;
		await Section.findByIdAndDelete(sectionId);
		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
		res.status(200).json({
			success: true,
			message: "Section deleted",
			updatedCourse,
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};