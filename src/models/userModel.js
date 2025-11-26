// src/models/userModel.js
const db = require('../db/db');

/**
 * Busca un usuario por su email.
 * @param {string} email - Email del usuario a buscar.
 * @returns {Promise<Object|null>} El objeto usuario o null si no se encuentra.
 */
async function findUserByEmail(email) {
    // Nota: El Administrador debe existir en la tabla Usuarios para iniciar sesión.
    const query = 'SELECT id, email, contraseña, rol FROM Usuarios WHERE email = $1';
    
    try {
        const result = await db.query(query, [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error al buscar usuario por email:", error);
        throw new Error('Error de base de datos');
    }
}

module.exports = {
    findUserByEmail
};