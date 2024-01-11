const Link = require('../models/Link');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');


exports.nuevoEnlace = async (req, res, next) => {

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }


    const configuracionMulter = {
        // 1MB
        limits: { fileSize: req.user ? 1024 * 1024 * 10 : 1024 * 1024 },
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname + '/../uploads')
            },
            filename: (req, file, cb) => {
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                cb(null, `${shortid.generate()}${extension}`);
            }
            /* 
            
             No aceptar algun tipo de archivo
            fileFilter: (req, file, cb) = () => {
                if(file.mimetype === "application/pdf"){
                    return cb(null, true)
                }
            }

            */
          
        })
    }

    const upload = multer(configuracionMulter).single('archivo');


    upload(req, res, async (error) => {
        
       
        if (!error) {

            const enlace = new Link();
            enlace.url = shortid.generate();
            enlace.nombre = req.file.filename;
            enlace.nombre_original = req.file.originalname;

            if (req.user) {
                
                const { password, descargas } = req.body
                enlace.password = password;

                if(descargas > 10){
                    descargas = 10;
                }

                if (descargas) {
                    enlace.descargas = descargas;
                }

                if (password) {
                    const salt = await bcrypt.genSalt(10);
                    enlace.password = await bcrypt.hash(password, salt);
                }

                enlace.autor = req.user.id;

            } 

            /* if (req.user) {
                
                const password = req.file.password;
                const descargas = req.file.descargas;
                enlace.password = password;

                if(descargas > 10){
                    descargas = 10;
                }

                if (descargas) {
                    enlace.descargas = descargas;
                }

                if (password) {
                    const salt = await bcrypt.genSalt(10);
                    enlace.password = await bcrypt.hash(password, salt);
                }

                enlace.autor = req.user.id;

            }

            */

            try {
                await enlace.save();
                return res.json({ msg: `${enlace.url}` });
                next();
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log(error);
            return next();
        }
    });



}


exports.tienePassword = async (req, res, next) => {

    const enlace = await Link.findOne({ url: req.params.url })


    if (!enlace) {
        return res.status(404).json()
    }

    if (enlace.password) {
        res.json({ password: true, url: enlace.url })
    } else {
        next();
    }
}

exports.verificarPassword = async (req, res, next) => {
    const { url } = req.params;
    const { passwordVerify } = req.body

    const enlace = await Link.findOne({ url });

    try {

        if (bcrypt.compareSync(passwordVerify, enlace.password)) {
            next();
        } else {
            return res.status(401).json({ msg: 'Contraseña no válida' })
        }
        
    } catch (error) {
        return res.status(401).json({ msg: 'Error' })
    }

   


}




exports.obtenerEnlace = async (req, res, next) => {

    const { url } = req.params;

    const enlace = await Link.findOne({ url: url })


    if (!enlace) {
        return res.status(404).json()

    }

    res.json({ archivo: enlace.nombre, url: enlace.url, password: false });

    next();

}


exports.listaEnlacesUsuario = async (req, res, next) => {

    console.log(req.user);
    console.log(req.body);


    if (req.user) {

        const links = await Link.find({ autor: req.user.id })

        if (!links) {

            return res.status(500).send('Error al buscar los links');
        }

        res.json(links);

    } else {
        res.status(401).send();
    }
}
