const { request, response } = require("express");
const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const { generarJWT } = require("../helpers/jwt");
const { db } = require("../models/Usuario");

const crearUsuario = async (req = request, res = response) => {
  const { name, email, password } = req.body;

  try {
    //Verificar email
    const usuario = await Usuario.findOne({ email });

    if ( usuario ) {
      return res.status(404).json({
        ok: false,
        msg: "usuario existe con ese email.",
      });
    }

    //Crear usuario con el modelo
    const dbUsuario = new Usuario(req.body);

    //Hashear la contrasena
    const salt = bcrypt.genSaltSync();
    dbUsuario.password = bcrypt.hashSync(password, salt);

    //Crear usuario en db
    await dbUsuario.save();

    //Crear JWT
    const token = await generarJWT(dbUsuario.id, name);

    return res.status(201).json({
      ok: true,
      uid: dbUsuario.id,
      email: dbUsuario.email,
      msg: "Usuario creado correctamente.",
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno, favor comunicarse con el administrador.",
    });
  }
};

const loginUsuario = async(req = request, res = response) => {
    const { email, password } = req.body

    try {

        const dbUsuario = await Usuario.findOne({ email })

        if(!dbUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Email no existente en el sistema'
            })
        }

        const validPassword = bcrypt.compareSync( password, dbUsuario.password)

        if(!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            })
        }

        const token = await generarJWT( dbUsuario.id, dbUsuario.name );

        return res.status(200).json({
            ok:    true,
            uid:   dbUsuario.id,
            name:  dbUsuario.name,
            email: dbUsuario.email,
            token
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error, hable con su administrador de sistema'
        })
    }
};

const revalidarToken = async(req = request, res = response) => {

  const { uid, name } = req

  const dbUsuario = await Usuario.findById( uid );

  if( !dbUsuario ) {
    return res.status(400).json({
        ok: false,
        msg: 'id no encontrado en la base de datos.'
    })
  }

  const token = await generarJWT( uid, name )

  return res.json({
    ok: true,
    uid,
    name:  dbUsuario.name,
    email: dbUsuario.email,
    token
  });
};

module.exports = {
  crearUsuario,
  loginUsuario,
  revalidarToken,
};
