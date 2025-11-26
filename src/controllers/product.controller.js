const prisma = require('../db');

// RF-4: Listar productos
const listProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true }, // Solo activos
      include: { category: true }, // Traemos el nombre de la categoría
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

// RF-11: Crear producto
const createProduct = async (req, res) => {
  try {
    // Recibimos los datos (Soportamos image_url por compatibilidad con tu equipo)
    const { name, description, price, image_url, imageUrl, categoryId } = req.body;

    // Normalizamos la imagen (usamos la que venga)
    const finalImage = imageUrl || image_url;

    // Validación básica
    if (!name || !price || !finalImage || !categoryId) {
      return res.status(400).json({ 
        message: "Faltan datos: name, price, image_url y categoryId son obligatorios." 
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price), // Aseguramos que sea número
        imageUrl: finalImage,
        // Conectamos la categoría por ID
        category: {
            connect: { id: parseInt(categoryId) }
        },
        isActive: true
      }
    });

    res.status(201).json({ message: 'Producto creado', product: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    // Manejo de error si la categoría no existe
    if (error.code === 'P2025') {
        return res.status(400).json({ message: "El ID de categoría proporcionado no existe." });
    }
    res.status(500).json({ message: "Error al crear el producto" });
  }
};

module.exports = { listProducts, createProduct };