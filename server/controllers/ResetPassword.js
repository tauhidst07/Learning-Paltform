const User= require("../models/User"); 
const mailSender= require("../utils/mailSender") 
const crypto = require("crypto") 
const bcrypt = require("bcrypt")
// resetPasswordToken  
exports.resetPasswordToken= async (req,res)=>{
  
  try{ 

      // get email from req body  
      const email = req.body.email;

      // validate email , check user exist for this email 
      const user= await User.findOne({email:email}); 
      if(!user){
          return res.json({
              success:false, 
              message:"Email is not registered with us"
          });
      }    
  
      // generate token  
      const token = crypto.randomUUID();
      // update user by adding token and expiration time 
      const updatedDetails= await User.findOneAndUpdate(
                                  {email:email},
                                  {
                                      token:token, 
                                      resetPasswordExpires:Date.now()+5*60*1000,
                                  }, 
                                  {new:true} 
                                  );
      // create url  
      const url = `http://localhost:3000/update-password/${token}`;
      // send mail containing url  
      await mailSender(email,
          "password Reset Link", 
          `Password Reset Link:${url}`
          )
      // return response 
      return res.json({
          success:true, 
          message:`Email sent Successfully , please check email and change password`
      })

  } 
  catch(error){
    console.log(error); 
    return res.status(500).json({
        success:false, 
        message:"something went wrong while sending reset password mail"
    })
  }

     

}

// resetPassword  

exports.resetPassword = async (req,res)=>{ 

    try{
        // data fetch  
        const {password,confirmPassword, token} = req.body;
        // validation  
        if(password !== confirmPassword){
            return res.json({
              success:false, 
              message:'Password and confirm password are not matching'
            })
        }
        // get userdetails from db using token  
        const userDetails= await User.findOne({token: token});
        // if not entry - Invalid token  
        if(!userDetails){
            return res.json({
                succcess:false, 
                message:"Token is invalid",
            })
        }
        // check token time  
        if(userDetails.resetPasswordExpires < Date.now()){
              return res.json({
                succcess:false, 
                message:"Token is expired, please regenerate your password",
              })
        }
        // hash password  
        const hashedPassword = await bcrypt.hash(password,10); 

        // update password   
        await User.findOneAndUpdate(
            {token:token}, 
            {password:hashedPassword}, 
            {new:true},
            )
        // return response 
        return res.status(200).json({
            success:true,  
            message:"password reset successfully"

        })

    } 
    catch(error){
        console.log(error); 
      return res.status(500).json({
        success:false, 
        message:"something went wrong while resetting Password"
    })
    } 

}