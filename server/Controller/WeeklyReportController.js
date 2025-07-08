const WeeklyReport=require("../models/WeeklyReport")
//כל הלוחות השבועיים
const getAllWeeklyReport=async(req,res)=>{
    const weeklyReport=await WeeklyReport.find({},{password:0}).sort({_id:1})
    res.json(weeklyReport)
}
//הוספת לוח שבועי
const addWeeklyReport=async (req,res)=>{
    const{firstName,lastrName,email,password,phone,tz}=req.body
    if(!firstName||!lastrName||!email||!password||!phone||!tz){return res.status(400).json({"message":"you didnt sent everything that is required!"})}
    if(await WeeklyReport.findOne({tz:tz}).exec())
        return res.status(400).send("tz needs to be uniqe!")
   const weeklyReport=await WeeklyReport.create({firstName,lastrName,email,password,phone,tz})
   res.json(weeklyReport)
 }
//מחיקת לוח שבועי
const deleteWeeklyReport=async (req,res)=>{
    const{_id}=req.body
    const weeklyReport=await WeeklyReport.findById(_id).exec()
    if(!weeklyReport){ return res.status(400).json({"message":"no weeklyReport found!"})}
    await weeklyReport.deleteOne()
   res.json( `WeeklyReport: ${weeklyReport.name} id: ${weeklyReport._id} deleted`)
}
//עדכון לוח שבועי
const updateWeeklyReport=async(req,res)=> {
    const {firstName,lastrName,email,password,phone,tz}=req.body
    if(!firstName||!lastrName||!email||!password||!phone||!tz) {return res.status(400).json({"message":"you didnt sent everything that is required!"})}
    const{_id}=req.params    
    const weeklyReport=await WeeklyReport.findById(_id)
    if(!weeklyReport){ return res.status(400).json({"message":"no weeklyReport found!"})}
    weeklyReport.firstName=firstName
    weeklyReport.lastName=lastrName
    weeklyReport.password=password
    weeklyReport.tz=tz
    weeklyReport.email=email
    weeklyReport.phone=phone
    await weeklyReport.save();
    res.json(weeklyReport)
}
//קבלת לוח שבועי בודד
const getWeeklyReportByID=async(req,res)=>{
    const{_id}=req.params
    const weeklyReport=await WeeklyReport.findById(_id)
    if(!weeklyReport){ return res.status(400).json({"message":"no weeklyReport found!"})}
    res.json(weeklyReport)
}
module.exports={addWeeklyReport,updateWeeklyReport,getAllWeeklyReport,getWeeklyReportByID,deleteWeeklyReport}