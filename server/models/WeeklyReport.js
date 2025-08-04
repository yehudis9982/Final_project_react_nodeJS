const mongoose=require("mongoose")
const Task = require('./Task');

// סכמה ליום עבודה בודד
const DailyWorkSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6 // 0=ראשון, 6=שבת
    },
    kindergartens: [{ 
        kindergarten: { type: mongoose.Schema.Types.ObjectId, ref: "Kindergarten" },
        startTime: { type: String }, // שעת התחלה
        endTime: { type: String },   // שעת סיום
        notes: { type: String }      // הערות על הביקור
    }],
    tasks: [{
        task: Task.schema,
        startTime: { type: String },
        endTime: { type: String },
        notes: { type: String }
    }],
    totalHours: {
        type: Number,
        default: 0
    },
    notes: {
        type: String // הערות כלליות ליום
    }
}, { _id: true });

const WeeklyReportSchema=new mongoose.Schema({
consultant:{
 type:mongoose.Schema.Types.ObjectId,
 ref:"Consultant"
},
weekStartDate:{
 type: Date,
 required: true
},
// פירוט יומי של העבודה
dailyWork: [DailyWorkSchema],
// סיכום שבועי
weeklyTotalHours: {
    type: Number,
    default: 0
},
generalNotes: {
    type: String
},
status: {
    type: String,
    enum: ["Draft", "Submitted", "Approved", "Rejected"],
    default: "Draft"
},
},{ timestamps:true})
module.exports=mongoose.model("WeeklyReport",WeeklyReportSchema)