const WeeklyReport=require("../models/WeeklyReport")
//כל הלוחות השבועיים
const getAllWeeklyReport=async(req,res)=>{
    if(req.consultant.roles==="Supervisor"){
        const weeklyReport=await WeeklyReport.find({},{password:0})
            .populate('consultant')
            .populate('kindergartens')
            .sort({weeklyDate:-1})
        res.json(weeklyReport)
    }else{
        const weeklyReport=await WeeklyReport.find({consultant:req.consultant._id},{password:0})
            .populate('consultant')
            .populate('kindergartens')
            .sort({weeklyDate:-1})
        res.json(weeklyReport)
    }
    
}
//הוספת לוח שבועי
const addWeeklyReport=async (req,res)=>{
    const{consultant, weeklyDate, kindergartens, task}=req.body
    if(!weeklyDate){return res.status(400).json({"message":"weeklyDate is required!"})}
    if(!consultant&&req.consultant.roles=="Supervisor"){return res.status(400).json({"message":"consultant is required!"})}
   const newConsultant=req.consultant.roles==="Supervisor"?consultant:req.consultant._id
    if(await WeeklyReport.findOne({consultant:newConsultant, weeklyDate}).exec())
        return res.status(400).send("Weekly report for this consultant and date already exists!")
   const weeklyReport=await WeeklyReport.create({
       consultant: newConsultant,
       weeklyDate,
       kindergartens: kindergartens || [],
       task: task || []
   })
   res.json(weeklyReport)
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
    const {consultant, weeklyDate, kindergartens, task}=req.body
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
    
    if(consultant) weeklyReport.consultant = consultant
    if(weeklyDate) weeklyReport.weeklyDate = weeklyDate
    if(kindergartens) weeklyReport.kindergartens = kindergartens
    if(task) weeklyReport.task = task
    
    await weeklyReport.save();
    res.json(weeklyReport)
}
//קבלת לוח שבועי בודד
const getWeeklyReportByID=async(req,res)=>{
    const{_id}=req.params
    const weeklyReport=await WeeklyReport.findById(_id).populate('consultant').populate('kindergartens')
    if(!weeklyReport){ return res.status(400).json({"message":"no weeklyReport found!"})}
    
    // בדיקת הרשאות - רק Supervisor או היועץ שיצר את הדוח יכול לראות
    if(req.consultant.roles !== "Supervisor" && !weeklyReport.consultant._id.equals(req.consultant._id)){
        return res.status(403).json({"message":"You are not authorized to view this weekly report!"})
    }
    
    res.json(weeklyReport)
}

//קבלת דוחות שבועיים לפי תאריך
const getWeeklyReportsByDate=async(req,res)=>{
    const{weeklyDate}=req.params
    const startDate = new Date(weeklyDate)
    const endDate = new Date(weeklyDate)
    endDate.setDate(endDate.getDate() + 6) // שבוע שלם
    
    let filter = {
        weeklyDate: { $gte: startDate, $lte: endDate }
    }
    
    // אם זה לא Supervisor, מציג רק את הדוחות של היועץ הנוכחי
    if(req.consultant.roles !== "Supervisor"){
        filter.consultant = req.consultant._id
    }
    
    const weeklyReports=await WeeklyReport.find(filter)
        .populate('consultant')
        .populate('kindergartens')
    
    res.json(weeklyReports)
}

module.exports={addWeeklyReport,updateWeeklyReport,getAllWeeklyReport,getWeeklyReportByID,deleteWeeklyReport,getWeeklyReportsByDate}