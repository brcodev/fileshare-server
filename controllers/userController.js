const Usuario = require('../models/User');
const Token = require("../models/Token");
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const { validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
const ejs = require('ejs');
const fs = require('fs');





exports.nuevoUsuario = async (req, res) => {

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }


    const { email, password } = req.body;

    let usuario = await Usuario.findOne({ email })

    if (usuario) {
        return res.status(400).json({ msg: 'El usuario ya esta registrado' })
    }


    usuario = new Usuario(req.body);

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);

    try {
        await usuario.save();
        res.json({ msg: 'Usuario creado correctamente' })

    } catch (error) {
        console.log(error);
    }



}

exports.recuperarCuenta = async (req, res) => {

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const emailTemplatePath = './utils/recoveryMail.ejs';
    const emailTemplateContent = fs.readFileSync(emailTemplatePath, 'utf8');


    const transporter = nodemailer.createTransport({
        host: "mail.privateemail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAILPASS,
        },
    });


    async function sendEmail(userName, userEMail, subject, link) {

        const compiledEmailTemplate = ejs.compile(emailTemplateContent);
        const imageLogo = `${process.env.FRONTEND_URL}/logo.png`
        const imgRecovery = `${process.env.FRONTEND_URL}/image-1.png`
        const renderedEmailTemplate = compiledEmailTemplate({ username: userName, link: link, logo: imageLogo, imgRecovery: imgRecovery});

        const info = await transporter.sendMail({
            from: '"FileShare recuperación de contraseña" <contact@softwsolutions.com>', // sender address
            to: userEMail, 
            subject: subject, 
            html: renderedEmailTemplate,
        });

        console.log("Message sent: %s", info.messageId);
        if (!info.messageId) {
            return false
        }

        //
        // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
        //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
        //       <https://github.com/forwardemail/preview-email>
        //

        return true;
    }

    const user = await Usuario.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).send("user with given email doesn't exist");

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
        token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();
    }

    const link = `${process.env.FRONTEND_URL}/password-reset/${user._id}/${token.token}`;
    const result = await sendEmail(user.nombre ,user.email, "Restablece tu contraseña", link).catch(console.error);

    if (result) {
        res.status(200).json({ msg: "password reset link sent to your email account" });

    } else {
        res.status(400).json();
    }




}

exports.verificarUrl = async (req, res) => {
    const {userId, token} = req.body

    const user = await Usuario.findById(userId);
    if (!user) return res.status(400).send({ msg: "Invalid link or expired" });

    const tokenData = await Token.findOne({
        userId: user._id,
        token: token,
    });
    if (!tokenData) return res.status(400).send();

    res.status(200).send()
}


exports.restablecerPass = async (req, res) => {
    try {

        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const {userId, token, password, confirmPassword} = req.body

        const user = await Usuario.findById(userId);
        if (!user) return res.status(400).send({ msg: "El link no es valido o ha expirado" });

        const tokenData = await Token.findOne({
            userId: user._id,
            token: token,
        });
        if (!tokenData) return res.status(400).send();

        if(confirmPassword !== password) return res.status(400).json({ msg: "Las contraseñas no coinciden" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        await Token.findOneAndRemove({ userId: user._id });

        res.status(200).json({ msg: "password reset sucessfully." });
    } catch (error) {
        res.status(400).json({ msg: "error" });
        console.log(error);
    }
}

