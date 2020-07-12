const jwt = require("jsonwebtoken");

module.exports.generateToken = async (data)=>{
    const token = await jwt.sign(data, process.env.SECRET);
    return token;
};

module.exports.checkToken = async token => {
    
    let result = await jwt.verify(token, process.env.SECRET);
    return result;
    
};