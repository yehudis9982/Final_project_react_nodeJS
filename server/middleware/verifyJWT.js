const jwt=require("jsonwebtoken")
const verifyJWT=(req,res,next)=>{
  const authHeader=req.headers.authorization||req.headers.Authorization
  if(!authHeader?.startsWith('Bearer')){
    return res.status(401).json({message:"Unauthorized"})
  }
  const token=authHeader.split(' ')[1]
  console.log("token from header:", token);
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err) return res.status(403).json({message:"Forbidden"})
       console.error("JWT error:", err);
      console.log("decoded from token:", decoded);
      
        // הוספת שדה id שיהיה נוח להשתמש בו
    req.consultant = {
      ...decoded,
      id: decoded._id || decoded.id,
    };

      next()
  })

}
module.exports=verifyJWT