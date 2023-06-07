import express from "express";
import csrf from 'csurf'
import cookieParser from "cookie-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import propiedadesRoutes from "./routes/propiedadesRoutes.js";
import appRoutes from "./routes/appRoutes.js"
import apiRoutes from './routes/apiRoutes.js'
import db from "./config/db.js";

//Creamos la app
const app = express();

//Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended:true}))

//Habilitar cookie parser
app.use(cookieParser());

//Habilitar el CSRF
app.use(csrf({cookie:true}))

//Conexion a la base de datos
try {
    await db.authenticate();
    db.sync()//Crea las tablas si no existen
    console.log('Conexion correcta a la base de datos');
    
} catch (error) {
    console.log(error)
}
//Habilitar Pug
app.set('view engine','pug') //Especificamos cual ViewEngine usaremos
app.set('views','./views')

//Carpeta publica
app.use(express.static('public')) //Node carga las vistas, imagenes, etc

//Routing
app.use('/',appRoutes)
app.use('/auth',usuarioRoutes); //Use busca todas las rutas que inicien con una diagonal, a excepcion de get que busca una ruta especifica
app.use('/',propiedadesRoutes)
app.use('/api',apiRoutes)

//Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
}) 