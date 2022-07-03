const express = require("express");
const cors = require("cors");
const { dbConnection } = require("./db/config.js");
require("dotenv").config();
const path = require('path')

// Crear servidor de express
const app = express();

dbConnection();

//middleware

//pagina web desde server
app.use(express.static('public'))

//Cords
app.use(cors());

//Parsear datos del request a json
app.use(express.json());

//Rutas
app.use("/api/auth", require("./routes/auth.js"));

//redireccionar a ruta publica
app.get( '*', ( req, res ) => {
    res.sendFile( path.resolve( __dirname, 'public/index.html') );
})

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});
