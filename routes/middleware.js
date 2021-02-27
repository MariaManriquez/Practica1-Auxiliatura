var JWT=require("jsonwebtoken");
var USER=require("../database/user");
var middleware=async(req,res, next)=>{
    var token=req.headers["authorization"];

    if(token==null){
        res.status(403).json({error: "token nulo"});
        return;
    }
    var decoded =JWT.verify(token, 'SeminarioDeSistemas');
    console.log(decoded);
    if(decoded==null){
        res.status(403).json({error: "no tiene acceso token falso"});
        return;
    }
    var iduser=decoded.data;
    console.log(iduser);  
    var docs =await USER.findOne({_id: iduser});
    console.log(docs);
    if(docs==null){
        res.status(403).json({error: " no existe usuario"});
        return;
    }
    var services =req.originalUrl.substr(1, 100);
    if(services.lastIndexOf("?")> -1){
        services=services.substring(0, services.lastIndexOf("?"));  
    }

    next();

}
module.exports=middleware;