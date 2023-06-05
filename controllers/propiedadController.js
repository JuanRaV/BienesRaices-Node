import { validationResult } from "express-validator"
import {Precio,Categoria,Propiedad} from '../models/Index.js'

const admin = (req,res)=>{
    res.render('propiedades/admin',{
        pagina:'Mis Propiedades'
    })
}

//Formulario para crear una nueva propiedad
const crear = async(req,res)=>{
    //Consultar modelo de precio y categorias
    const [categorias,precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/crear',{
        pagina:'Crear Propiedad',
        csrfToken:req.csrfToken(),
        categorias,
        precios,
        datos:{}
    })
}

const guardar = async (req,res)=>{
    //Validacion 
    let resultado = validationResult(req)
    

    if(!resultado.isEmpty()){
        const [categorias,precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
        return res.render('propiedades/crear',{
            pagina:'Crear Propiedad',
            barra:true,
            csrfToken:req.csrfToken(),
            categorias,
            precios,
            errores:resultado.array(),
            datos:req.body
        })
    }

    const{titulo,descripcion,habitaciones,estacionamiento,wc,calle,lat,lng,precio:precioId,categoria:categoriaId}=req.body
    const {id:usuarioId} = req.usuario

    //Crear registro
    try {
        //Cambiando el name de categoria y precio a categoriaId y precioId (como estan en la DB)
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle, 
            lat,
            lng,
            precioId,
            categoriaId,
            imagen: '',
            usuarioId

        })

        const {id} = propiedadGuardada
        res.redirect(`/propiedades/agregar-imagen/${id}`)
    } catch (error) {
        console.log(error)
    }
}
const agregarImagen=async(req,res)=>{
    res.render('propiedades/agregar-imagen',{
        pagina:"Agregar Imagen"
    })
}
export{
    admin,
    crear,
    guardar,
    agregarImagen
}