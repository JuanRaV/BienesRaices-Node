import multer from 'multer'
import path from 'path'
import {generarId} from '../helpers/tokens.js'

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./public/uploads/')
    },
    filename: function(req,file,cb){
        cb(null,generarId()+path.extname(file.originalname)) //Path es una dependencia que hay en node que te permite navegar entre carpetas y leer el filesystem, leer archivo y carpetas ,extname trae la extension del archivo
    }
})

const upload = multer ({storage})
export default upload