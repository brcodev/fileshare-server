const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { check } = require('express-validator');
const auth = require('../middleware/auth');

// Subida de archivos
const multer = require('multer');
const upload = multer({dest: './uploads'})


router.post('/',
    fileController.subirArchivo
)


router.get('/:archivo',

    fileController.descargar,
    fileController.eliminarArchivo,

);

router.delete('/:idLink',

    auth,
    fileController.eliminarArchivoAutor,


)

module.exports = router;