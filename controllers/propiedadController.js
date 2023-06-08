import {unlink} from 'node:fs/promises'
import { validationResult } from "express-validator"
import {Precio,Categoria,Propiedad} from '../models/Index.js'
import { query } from 'express'

const admin =async (req,res)=>{
    //Leer query string
    const{pagina: paginaActual} = req.query
    
    const expresion = /^[1-9]$/

    if(!expresion.test(paginaActual))
        return res.redirect('/mis-propiedades?pagina=1')
    

    try {
        const {id}= req.usuario

        //Limites y Offset ppara el paginador
        const limit=10
        const offset=((paginaActual*limit)-limit)


        const [propiedades,total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset, //Va salntando registros
                where:{
                    usuarioId:id
                },
                //Incluye el modelo en la consulta
                include:[
                    {model: Categoria, as: 'categoria'},
                    {model: Precio, as:'precio'}
                ]
            }),
            Propiedad.count({
                where:{
                    usuarioId:id
                }
            })
        ])

        console.log(total)
        res.render('propiedades/admin',{
            pagina:'Mis Propiedades',
            propiedades,
            csrfToken:req.csrfToken(),
            paginas: Math.ceil(total/limit),
            paginaActual:Number(paginaActual),
            total,
            offset,
            limit
        })
    } catch (error) {
        console.log(error)
    }
    
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
    const{id} = req.params
    //validar que la propiedad existe
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad)
        return res.redirect('/mis-propiedades')
    
    //Validar que la propiedad no esta publicada
    if(propiedad.publicado )
        return res.redirect('/mis-propiedades')
    
    //Validar que la propiedad pertenece a quien visita esta pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString())
        return res.redirect('/mis-propiedades')
    
    
    res.render('propiedades/agregar-imagen',{
        pagina:`Agregar Imagen ${propiedad.titulo}:`,
        propiedad,
        csrfToken:req.csrfToken()
    })
}

const almacenarImagen = async(req,res,next)=>{
    const{id} = req.params
    //validar que la propiedad existe
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad)
        return res.redirect('/mis-propiedades')
    
    //Validar que la propiedad no esta publicada
    if(propiedad.publicado )
        return res.redirect('/mis-propiedades')
    
    //Validar que la propiedad pertenece a quien visita esta pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString())
        return res.redirect('/mis-propiedades')
    
    
    res.render('propiedades/agregar-imagen',{
        pagina:`Agregar Imagen ${propiedad.titulo}:`,
        propiedad,
        csrfToken:req.csrfToken()
    })
    
    try {
        //Almacenar la imagen y publicar propiedad
        const image = req.file.filename
        propiedad.imagen = image
        propiedad.publicado = 1

        await propiedad.save()

        next()
 
    } catch (error) {
        console.log(error)
    }
}

const editar = async(req,res)=>{
    const [categorias,precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
    const {id} = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad)
        return res.redirect('/mis-propiedades')
    
    //Revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !==req.usuario.id.toString())
        return res.redirect('/mis-propiedades')

    
    res.render('propiedades/editar',{
        pagina:`Editar Propiedad ${propiedad.titulo}`,
        csrfToken:req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    })
}

const guardarCambios = async (req,res)=>{
    //Verificar la validacion
    let resultado = validationResult(req)
    

    if(!resultado.isEmpty()){
        const [categorias,precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
        return res.render('propiedades/editar',{
            pagina:'Editar Propiedad',
            csrfToken:req.csrfToken(),
            categorias,
            precios,
            datos: req.body,
            errores:resultado.array()
        })
    }
    const {id} = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad)
        return res.redirect('/mis-propiedades')
    
    //Revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !==req.usuario.id.toString())
        return res.redirect('/mis-propiedades')

    //Reescribir el objeto y actualizarlo
    try {
        const{titulo,descripcion,habitaciones,estacionamiento,wc,calle,lat,lng,precio:precioId,categoria:categoriaId}=req.body
        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        })
        await propiedad.save()
        res.redirect('/mis-propiedades')
    } catch (error) {
        console.log(error)
    }
}

const eliminar = async(req,res)=>{
    const{id} = req.params
    const propiedad = await Propiedad.findByPk(id)


    if(!propiedad)
        return res.redirect('/mis-propiedades')
    
    //Revisar que quien visita la URL es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString())
        return res.redirect('/mis-propiedades') 
    
    //Eliminar la imagen asosiada
    await unlink(`public/uploads/${propiedad.imagen}`)

    ///Eliminar la propiedad
    await propiedad.destroy()
    res.redirect('/mis-propiedades')
}

//Muestra una propiedad
const mostrarPropiedad = async(req,res)=>{
    const {id} = req.params
    // const propiedad = await Propiedad.findByPk(id)
    const propiedad = await Propiedad.findByPk(id,{ 
        //Incluye el modelo en la consulta
        include:[
            {model: Categoria, as: 'categoria'},
            {model: Precio, as:'precio'}
        ]
    })
    if(!propiedad)
        return res.redirect('/404')

    res.render('propiedades/mostrar',{
        propiedad ,
        pagina: propiedad.titulo,
        csrfToken:req.csrfToken(),

    })
}
export{
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad
}