const mongoose=require("mongoose")
const Task = require('./Task');
const WeeklyReportSchema=new mongoose.Schema({
consultant:{
 type:mongoose.Schema.Types.ObjectId,
 ref:"Consultant"
},
kindergartens:[{ type: mongoose.Schema.Types.ObjectId, ref: "Kindergarten" }],
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
module.exports=mongoose.model("WeeklyReport",WeeklyReportSchema)