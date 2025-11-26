require('dotenv').config(); // Cargar config
const db = require('./db/db');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
    try {
        const newPassword = 'admin123';
        // 1. Encriptar la contraseña "en vivo" con tu librería instalada
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 2. Actualizar el usuario en la base de datos
        // Asegúrate de que el email coincida con el que usas en Postman
        const res = await db.query(
            'UPDATE users SET password = $1 WHERE email = $2 RETURNING *',
            [hashedPassword, 'admin@tienda.com']
        );

        if (res.rows.length > 0) {
            console.log('✅ Contraseña actualizada correctamente para admin@tienda.com');
            console.log('🔑 Nueva contraseña encriptada:', hashedPassword);
        } else {
            console.log('⚠️ No se encontró el usuario admin@tienda.com. Revisa si el email es correcto.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al actualizar password:', error);
        process.exit(1);
    }
}

resetAdminPassword();