const bcrypt=require("bcrypt")
const Consultant=require("../models/Consultant")
const login=async(req,res)=>{
const{tz,password}=req.body
if(!tz||!password){return res.status(400).json({"message":"tz and password are require!"})}
if(await Consultant.findOne({tz}).exec())
      return res.status(400).send("tz needs to be uniqe!")
const consultant = await Consultant.findOne({ tz }).exec();
if (!consultant) {
      return res.status(401).json({ message: "Invalid tz or password!" });
    }
}
const register=async(req,res)=>{
 const{firstName,lastName,email,password,phone,tz}=req.body
 if(!firstName||!lastName||!email||!password||!phone||!tz){return res.status(400).json({"message":"All fields are required!"})}
    if(await Consultant.findOne({tz}).exec())
        return res.status(400).send({message:"tz needs to be uniqe!"})
  //הצפנת הסיסמא 
  const hashedPwd=await bcrypt.hash(password,10)
  const consultantObject={}  
  //  const consultant=await Consultant.create({firstName,lastName,email,password,phone,tz})
  //  res.json(consultant)
}
module.exports={login,register}