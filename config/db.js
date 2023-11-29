const moongose = require ('mongoose');
require('dotenv').config({path: '.env'});


const conectarDB = async () => {
    try{
        await moongose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
           
        });
        console.log('DB conectada');

    } catch (error) {
        console.log('Hubo un error');
        console.log(error);
        process.exit(1);


    }
}

module.exports = conectarDB;