const db = require('../db/db');

// RF-11: Crear un nuevo producto
const createProduct = async (product) => {
    const { name, description, price, stock, image_url, category_id, is_featured } = product;
    
    const query = `
        INSERT INTO products (name, description, price, stock, image_url, category_id, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    
    const values = [name, description, price, stock, image_url, category_id, is_featured || false];
    const result = await db.query(query, values);
    return result.rows[0];
};

// RF-4: Obtener todos los productos (Activos)
const getAllProducts = async () => {
    // Solo traemos los que is_active = true
    const query = `
        SELECT p.*, c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = TRUE
        ORDER BY p.created_at DESC;
    `;
    const result = await db.query(query);
    return result.rows;
};

module.exports = { createProduct, getAllProducts };