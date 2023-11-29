const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config({path: '.env'})



exports.autenticarUsuario = async (req, res, next) => {

    const errores = validationResult(req);

    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()});
    }


    const { email, password } = req.body;
    const usuario = await User.findOne({email})

    if(!usuario){
        res.status(401).json({msg: 'El usuario no existe'});
        return next();
    }


    if(bcrypt.compareSync(password, usuario.password)){
        const token = jwt.sign({
            id: usuario._id,
            nombre: usuario.nombre,
        }, process.env.SECRET_JWT, {
            expiresIn: '8h'
        });

        res.json({token})

    }else{
        res.status(401).json({msg: 'El correo o la contraseña no son válidos'})
    }




    
}


exports.usuarioAutenticado = async (req, res, next) => {
    
    res.json({user: req.user});

}