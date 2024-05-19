const jwt = require("jsonwebtoken");  
require("dotenv").config(); 
const User = require("../models/User");
// This function is used as middleware to authenticate user requests
exports.auth= async(req,res,next)=>{
    try{ 
        // extract token 
        const token = req.cookies.token || req.body.token 
                     || req.header("Authorization").replace("Bearer ","");
        // if token is missing return response 
        if(!token){
            return res.status(401).json({
                success:false, 
                message:"Token is missing",
            });
        } 
        // verify the token 
        try{
           const decode = jwt.verify(token,process.env.JWT_SECRET); 
           console.log(decode); 
           req.user= decode;
        } 
        catch(err){
            // verification issue  
            return res.status(401).json({
                success:false, 
                message:"token is invalid",
            });

        }  
        // If JWT is valid, move on to the next middleware or request handler
        next();
        
    } 
    catch(error){
      return res.status(401).json({
        success:false, 
        message:"something went wrong while validating token",
      })
    }
}

// isStudent  

exports.isStudent = async (req,res,next)=>{
    try {
		const userDetails = await User.findOne({ email: req.user.email });
		if (userDetails.accountType !== "Student") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
		}
		next();
	}
   catch(error){
    return res.status(500).json({
        success:false, 
        message:"User role cannot be verified, please try again"
    })
   }
}

// isInstructor  
exports.isInstructor = async (req,res,next)=>{
    try {
		const userDetails = await User.findOne({ email: req.user.email });
		console.log(userDetails);
		console.log(userDetails.accountType);

		if (userDetails.accountType !== "Instructor") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}
		next();
	}
    catch(error){
     return res.status(500).json({
         success:false, 
         message:"User role cannot be verified, please try again"
     })
    }
 }

// isAdmin 

exports.isAdmin = async (req,res,next)=>{
    try {
		const userDetails = await User.findOne({ email: req.user.email });
		if (userDetails.accountType !== "Admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	}
    catch(error){
     return res.status(500).json({
         success:false, 
         message:"User role cannot be verified, please try again"
     })
    }
 }
