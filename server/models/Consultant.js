const mongoose=require("mongoose")
const Task = require('./Task');
const ConsultantSchema=new mongoose.Schema({
firstName:{
    type:String,
    required:true
},
lastName:{
    type:String,
    required:true
},
tz:{
    type:String,
    required:true,
    maxLength:9,
    immutable:true
},
password:{
    type:String,
    required:true
},
phone:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true
},
task:[Task.schema],
kindergartens:[{ type: mongoose.Schema.Types.ObjectId, ref: "Kindergarten" }],
roles:{
    type:String,
    enum:["Supervisor","Consultant"],
    default:"Consultant"
},
},{ timestamps:true})
module.exports=mongoose.model("Consultant",ConsultantSchema)