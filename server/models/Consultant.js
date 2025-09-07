const mongoose=require("mongoose")
const Task = require('./Task');
const SupervisorNoteSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Consultant", required: true }, // המפקחת
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  pinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

SupervisorNoteSchema.pre("save", function(next){
  this.updatedAt = new Date();
  next();
});
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
// ימי עבודה עם שעות ספציפיות לכל יום
workSchedule: [{
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6 // 0=ראשון, 6=שבת
    },
    startHour: {
        type: String,
        required: function() { return this.isWorkDay; },
        default: "08:00"
    },
    endHour: {
        type: String,
        required: function() { return this.isWorkDay; },
        default: "16:00"
    },
    isWorkDay: {
        type: Boolean,
        default: true
    }
}],
task:[Task.schema],
kindergartens:[{ type: mongoose.Schema.Types.ObjectId, ref: "Kindergarten" }],
roles:{
    type:String,
    enum:["Supervisor","Consultant"],
    default:"Consultant"
},
supervisorNotes: [SupervisorNoteSchema],
},{ timestamps:true})
module.exports=mongoose.model("Consultant",ConsultantSchema)