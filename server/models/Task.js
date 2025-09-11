const mongoose=require("mongoose")
const TaskSchema=new mongoose.Schema({
title:{
    type:String,
    required:true
},
body:{
    type:String
},
completed: { 
    type: Boolean, 
    default: false } ,
consultant:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Consultant"
},
},{ timestamps:true})
module.exports=mongoose.model("Task",TaskSchema)