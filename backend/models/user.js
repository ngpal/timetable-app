import mongoose from "mongoose";
 const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    role: { 
        type: String, 
        enum: ['Admin', 'Student', 'Faculty'], 
        default: 'Student' 
      }
 },{timestamps:true});

 const User = mongoose.model('User',userSchema,'users');

 export default User;