const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const Consultant=require("../models/Consultant")
//פונקציית כניסה למערכת
const login=async(req,res)=>{
const{tz,password}=req.body
if(!tz||!password){
      return res.status(400).json({"message":"All fileds are required!"})}
const foundConsultant=await Consultant.findOne({tz}).exec()
if(!foundConsultant){
      return res.status(401).json({ message: "Unauthorized" });
}
const mutch=await bcrypt.compare(password,foundConsultant.password)
if(!mutch)return res.status(401).json({message:"Unauthorized"})
//אוביקט המכיל את הפרטים ללא הסיסמא
const consultantInfo={
_id:foundConsultant._id,
name:foundConsultant.firstName,
roles:foundConsultant.roles,
tz:foundConsultant.tz,
email:foundConsultant.email,
phone:foundConsultant.phone,
workSchedule:foundConsultant.workSchedule||[]
}
const accessToken=jwt.sign(consultantInfo,process.env.ACCESS_TOKEN_SECRET)
res.json({accessToken})
}
// פונקציית הרשמה למערכת
const register=async(req,res)=>{
 const{firstName,lastName,email,password,phone,tz}=req.body
 if(!firstName||!lastName||!email||!password||!phone||!tz){
      return res.status(400).json({"message":"All fields are required!"})}
const duplicate=await Consultant.findOne({tz}).exec()
if(duplicate){
       return res.status(409).send({message:"duplicate tz!"})
}
//הצפנת הסיסמא 
  const hashedPwd=await bcrypt.hash(password,10)
  const consultant=await Consultant.create({firstName,lastName,email,phone,tz,password:hashedPwd})
  if(consultant){

        const consultantInfo = {
    _id: consultant._id,
    name: consultant.firstName,
    roles: consultant.roles,
    tz: consultant.tz,
    email: consultant.email,
    phone: consultant.phone,
    workSchedule: consultant.workSchedule || []
  };
  const accessToken = jwt.sign(consultantInfo, process.env.ACCESS_TOKEN_SECRET);
  return res.status(201).json({ accessToken }); // מחזירים token
  }
  else{
      return res.status(400).json({message:"Invalid consultant received"})
  }
}
module.exports={login,register}