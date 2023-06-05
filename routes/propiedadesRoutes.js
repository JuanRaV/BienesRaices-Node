import express from 'express'
import { body } from 'express-validator'
import { admin,crear,guardar,agregarImagen} from '../controllers/propiedadController.js'
import protegerRuta from '../middleware/protegerRuta.js'

const router = express.Router()

router.get('/mis-propiedades',protegerRuta,admin)
router.get('/propiedades/crear',crear) 
router.post('/propiedades/crear',
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripcion es obligatoria')
        .isLength({max:200}).withMessage('La descripcion es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona una numero de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona un numero de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona una numero de banios'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardar
) //Validation in route
router.get('/propiedades/agregar-imagen/:id',agregarImagen)
export default router