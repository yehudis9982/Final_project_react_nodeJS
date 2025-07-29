const mongoose=require("mongoose")
const KindergartenSchema=new mongoose.Schema({
network:{
    type:String
},
name:{
    type:String
},
//סמל מוסד
institutionSymbol:{
  type:String,
  required:true
},
address:{
    city:String,
    street:String,
    bildingNumber:Number,
    zipCode:{type:String, required:true}
   
},
kindergartenTeacherName:{
type:String,
required:true
},
phone:{
    type:String,
    required:true
},
email:{
    type:String
},
consultant:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Consultant"
},
age:{
type:Number,
required:true
}
},{ timestamps:true})
module.exports=mongoose.model("Kindergarten",KindergartenSchema)