import express from "express"
import {
    formularioLogin,
    autenticar,
    formularioRegistro,
    formularioOlvidePassword,
    confirmar,
    registrar,
    resetPassword,
    comprobarToken,
    nuevoPassword
} from '../controllers/usuarioController.js'

const router = express.Router(); 

//GET Se utiliza cuando un usuario visita un sitio WEB
//POST se utiliza cuando un usuario manda un formulario y quieres procesarlo
//PUT y PATCH son para actualizar un registro
//DELETE es para eliminar un registro

router.get('/login',formularioLogin)
router.post('/login',autenticar)

router.get('/registro',formularioRegistro)
router.post('/registro',registrar)

router.get('/confirmar/:token',confirmar)

router.get('/olvide-password',formularioOlvidePassword)
router.post('/olvide-password',resetPassword)

//Almacena el nuevo password
router.get('/olvide-password/:token',comprobarToken)
router.post('/olvide-password/:token',nuevoPassword)

export default router;