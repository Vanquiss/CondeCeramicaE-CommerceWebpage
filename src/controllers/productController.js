const productModel = require('../models/productModel');

// RF-11: Registrar producto
const createProduct = async (req, res) => {
    try {
        // Validar campos obligatorios (según RF-11: Nombre, Precio, Imagen obligatorios)
        const { name, price, image_url } = req.body;
        if (!name || !price || !image_url) {
            return res.status(400).json({ message: 'Nombre, precio e imagen son obligatorios.' });
        }

        const newProduct = await productModel.createProduct(req.body);
        res.status(201).json({ message: 'Producto creado exitosamente', product: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el producto' });
    }
};

// RF-4: Listar productos
const listProducts = async (req, res) => {
    try {
        const products = await productModel.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

module.exports = { createProduct, listProducts };