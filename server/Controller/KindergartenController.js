const Kindergarten=require("../models/Kindergarten")
//כל הגנים
const getAllKindergarten=async(req,res)=>{
    if(req.consultant.roles=="Supervisor"){
        const kindergarten=await Kindergarten.find({},{password:0}).sort({_id:1})
         res.json(kindergarten)
    }
    else{
    const kindergarten=await Kindergarten.find({consultant:req.consultant._id},{password:0}).sort({_id:1})
     res.json(kindergarten)
    }
    
}       
//הוספת גן
const addKindergarten=async (req,res)=>{
    const{institutionSymbol,address,kindergartenTeacherName,phone,age,consultant}=req.body
    if(!institutionSymbol||!address||!kindergartenTeacherName||!phone||!age){return res.status(400).json({"message":"you didnt sent everything that is required!"})}
    if(await Kindergarten.findOne({institutionSymbol:institutionSymbol}).exec())
        return res.status(400).send("institutionSymbol needs to be uniqe!")
   if(req.consultant.roles=="Supervisor"){
    const kindergarten=await Kindergarten.create({institutionSymbol,address,kindergartenTeacherName,phone,age,consultant})
    res.json(kindergarten)
   }
   const kindergarten=await Kindergarten.create({institutionSymbol,address,kindergartenTeacherName,phone,age,consultant:req.consultant._id})
   res.json(kindergarten)
 }
//מחיקת גן
const deleteKindergarten=async (req,res)=>{
    const{_id}=req.params
    let kindergarten;
    if(req.consultant.roles=="Supervisor")
        kindergarten=await Kindergarten.findById(_id).exec()
    else
        kindergarten=await Kindergarten.findById(_id, {consultant:req.consultant._id}).exec()
    if(!kindergarten){ return res.status(400).json({"message":"no kindergarten found!"})}
    await kindergarten.deleteOne()
   res.json( `Kindergarten: ${kindergarten.name} id: ${kindergarten._id} deleted`)
}
//עדכון גן
const updateKindergarten=async(req,res)=> {
    const {institutionSymbol,address,kindergartenTeacherName,phone,age,consultant}=req.body
    if(!institutionSymbol||!address||!kindergartenTeacherName||!phone||!age) {return res.status(400).json({"message":"you didnt sent everything that is required!"})}
    const{_id}=req.params    
    const kindergarten=await Kindergarten.findById(_id)
    if(!kindergarten){ return res.status(400).json({"message":"no kindergarten found!"})}
    kindergarten.institutionSymbol=institutionSymbol
    kindergarten.kindergartenTeacherName=kindergartenTeacherName
    kindergarten.address=address
    kindergarten.age=age
    kindergarten.phone=phone
    kindergarten.consultant=req.consultant.roles==="Supervisor"?consultant:req.consultant._id;
    await kindergarten.save();
    res.json(kindergarten)
}
//קבלת גן בודד
const getKindergartenByID=async(req,res)=>{
    let kindergarten
    const{_id}=req.params
    if(req.consultant.roles=="Supervisor"){
        kindergarten=await Kindergarten.findById({_id})
    }
    else{
     kindergarten=await Kindergarten.findById({_id,consultant:req.consultant._id})
    }
    if(!kindergarten){ return res.status(400).json({"message":"no kindergarten found!"})}
    res.json(kindergarten)
}
module.exports={addKindergarten,getAllKindergarten,getKindergartenByID,updateKindergarten,deleteKindergarten}