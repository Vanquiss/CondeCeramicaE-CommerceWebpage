const db = require('../db/db');

async function findUserByEmail(email) {
    // CORRECCIÓN: Usamos 'password' y 'role' (en inglés) para coincidir con tu DB
    const query = 'SELECT id, email, password, role FROM users WHERE email = $1';
    
    try {
        const result = await db.query(query, [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error al buscar usuario:", error);
        throw error;
    }
}

module.exports = {
    findUserByEmail
};