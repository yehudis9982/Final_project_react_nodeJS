const WeeklyReport=require("../models/WeeklyReport")
const Consultant=require("../models/Consultant")

// פונקציה עזר לחישוב הפרש שעות
const calculateHoursDifference = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    return (endTotalMinutes - startTotalMinutes) / 60;
}

//כל הלוחות השבועיים
const getAllWeeklyReport=async(req,res)=>{
    if(req.consultant.roles==="Supervisor"){
        const weeklyReport=await WeeklyReport.find({},{password:0})
            .populate('consultant')
            .populate('dailyWork.kindergartens.kindergarten')
            .sort({weekStartDate:-1})
        res.json(weeklyReport)
    }else{
        const weeklyReport=await WeeklyReport.find({consultant:req.consultant._id},{password:0})
            .populate('consultant')
            .populate('dailyWork.kindergartens.kindergarten')
            .sort({weekStartDate:-1})
        res.json(weeklyReport)
    }
    
}
//הוספת לוח שבועי
const addWeeklyReport=async (req,res)=>{
    const{consultant, weekStartDate, dailyWork, generalNotes}=req.body
    if(!weekStartDate){return res.status(400).json({"message":"weekStartDate is required!"})}
    if(!consultant&&req.consultant.roles=="Supervisor"){return res.status(400).json({"message":"consultant is required!"})}
   
   const newConsultant=req.consultant.roles==="Supervisor"?consultant:req.consultant._id
   
   // בדיקה שלא קיים דוח לאותו שבוע
   if(await WeeklyReport.findOne({consultant:newConsultant, weekStartDate}).exec())
        return res.status(400).send("Weekly report for this consultant and week already exists!")
   
   // קבלת פרטי היועצת לבדיקת ימי העבודה
   const consultantData = await Consultant.findById(newConsultant);
   if(!consultantData){
       return res.status(400).json({"message":"Consultant not found!"})
   }
   
   // חישוב סה"כ שעות וודא שהימים תואמים לימי העבודה
   let totalHours = 0;
   if(dailyWork){
       for(let day of dailyWork){
           // בדיקה שהיום הוא יום עבודה של היועצת
           const workDay = consultantData.workSchedule.find(schedule => 
               schedule.dayOfWeek === day.dayOfWeek && schedule.isWorkDay
           );
           if(!workDay){
               return res.status(400).json({
                   "message": `Day ${day.dayOfWeek} is not a work day for this consultant.`
               })
           }
           totalHours += day.totalHours || 0;
       }
   }
   
   const weeklyReport=await WeeklyReport.create({
       consultant: newConsultant,
       weekStartDate,
       dailyWork: dailyWork || [],
       weeklyTotalHours: totalHours,
       generalNotes: generalNotes || "",
       status: "Draft"
   })
   
   const populatedReport = await WeeklyReport.findById(weeklyReport._id)
       .populate('consultant')
       .populate('dailyWork.kindergartens.kindergarten')
   
   res.json(populatedReport)
 }
//מחיקת לוח שבועי
const deleteWeeklyReport=async (req,res)=>{
    const{_id}=req.body
    const weeklyReport=await WeeklyReport.findById(_id).exec()
    if(!weeklyReport){ return res.status(400).json({"message":"no weeklyReport found!"})}
    
    // בדיקת הרשאות - רק Supervisor או היועץ שיצר את הדוח יכול למחוק
    if(req.consultant.roles !== "Supervisor" && !weeklyReport.consultant.equals(req.consultant._id)){
        return res.status(403).json({"message":"You are not authorized to delete this weekly report!"})
    }
    
    await weeklyReport.deleteOne()
    res.json(`WeeklyReport id: ${weeklyReport._id} deleted`)
}
//עדכון לוח שבועי
const updateWeeklyReport=async(req,res)=> {
//עדכון לוח שבועי
const updateWeeklyReport=async(req,res)=> {
    const {consultant, weekStartDate, dailyWork, generalNotes, status}=req.body
    const{_id}=req.params    
    const weeklyReport=await WeeklyReport.findById(_id)
    if(!weeklyReport){ return res.status(400).json({"message":"no weeklyReport found!"})}
    
    // בדיקת הרשאות - רק Supervisor או היועץ שיצר את הדוח יכול לעדכן
    if(req.consultant.roles !== "Supervisor" && !weeklyReport.consultant.equals(req.consultant._id)){
        return res.status(403).json({"message":"You are not authorized to update this weekly report!"})
    }
    
    // Supervisor יכול לשנות את היועץ, יועץ רגיל לא יכול
    if(consultant && req.consultant.roles !== "Supervisor"){
        return res.status(403).json({"message":"Only Supervisor can change consultant assignment!"})
    }
    
    // קבלת פרטי היועצת לבדיקת ימי העבודה
    const consultantId = consultant || weeklyReport.consultant;
    const consultantData = await Consultant.findById(consultantId);
    if(!consultantData){
        return res.status(400).json({"message":"Consultant not found!"})
    }
    
    // חישוב סה"כ שעות וודא שהימים תואמים לימי העבודה
    let totalHours = weeklyReport.weeklyTotalHours;
    if(dailyWork){
        totalHours = 0;
        for(let day of dailyWork){
            // בדיקה שהיום הוא יום עבודה של היועצת
            const workDay = consultantData.workSchedule.find(schedule => 
                schedule.dayOfWeek === day.dayOfWeek && schedule.isWorkDay
            );
            if(!workDay){
                return res.status(400).json({
                    "message": `Day ${day.dayOfWeek} is not a work day for this consultant.`
                })
            }
            totalHours += day.totalHours || 0;
        }
    }
    
    if(consultant) weeklyReport.consultant = consultant
    if(weekStartDate) weeklyReport.weekStartDate = weekStartDate
    if(dailyWork) weeklyReport.dailyWork = dailyWork
    if(generalNotes !== undefined) weeklyReport.generalNotes = generalNotes
    if(status) weeklyReport.status = status
    weeklyReport.weeklyTotalHours = totalHours
    
    await weeklyReport.save();
    
    const populatedReport = await WeeklyReport.findById(weeklyReport._id)
        .populate('consultant')
        .populate('dailyWork.kindergartens.kindergarten')
    
    res.json(populatedReport)
}
}
//קבלת לוח שבועי בודד
const getWeeklyReportByID=async(req,res)=>{
    const{_id}=req.params
    const weeklyReport=await WeeklyReport.findById(_id)
        .populate('consultant')
        .populate('dailyWork.kindergartens.kindergarten')
    if(!weeklyReport){ return res.status(400).json({"message":"no weeklyReport found!"})}
    
    // בדיקת הרשאות - רק Supervisor או היועץ שיצר את הדוח יכול לראות
    if(req.consultant.roles !== "Supervisor" && !weeklyReport.consultant._id.equals(req.consultant._id)){
        return res.status(403).json({"message":"You are not authorized to view this weekly report!"})
    }
    
    res.json(weeklyReport)
}

//קבלת דוחות שבועיים לפי תאריך
const getWeeklyReportsByDate=async(req,res)=>{
    const{weekStartDate}=req.params
    const startDate = new Date(weekStartDate)
    const endDate = new Date(weekStartDate)
    endDate.setDate(endDate.getDate() + 6) // שבוע שלם
    
    let filter = {
        weekStartDate: { $gte: startDate, $lte: endDate }
    }
    
    // אם זה לא Supervisor, מציג רק את הדוחות של היועץ הנוכחי
    if(req.consultant.roles !== "Supervisor"){
        filter.consultant = req.consultant._id
    }
    
    const weeklyReports=await WeeklyReport.find(filter)
        .populate('consultant')
        .populate('dailyWork.kindergartens.kindergarten')
    
    res.json(weeklyReports)
}

// פונקציה חדשה: יצירת תבנית דוח שבועי לפי ימי העבודה של היועצת
const createWeeklyTemplate=async(req,res)=>{
    const{weekStartDate}=req.body
    if(!weekStartDate){return res.status(400).json({"message":"weekStartDate is required!"})}
    
    const consultantId = req.consultant._id;
    const consultantData = await Consultant.findById(consultantId);
    if(!consultantData){
        return res.status(400).json({"message":"Consultant not found!"})
    }
    
    // בדיקה שלא קיים דוח לאותו שבוע
    if(await WeeklyReport.findOne({consultant:consultantId, weekStartDate}).exec())
        return res.status(400).send("Weekly report for this week already exists!")
    
    // יצירת תבנית ימי עבודה
    const dailyWork = [];
    const startDate = new Date(weekStartDate);
    
    for(let i = 0; i < 7; i++){
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dayOfWeek = currentDate.getDay();
        
        // חיפוש יום העבודה בלוח הזמנים של היועצת
        const workDay = consultantData.workSchedule.find(schedule => 
            schedule.dayOfWeek === dayOfWeek && schedule.isWorkDay
        );
        
        // אם זה יום עבודה של היועצת, הוסף אותו לתבנית
        if(workDay){
            dailyWork.push({
                date: currentDate,
                dayOfWeek: dayOfWeek,
                kindergartens: [],
                tasks: [],
                totalHours: 0,
                notes: "",
                plannedStartHour: workDay.startHour,
                plannedEndHour: workDay.endHour,
                plannedHours: calculateHoursDifference(workDay.startHour, workDay.endHour)
            });
        }
    }
    
    const weeklyReport = await WeeklyReport.create({
        consultant: consultantId,
        weekStartDate,
        dailyWork,
        weeklyTotalHours: 0,
        generalNotes: "",
        status: "Draft"
    });
    
    const populatedReport = await WeeklyReport.findById(weeklyReport._id)
        .populate('consultant')
        .populate('dailyWork.kindergartens.kindergarten')
    
    res.json(populatedReport);
}

// פונקציה להוספת יום עבודה ספציפי לדוח קיים
const addDailyWork=async(req,res)=>{
    const{_id}=req.params
    const{date,dayOfWeek,kindergartens,tasks,totalHours,notes}=req.body
    
    if(!date || dayOfWeek === undefined){
        return res.status(400).json({"message":"date and dayOfWeek are required!"})
    }
    
    const weeklyReport=await WeeklyReport.findById(_id)
    if(!weeklyReport){ return res.status(400).json({"message":"no weeklyReport found!"})}
    
    // בדיקת הרשאות
    if(req.consultant.roles !== "Supervisor" && !weeklyReport.consultant.equals(req.consultant._id)){
        return res.status(403).json({"message":"You are not authorized to update this weekly report!"})
    }
    
    // קבלת פרטי היועצת לבדיקת ימי העבודה
    const consultantData = await Consultant.findById(weeklyReport.consultant);
    if(!consultantData.workSchedule.find(schedule => 
        schedule.dayOfWeek === dayOfWeek && schedule.isWorkDay
    )){
        return res.status(400).json({
            "message": `Day ${dayOfWeek} is not a work day for this consultant.`
        })
    }
    
    // בדיקה שהיום לא קיים כבר
    const existingDay = weeklyReport.dailyWork.find(day => 
        day.date.toDateString() === new Date(date).toDateString()
    );
    if(existingDay){
        return res.status(400).json({"message":"Daily work for this date already exists!"})
    }
    
    const newDailyWork = {
        date: new Date(date),
        dayOfWeek,
        kindergartens: kindergartens || [],
        tasks: tasks || [],
        totalHours: totalHours || 0,
        notes: notes || ""
    };
    
    weeklyReport.dailyWork.push(newDailyWork);
    weeklyReport.weeklyTotalHours += totalHours || 0;
    
    await weeklyReport.save();
    
    const populatedReport = await WeeklyReport.findById(weeklyReport._id)
        .populate('consultant')
        .populate('dailyWork.kindergartens.kindergarten')
    
    res.json(populatedReport);
}

// פונקציה לעדכון יום עבודה ספציפי
const updateDailyWork=async(req,res)=>{
    const{_id,dailyWorkId}=req.params
    const{kindergartens,tasks,totalHours,notes}=req.body
    
    const weeklyReport=await WeeklyReport.findById(_id)
    if(!weeklyReport){ return res.status(400).json({"message":"no weeklyReport found!"})}
    
    // בדיקת הרשאות
    if(req.consultant.roles !== "Supervisor" && !weeklyReport.consultant.equals(req.consultant._id)){
        return res.status(403).json({"message":"You are not authorized to update this weekly report!"})
    }
    
    const dailyWork = weeklyReport.dailyWork.id(dailyWorkId);
    if(!dailyWork){
        return res.status(400).json({"message":"Daily work not found!"})
    }
    
    // עדכון השעות הכללי
    const oldHours = dailyWork.totalHours || 0;
    const newHours = totalHours || 0;
    weeklyReport.weeklyTotalHours = weeklyReport.weeklyTotalHours - oldHours + newHours;
    
    // עדכון השדות
    if(kindergartens !== undefined) dailyWork.kindergartens = kindergartens;
    if(tasks !== undefined) dailyWork.tasks = tasks;
    if(totalHours !== undefined) dailyWork.totalHours = totalHours;
    if(notes !== undefined) dailyWork.notes = notes;
    
    await weeklyReport.save();
    
    const populatedReport = await WeeklyReport.findById(weeklyReport._id)
        .populate('consultant')
        .populate('dailyWork.kindergartens.kindergarten')
    
    res.json(populatedReport);
}

// פונקציה לקבלת סטטיסטיקות דוחות שבועיים
const getWeeklyReportStats=async(req,res)=>{
    let matchStage = {};
    
    // אם זה לא Supervisor, מציג רק את הדוחות של היועץ הנוכחי
    if(req.consultant.roles !== "Supervisor"){
        matchStage.consultant = req.consultant._id;
    }
    
    const stats = await WeeklyReport.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalHours: { $sum: "$weeklyTotalHours" },
                avgHours: { $avg: "$weeklyTotalHours" }
            }
        }
    ]);
    
    res.json(stats);
}

module.exports={addWeeklyReport,updateWeeklyReport,getAllWeeklyReport,getWeeklyReportByID,deleteWeeklyReport,getWeeklyReportsByDate,createWeeklyTemplate,addDailyWork,updateDailyWork,getWeeklyReportStats}