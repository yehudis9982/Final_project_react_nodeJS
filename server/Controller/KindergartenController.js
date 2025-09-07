const Kindergarten=require("../models/Kindergarten")
    
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

const getAllKindergarten = async (req, res) => {
  try {
    const query = req.consultant.roles === "Supervisor"
      ? {}
      : { consultant: req.consultant._id };

    const kindergarten = await Kindergarten
      .find(query) // אין צורך ב{ password:0 }
      .sort({ _id: 1 });

    res.json(kindergarten);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בקבלת גנים" });
  }
};

// מחיקת גן
const deleteKindergarten = async (req, res) => {
  try {
    const { _id } = req.params;
    const filter = req.consultant.roles === "Supervisor"
      ? { _id }
      : { _id, consultant: req.consultant._id };

    const kindergarten = await Kindergarten.findOne(filter).exec();
    if (!kindergarten) return res.status(400).json({ message: "no kindergarten found!" });

    await kindergarten.deleteOne();
    res.json(`Kindergarten id: ${kindergarten._id} deleted`);
  } catch (err) {
    res.status(500).json({ message: "שגיאה במחיקת גן" });
  }
};

// קבלת גן בודד
const getKindergartenByID = async (req, res) => {
  try {
    const { _id } = req.params;
    const filter = req.consultant.roles === "Supervisor"
      ? { _id }
      : { _id, consultant: req.consultant._id };

    const kindergarten = await Kindergarten.findOne(filter).exec();
    if (!kindergarten) return res.status(400).json({ message: "no kindergarten found!" });

    res.json(kindergarten);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בקבלת גן" });
  }
};

module.exports={addKindergarten,getAllKindergarten,getKindergartenByID,updateKindergarten,deleteKindergarten}