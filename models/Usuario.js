import {DataTypes, Sequelize} from 'sequelize'
import bcrypt from 'bcrypt'
import db from '../config/db.js'

const Usuario = db.define('usuarios',{ //Creamos la tabla
    nombre:{
        type:DataTypes.STRING,
        allowNull: false //Campo Obligatorio, no vacio
    },
    email:{
        type:DataTypes.STRING,
        allowNull: false 
    },
    password:{
        type:DataTypes.STRING,
        allowNull: false 
    },
    token:DataTypes.STRING,
    
    confirmado:DataTypes.BOOLEAN
},{
    hooks:{
        beforeCreate: async function(usuario)  {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password,salt)
        },
    },
    scopes:{
        eliminarPassword:{
            attributes:{
                exclude:['password','token','confirmado','createdAt','updatedAt']
            }
        }
    }
})
//Metodos personalizados
//Compararemos passwords para el login
Usuario.prototype.verificarPassword = function(password){
    return bcrypt.compareSync(password,this.password)
}
export default Usuario;