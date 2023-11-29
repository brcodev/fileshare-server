const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { check } = require('express-validator');



router.post('/',
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('email', 'Agrega un email válido').isEmail(),
        check('password', 'La contraseña debe contener entre 6 y 64 caracteres').isLength({ min: 6, max: 64 }),


    ],
    userController.nuevoUsuario

);

router.post('/recovery-email',

    [
        check('email', 'Ingresa un email válido').isEmail()
    ],

    userController.recuperarCuenta




)

router.post('/verify',

   
    userController.verificarUrl


)


router.post('/password-reset',

    [
        check('password', 'La contraseña debe contener entre 6 y 64 caracteres').isLength({ min: 6, max: 64 }),
        check('confirmPassword', 'La contraseña debe contener entre 6 y 64 caracteres').isLength({ min: 6, max: 64 })
    ],
    userController.restablecerPass



)

module.exports = router;

