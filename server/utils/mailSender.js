const nodemailer= require("nodemailer"); 

const mailSender= async (email,title,body)=>{
    try{
         let transport = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER, 
                pass:process.env.MAIL_PASS,
            }
         }) 

         let info = await transport.sendMail({
            from:'SkillSphere || -by Tauhid', 
            to:`${email}`, 
            subject:`${title}`, 
            html:`${body}`,
         }) 
         console.log(info); 
         return info
    }   
    catch(err){
        console.log(err.message);
    }
} 
module.exports= mailSender;