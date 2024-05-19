const mongoose= require("mongoose"); 
require("dotenv").config(); 

exports.connect= ()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log("Database connected Successfully")
    })
    .catch((err)=>{ 
        console.log("DB connection failed")
        console.error(err); 
        process.exit(1)
    })
}