const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// RUTAS PÚBLICAS
// RF-4: Cualquier invitado puede ver los productos
router.get('/', productController.listProducts);

// RUTAS PROTEGIDAS (Solo Admin)
// RF-11: Solo el admin puede crear productos
// Primero verificamos token, luego si es admin
router.post('/', verifyToken, isAdmin, productController.createProduct);

module.exports = router;