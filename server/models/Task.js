const mongoose=require("mongoose")
const TaskSchema=new mongoose.Schema({
title:{
    type:String,
    required:true
},
body:{
    type:String
},

},{ timestamps:true})
module.exports=TaskSchema