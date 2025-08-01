const Consultant=require("../models/Consultant")
//כל היועצות
const getAllConsultant=async(req,res)=>{
    const consultant=await Consultant.find({},{password:0}).sort({_id:1})
    res.json(consultant)
}
//הוספת יועצת
const addConsultant=async (req,res)=>{
    const{firstName,lastName,email,password,phone,tz}=req.body
    if(!firstName||!lastName||!email||!password||!phone||!tz){return res.status(400).json({"message":"you didnt sent everything that is required!"})}
    if(await Consultant.findOne({tz:tz}).exec())
        return res.status(400).send("tz needs to be uniqe!")
   const consultant=await Consultant.create({firstName,lastName,email,password,phone,tz})
   res.json(consultant)
 }
//מחיקת יועצת
const deleteConsultant=async (req,res)=>{
    const{_id}=req.params
    const consultant=await Consultant.findById(_id).exec()
    if(!consultant){ return res.status(400).json({"message":"no consultant found!"})}
    await consultant.deleteOne()
   res.json( `Consultant: ${consultant.firstName} id: ${consultant._id} deleted`)
}
//עדכון יועצת
const updateConsultant=async(req,res)=> {
    const {firstName,lastName,email,password,phone,tz}=req.body
    if(!firstName||!lastName||!email||!password||!phone||!tz) {return res.status(400).json({"message":"you didnt sent everything that is required!"})}
    const{_id}=req.params    
    const consultant=await Consultant.findById(_id)
    if(!consultant){ return res.status(400).json({"message":"no consultant found!"})}
    consultant.firstName=firstName
    consultant.lastName=lastName
    consultant.password=password
    consultant.tz=tz
    consultant.email=email
    consultant.phone=phone
    await consultant.save();
    res.json(consultant)
}
//קבלת יועצת בודדת
const getConsultantByID=async(req,res)=>{
    const{_id}=req.params
    const consultant=await Consultant.findById({_id:req.Consultant._id})
    if(!consultant){ return res.status(400).json({"message":"no consultant found!"})}
    res.json(consultant)
}
module.exports={addConsultant,deleteConsultant,updateConsultant,getAllConsultant,getConsultantByID}