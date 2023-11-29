const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const Link = require('../models/Link');


exports.subirArchivo = async (req, res, next) => {

    const configuracionMulter = {
        limits: { fileSize: req.usuario ? 1024 * 1024 * 10 : 1024 * 1024 },
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname + '/../uploads')
            },
            filename: (req, file, cb) => {
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                cb(null, `${shortid.generate()}${extension}`);
            }
            /* 
            
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
        console.log(req.file);

        if (!error) {
            res.json({ archivo: req.file.filename });
        } else {
            console.log(error);
            return next();
        }
    });
}


exports.eliminarArchivoAutor = async (req, res) => {


    if (req.user) {
        try {
            const {idLink} = req.params
            const enlace = await Link.findById(idLink);

            console.log('primero: ' + enlace._id)

            if (!enlace) {
                return res.status(404).json({ msg: 'enlace no encontrado' });
            }

            if (enlace.autor.equals(req.user.id)) {

                const deleteLink = await Link.findOneAndRemove(enlace._id);
                console.log('eliminado: ' + deleteLink);
                if(deleteLink){
                    try {
                        fs.unlinkSync(__dirname + `/../uploads/${enlace.nombre}`);
                        res.status(200).json();
                    } catch (error) {
                        res.status(500).json({ msg: 'Error en el servidor eliminar archivo' });
                    }
                }else{
                    res.status(500).json({ msg: 'no se pudo eliminar link' });
                }
               
               

            } else {
                res.status(403).json({ msg: 'El archivo no pertenece al usuario' });
            }
        } catch (error) {
            res.status(500).json({ msg: 'Error en el servidor encontrar link archivo' });
        }
    }

}




exports.eliminarArchivo = async (req, res) => {
    try {
        fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`);
    } catch (error) {
        console.log(error)
    }
}



exports.descargar = async (req, res, next) => {

    const { archivo } = req.params;
    const enlace = await Link.findOne({ nombre: archivo })

    const archivoDescarga = __dirname + '/../uploads/' + archivo;
    res.download(archivoDescarga);

    const { descargas, nombre } = enlace;

    if (descargas === 1) {
        req.archivo = nombre;

        await Link.findOneAndRemove(enlace._id);

        next();
    } else {
        enlace.descargas--;
        await enlace.save();
    }
}