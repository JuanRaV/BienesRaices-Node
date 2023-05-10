import categorias from "./categorias.js";
import precios from "./precios.js";
import usuarios from "./usuarios.js";
import db from "../config/db.js";
import {Categoria,Precio, Usuario} from '../models/Index.js' //Importa con las relaciones

const importarDatos = async ()=>{
    try {
        //Autenticar en la DB
        await db.authenticate()

        //Generar las columnas
        await db.sync()

        //Insertar los datos en D
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])//Bulkcreate inserta todoss los datos

        console.log('Datos importados correctamente')
        process.exit() //Exit con 0 o vacio significa que termino el proceso BIEN, el 1 significa que hubo un error

    } catch (error) {
        console.log(error)
        process.exit(1) //Como trabaja directamente con la DB queremos terminar los procesos
    }
}

const eliminarDatos = async()=>{
    try {
        //Eliminar datos de la db
        await db.sync({force:true})
        console.log('Datos eliminados correctamente')
        process.exit()
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

if(process.argv[2]=== "-i"){
     importarDatos();
}

if(process.argv[2]=== "-e"){
    eliminarDatos();
}