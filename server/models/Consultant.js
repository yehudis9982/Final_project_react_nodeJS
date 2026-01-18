const mongoose=require("mongoose")
const Task = require('./Task');
const SupervisorSettingsSchema = new mongoose.Schema({
  profile: {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    tz: { type: String, default: "" },
  },
  notifications: {
    emailEnabled: { type: Boolean, default: true },
    systemEnabled: { type: Boolean, default: true },
    weeklySummary: { type: String, default: "weekly" },
    quietHoursStart: { type: String, default: "22:00" },
    quietHoursEnd: { type: String, default: "07:00" },
    reportMissing: { type: Boolean, default: true },
    taskOverdue: { type: Boolean, default: true },
  },
  rulesTemplates: {
    defaultReportStatus: { type: String, default: "Draft" },
    requireDailyNotes: { type: Boolean, default: false },
    minWeeklyHours: { type: Number, default: 0 },
    templateName: { type: String, default: "" },
  },
  display: {
    theme: { type: String, default: "light" },
    density: { type: String, default: "comfortable" },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    showReportsColumn: { type: Boolean, default: true },
    showTasksColumn: { type: Boolean, default: true },
    showKindergartensColumn: { type: Boolean, default: true },
  },
  logs: {
    keepDays: { type: Number, default: 30 },
  },
}, { _id: false });
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
supervisorSettings: { type: SupervisorSettingsSchema, default: () => ({}) },
},{ timestamps:true})
module.exports=mongoose.model("Consultant",ConsultantSchema)
