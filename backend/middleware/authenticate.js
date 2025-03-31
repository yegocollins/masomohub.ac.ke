const jwt  = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req, res, next) => {
    // const authHeader = req.header('auth-token');
 
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({error: "Access Denied"});
    }

    // const token = authHeader.split(' ')[1];
    // console.log(token);

    try{
        const user = jwt.verify(authHeader, process.env.TOKEN_SECRET);
        req.user = user;
        next();
    }catch(e){
        res.status(400).json({error: "Invalid Token"});
    }
}

module.exports = authenticate;