// ORM de mongo db
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const usuariosSchema = new Schema({
    email : {
        type: String,
        required : true,
        unique: true,
        lowercase: true,
        trim: true
    },
    nombre :{
        type: String,
        required : true,
        trim: true
    },
    password : {
        type: String,
        required: true
    },
    
});

// Lo registramos en el modelo
module.exports = mongoose.model('Users', usuariosSchema)

