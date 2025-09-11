const Task=require("../models/Task")
//כל משימות
const getAllTask = async (req, res) => {
    let task;
    // אם יש פרמטר consultant ב-query, חפש משימות של היועצת הזו
    if (req.consultant.roles === "Supervisor") {
        const consultantId = req.query.consultant;
        if (consultantId) {
            task = await Task.find({ consultant: consultantId }).sort({ _id: 1 });
        } else {
            task = await Task.find({}).sort({ _id: 1 });
        }
    } else {
        task = await Task.find({ consultant: req.consultant._id }).sort({ _id: 1 });
    }
    res.json(task);
};
//הוספת משימה
const addTask = async (req, res) => {
    const { title, body, consultant } = req.body;
    if (!title) {
        return res.status(400).json({ "message": "you didnt sent everything that is required!" });
    }
    if (req.consultant.roles === "Supervisor") {
        // חובה לשלוח מזהה יועצת
        if (!consultant) {
            return res.status(400).json({ "message": "חובה לבחור יועצת למשימה!" });
        }
        const task = await Task.create({ title, body, consultant });
        res.json(task);
    } else {
        const task = await Task.create({ title, consultant: req.consultant._id, body });
        res.json(task);
    }
}
//מחיקת משימה
const deleteTask=async (req,res)=>{
    let task
    const{_id}=req.params
    if(req.consultant.roles==="Supervisor"){
         task=await Task.findById(_id).exec()
    }
    else
        task=await Task.findById(_id,{consultant:req.consultant._id}).exec()
   
    if(!task){ return res.status(400).json({"message":"no task found!"})}
    await task.deleteOne()
   res.json( `Task: ${task.title} id: ${task._id} deleted`)
}
//עדכון משימה
const updateTask=async(req,res)=> {
    const {title,body,consultant}=req.body
    if(!title) {return res.status(400).json({"message":"you didnt sent everything that is required!"})}
    const{_id}=req.params    
    const task=await Task.findById(_id)
    if(!task){ return res.status(400).json({"message":"no task found!"})}
    task.title=title
    task.body=body
    task.consultant=req.consultant.roles==="Supervisor"?consultant:req.consultant._id
    await task.save();
    res.json(task)
}
//קבלת בודדת משימה
const getTaskByID=async(req,res)=>{
    const{_id}=req.params
    let task
    if(req.consultant.roles==="Supervisor"){
        task=await Task.findById(_id)
    }
    else
         task=await Task.findById(_id)
    if(!task){ return res.status(400).json({"message":"no task found!"})}
    res.json(task)
}

const markTaskCompleted = async (req, res) => {
    const { _id } = req.params;
    let task;
    if (req.consultant.roles === "Supervisor") {
        task = await Task.findById(_id);
    } else {
        task = await Task.findOne({ _id, consultant: req.consultant._id });
    }
    if (!task) {
        return res.status(400).json({ message: "no task found!" });
    }
    task.completed = true;
    await task.save();
    res.json(task);
};

module.exports = { addTask, updateTask, getAllTask, getTaskByID, deleteTask, markTaskCompleted };