import { check,validationResult } from "express-validator"
import bcrypt from 'bcrypt'
import Usuario from "../models/Usuario.js"
import {generarId,generarJWT} from '../helpers/tokens.js'
import { emailRegistro,emailOlvidePassword } from "../helpers/emails.js"


const formularioLogin = (req,res)=>{
    res.render('auth/login',{//Renderiza el login
       pagina:'Iniciar Sesion',
       csrfToken:req.csrfToken()
    }) 
}

const autenticar = async(req,res)=>{
    //Validacion
    await check('email').isEmail().withMessage('El Email es obligatorio').run(req)
    await check('password').notEmpty().withMessage('El Password es obligatorio').run(req)

    let resultado = validationResult(req);

    //Verificar que el resultado esta vacio
    if(!resultado.isEmpty()){
        //Errores

        return res.render('auth/login',{
            pagina:'Iniciar Sesion',
            errores:resultado.array(),
            csrfToken: req.csrfToken()
        })
    }

    //Comprobar que el usuario exista
    const{email,password} = req.body

    const usuario = await Usuario.findOne({where:{email}})
    if(!usuario){
        return res.render('auth/login',{
            pagina:'Iniciar Sesion',
            errores:[{msg:'El usuario no existe'}],
            csrfToken: req.csrfToken()
        })
    }
    
    //Comprobar si el usuario esta confirmado
    if(!usuario.confirmado){
        return res.render('auth/login',{
            pagina:'Iniciar Sesion',
            errores:[{msg:'Tu cuenta no ha sido confirmada'}],
            csrfToken: req.csrfToken()
        })
    }

    //Revisar el password
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login',{
            pagina:'Iniciar Sesion',
            errores:[{msg:'Password incorrecto'}],
            csrfToken: req.csrfToken()
        })
    }

    //Autenticar al usuario
    const token = generarJWT({id: usuario.id,nombre:usuario.nombre})

    //Almacena JWT en un cookie
    return res.cookie('_token',token,{
        httpOnly: true, //Evita ataques CrossSide
        // secure: true //Permite los cookies en conexiones seguras
    }).redirect('/mis-propiedades')
}

const formularioRegistro = (req,res)=>{
    res.render('auth/registro',{//Renderiza el login
        pagina:'Crear Cuenta',
        csrfToken: req.csrfToken()
    }) 
}

const registrar = async(req,res)=>{
    //Validacion
    await check('nombre').notEmpty().withMessage('El Nombre es obligatorio').run(req)
    await check('email').isEmail().withMessage('El Email es obligatorio').run(req)
    await check('password').isLength({min:6}).withMessage('El Password debe ser de al menos 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los Passwords no son iguales').run(req)

    let resultado = validationResult(req);


    //Verificar que el resultado esta vacio
    if(!resultado.isEmpty()){
        //Errores
        const {nombre,email} = req.body;
        return res.render('auth/registro',{
            pagina:'Crear Cuenta',
            errores:resultado.array(),
            //Regresamos un objeto para guardar en el form los datos ingresados
            usuario: {
                nombre,
                email
            },
            csrfToken: req.csrfToken()
        })
    }
    const {nombre,email,password} = req.body

    //Verificar que el usuario no esta duplicado
    const existeUsuario = await Usuario.findOne({where:{email}})
    if(existeUsuario){
        const {nombre,email} = req.body;
        return res.render('auth/registro',{
            pagina:'Crear Cuenta',
            errores:[{msg:'La cuenta ya ha sido registada'}],
            //Regresamos un objeto para guardar en el form los datos ingresados
            usuario: {
                nombre,     
                email
            },
            csrfToken: req.csrfToken()
        })
    }

    //Almacenamos un usuario
    
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token:generarId()
    })

    //Envia email de confirmacion
    emailRegistro({
        nombre:usuario.nombre,
        email:usuario.email,
        token:usuario.token
    })

    //Mostrar mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un email de Confirmacion'
    })
}


//Funcion que comprueba una cuenta
const confirmar = async (req,res)=>{
    const {token} = req.params //Con params leemos la variable de la URL

    //Verificamos si el token es valido
    const usuario = await Usuario.findOne({where:{token}})
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina:"Error al confirmar tu cuenta",
            mensaje:'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error:true
        })
    }
    //Confirmar la cuenta
    usuario.confirmado=true
    usuario.token=null //Eliminamos el token de un solo uso
    await usuario.save()//Lo guardamos en la base de datos

    res.render('auth/confirmar-cuenta',{
        pagina:"Cuenta Confirmada Correctamente",
        mensaje:'Su Cuenta ha sido Confirmada Correctamente, Inicie Sesion para empezar',
        error:false
    })
}

const formularioOlvidePassword = (req,res)=>{   
    res.render('auth/olvide-password',{ 
        pagina:'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken()
    }) 
}

const resetPassword= async(req,res)=>{
    //Validacion
    await check('email').isEmail().withMessage('El Email es obligatorio').run(req)

    let resultado = validationResult(req);


    //Verificar que el resultado esta vacio
    if(!resultado.isEmpty()){
        //Errores

        return res.render('auth/olvide-password',{
            pagina:'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores:resultado.array()
        })
    }

    //Buscar el usuario
    const{email} = req.body;
    const usuario =await Usuario.findOne({where:{email}})
    if(!usuario){
        return res.render('auth/olvide-password',{
            pagina:'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores:[{msg:'El email no esta registrado'}]
        })
    }

    //Generamos un token y enviamos el email
    usuario.token = generarId()
    await usuario.save();

    //Enviar email
    emailOlvidePassword({
        email:usuario.email,
        nombre:usuario.nombre,
        token:usuario.token
    })
    //Renderizar un mensaje
    res.render('templates/mensaje',{
        pagina: 'Reestablece tu Password',
        mensaje: 'Hemos enviado un email con las instrucciones'
    })
}

const comprobarToken=async(req,res)=>{
    const {token} = req.params;
    const usuario = await Usuario.findOne({where:{token}})
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina:"Reestablece tu Password",
            mensaje:'Hubo un error al validar tu informacion',
            error:true
        })
    }

    //Mostar el formulario para modificar el password
    res.render('auth/reset-password',{
        pagina: 'Reestablece tu Password',
        csrfToken: req.csrfToken(),
    })
}

const nuevoPassword=async(req,res)=>{
    //Validar el password
    await check('password').isLength({min:6}).withMessage('El Password debe ser de al menos 6 caracteres').run(req)

    let resultado = validationResult(req);
    //Verificar que el resultado esta vacio
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/reset-password',{
            pagina:'Reestablece tu Password',
            errores:resultado.array(),
            csrfToken: req.csrfToken()
        })
    }
    //Identificar quien hace el cambio
    const {token} = req.params;
    const {password} = req.body;

    const usuario = await Usuario.findOne({where:{token}})

    //Hashear password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password,salt)
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta',{
        pagina:'Password Reestablecido',
        mensaje:'El Password de guardo correctamente'
    })
}   

export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    confirmar,
    registrar,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticar
};