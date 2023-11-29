const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const filesController = require('../controllers/fileController');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({dest: './uploads'})


router.post('/',

    // [check("nombre", "Sube un archivo").not().isEmpty(),  check("nombre_original", "Sube un archivo").not().isEmpty()],
    auth,
    linkController.nuevoEnlace

);

router.get('/list',

    auth,
    linkController.listaEnlacesUsuario


)


router.get('/:url',
    linkController.tienePassword,
    linkController.obtenerEnlace,

);

router.post('/:url',

    linkController.verificarPassword,
    linkController.obtenerEnlace


)

module.exports = router;