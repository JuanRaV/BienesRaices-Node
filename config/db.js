import Sequelize from "sequelize";
import dotenv from 'dotenv'
dotenv.config({path:'.env'});

const db= new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,{
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    dialect:'mysql',
    define:{
        timestamps:true //Crea 2 columnas extras en la base de datos: Una cuando fue creado el usuario y cuando fue actualizado
    },
    pool:{ //Configura como sera el comportamineto para conexiones nuevas
        max:5, //Cuanto es el maximo de conexiones a mantener
        min:0, //El minimo
        acquire:30000, //30 segundos el tiempo que intentara una conexion antes de marcar error
        idle: 10000 //Cuando no hay moviemientos o visitas, en 10 segundos la conexion finalizara
    },
    operatorAliases:false
})


export default db; 