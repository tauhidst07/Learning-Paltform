const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator")
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender"); 
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
require("dotenv").config()




// sendOTP 
exports.sendOTP = async (req, res) => {

    try {
        // fetch email from request body 
        const { email } = req.body;

        // check if user already exist 
        const checkUserPresent = await User.findOne({ email });

        // if user already exist , then return a response 

        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already registered"
            })
        }
        // generate otp 
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })
        console.log("OTP generated", otp);

        // check unique otp or not 
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })

            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        // create an entry for OTP 

        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody)

        // return a response successful 
        res.status(200).json({
            success: true,
            message: 'OTP Sent Successfully',
            otp,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }


}
// signup  controller

exports.signup = async (req, res) => {
    try {
        // fetch data from request body 
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        // valiidation  

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {

            return res.staus(403).json({
                success: false,
                message: "All fields are required"
            })
        }

        // match password and confirm password 
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirmPassword do not match, please try again"
            })
        }

        // check user already exist or not  
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered, please sign in to continue",
            });
        }

        // find most recent OTP stored for the user  
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("recent Otp",recentOtp);

        // validate otp  
        if (recentOtp.length == 0) {
            // OTP not found 
            return res.status(400).json({
                success: false,
                message: "OTP not Found",
            })
        } else if (otp !== recentOtp[0].otp) {
            // invalid OTP 
            return res.status(400).json({
                success: false,
                message: "Invalid Otp"
            })
        }

        // hash password  
        const hashedPassword = await bcrypt.hash(password, 10)
           
        // Create the user
    let approved = ""
    approved === "Instructor" ? (approved = false) : (approved = true)
    
        // create entry in db  
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumebr: null
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        // return res 

        return res.status(200).json({
            success: true,
            message: "User regiestered Successfully",
            user,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered , Please try again"
        })
    }

}

// login  
exports.login = async (req, res) => {
    try {
        // fetch data from req body  
        const { email, password } = req.body;
        // validate data  
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required, please try again"
            });
        }
        // check user Exist or not  
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup first"
            });
        }
        // generate JWT, after password matching  
        if (await bcrypt.compare(password, user.password)) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "24h",
            })
            user.token = token;
            user.password = undefined;

            // create cookie and send respone  

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 10000),
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in Successfully"
            })

        }
        else {
           return res.status(401).json({
            success:false, 
            message:"Password is incorect"
           });
        }
    }
    catch (error) {
        console.log(error); 
        return res.status(500).json({
            success:false, 
            message:"Login failed, please try again",
        })
    }
}

// changePassword 

exports.changePassword = async (req,res)=>{ 
    try{

        // get data from req body 
        // get oldPassword, newPassword, confirmNewPassword   
        const {oldPassword,newPassword,confirmNewPassword}=req.body;
        // validation    
        if(!oldPassword || !newPassword ||!confirmNewPassword){
            return res.status(400).json({
                success:false, 
                message:"All fields are required"
            })
        } 
        if(newPassword !== confirmNewPassword){
            return res.status(400).json({
                success:false, 
                message:"new password and confirm password do not match"
            })
        }
        // get user details to match password 
        const user = await  User.findOne({_id:req.user.id}); 
        const isMatch = await bcrypt.compare(oldPassword,user.password); 
        if(!isMatch){
            return res.status(400).json({
                success:false, 
                message:"Incorrect Old Password "
            })
        } 
        // hash password 
        const hashedPassword = await bcrypt.hash(newPassword,10)
        // update pwd in DB    
       const updatedUserDetails = await User.findOneAndUpdate(
            {_id:req.user.id},  
            {password:hashedPassword},
            {new:true}
        )
        console.log("updated user",updatedUserDetails)
      	// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				"SkillSpehere - Password Updated",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}
        // return response 
        return res.status(200).json({
            success:true, 
            message:"Password changed successfully"
        })
    } 
    catch(error){
        console.log(error); 
        return res.status(500).json({
            success:false, 
            message:"Failed to change password, please try again"
        })
    }
}