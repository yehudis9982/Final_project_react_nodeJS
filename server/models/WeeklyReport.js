const mongoose=require("mongoose")
const Task = require('./Task');
const WeeklyReportSchema=new mongoose.Schema({
consultant:{
 type:mongoose.Schema.Types.ObjectId,
 ref:"Consultant"
},
kindergartens:[{ type: mongoose.Schema.Types.ObjectId, ref: "Kindergarten" }],
task:[Task.schema],
weeklyDate:{
 type: Date,
 required: true
},
},{ timestamps:true})
module.exports=mongoose.model("WeeklyReport",WeeklyReportSchema)