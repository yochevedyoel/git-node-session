const JWT=require("jsonwebtoken")
const verifyJWT=(req,res ,next)=>{
    console.log("llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll");
    const authHeader =req.headers.authorization || req.headers.Authorization
    if(!authHeader.startsWith("Bearer"))
        return res.status(401).json({massege:"unathorize"})
    console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");
    const token=authHeader.split(" ")[1]
    JWT.verify(token,process.env.ACCESS_TOKEN_SECRET,
        (err,decode)=>
        {
            if(err) return res.status(401).json({massege:"unathorized"})
            req.user=decode
            next()
        })
}
module.exports=verifyJWT