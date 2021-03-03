var express = require('express');
var router = express.Router();
var USER = require("../database/user");
var JWT=require("jsonwebtoken");
var middleware=require("./middleware");

router.get("/user",middleware, (req, res) => {
    var filter={};
    var params= req.query;
    var select="";
    var order = {};
    if(params.nombre_rest!=null){
        var expresion =new RegExp(params.nombre_rest);
        filter["nombre"]=expresion;
    }
    if(params.filters!=null){
        select=params.filters.replace(/,/g, " ");
    }
    if (params.order != null) {
        var data = params.order.split(",");
        var number = parseInt(data[1]);
        order[data[0]] = number;
    }
    
    var restDB=USER.find(filter).
    select(select).
    sort(order);
    restDB.exec((err, docs)=>{
        if(err){
            res.status(500).json({msn: "Error en la conexion del servidor"});
            return;
        }
        res.status(200).json(docs);
        return;
    });
});

router.post("/user", (req, res) => {
  var userRest = req.body;
  
  if (userRest.password == null) {
      res.status(300).json({msn: "El password es necesario..."});
      return;
  }
  if (userRest.password.length < 5) {
      res.status(300).json({msn: "El password es demasiado corto"});
      return;
  }
  if (!/[A-Z]+/.test(userRest.password)) {
      res.status(300).json({msn: "El password necesita una letra Mayuscula"});
      
      return;
  }
  if (!/[\$\^\@\&\(\)\{\}\#]+/.test(userRest.password)) {
      res.status(300).json({msn: "El password necesita un caracter especial"});
      return;
  }
  var userDB = new USER(userRest);
  userDB.save((err, docs) => {
      if (err) {
          var errors = err.errors;
          var keys = Object.keys(errors);
          var msn = {};
          for (var i = 0; i < keys.length; i++) {
              msn[keys[i]] = errors[keys[i]].message;
          }
          res.status(500).json(msn);
          return;
      }
      res.status(200).json(docs);
      return;
  })
});

router.post("/login", async(req, res) => {
    var body = req.body;
    if (body.email == null) {
        res.status(300).json({msn: "El e-mail es necesario"});
             return;
    }
    if (body.password == null) {
        res.status(300).json({msn: "El password es necesario"});
        return;
    }
    var results = await USER.find({email: body.email, password: body.password});
    if (results.length == 1) {
        var token =JWT.sign({
            exp:Math.floor(Date.now()/1000)+(60*60*60),
            data:results[0].id
        });
        res.status(200).json({msn: "Bienvenido al sistema " + body.email + " :) ",token:token,id:results[0].id});
        return;
    }
    res.status(200).json({msn: "Credenciales incorrectas"});
});

module.exports = router;
