const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env'})

module.exports = (req, res, next) => {

    const authHeader = req.get('Authorization');

    if(authHeader){
        const token = authHeader.split(' ')[1];

        try {

            const usuario = jwt.verify(token, process.env.SECRET_JWT)

            req.user = usuario;
            
        } catch (error) {
            console.log(error);
            
        }

        

    } 

    // El return next es para indicarle que sea cual sea el resultado, avance hacia el siguiente middleware sin quedarse estancado
    return next();
    
}