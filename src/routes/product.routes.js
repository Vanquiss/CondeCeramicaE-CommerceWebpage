const { Router } = require('express');
const { listProducts, createProduct } = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// Público
router.get('/', listProducts);

// Protegido (Solo admin)
router.post('/', verifyToken, isAdmin, createProduct);

module.exports = router;