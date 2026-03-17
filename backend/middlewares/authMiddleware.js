const jwt = require("jsonwebtoken");

module.exports = function(req, res, next){

    const token = req.headers["authorization"];

    if(!token){
        return res.status(401).json({erro:"Token não fornecido"});
    }

    try{

        const decoded = jwt.verify(token, "segredo_jwt");

        req.user = decoded;

        next();

    }catch(e){

        res.status(401).json({erro:"Token inválido"});

    }

}