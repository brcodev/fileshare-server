const express = require('express')
const conectarDB = require('./config/db');
const cors = require('cors');


// Crear el servidor
const app = express();


// Conectar a la base de datos con una funcion async
conectarDB();

console.log('Iniciando FileShare')

// Habilitar Cors
const opcionesCors = {
    origin: process.env.FRONTEND_URL
}
app.use( cors(opcionesCors) )

// Puerto de la app
// Heroku asigna automaticamente un puerto que este disponible, si no esta el env quiere decir que estamos en local y usamos el puerto 4000
const port = process.env.PORT || 4000

// Habilitar leer los valores de un body que enviamos al servidor
app.use(express.json())

// Habilitar carpeta publica
app.use(express.static('uploads'));



// Rutas de la app
app.use('/api/users/', require('./routes/users'));
app.use('/api/auth/', require('./routes/auth'));
app.use('/api/links/', require('./routes/links'));
app.use('/api/files/', require('./routes/files'));



// Arrancar app
app.listen(port, '0.0.0.0', () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})

