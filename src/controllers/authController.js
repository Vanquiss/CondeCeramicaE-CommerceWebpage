// src/controllers/authController.js
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Función para generar un token de sesión
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        rol: user.rol 
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
};

/**
 * Lógica para el login de Administrador (RF-1).
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        // Opción: Si no ingresa credenciales, se asume que sigue siendo Invitado (RF-1)
        return res.status(400).json({ message: "Se requieren email y contraseña." });
    }

    try {
        // 1. Buscar usuario
        const user = await userModel.findUserByEmail(email);

        // 2. Verificar credenciales
        if (!user || !(await bcrypt.compare(password, user.contraseña))) {
            return res.status(401).json({ message: "Credenciales inválidas." });
        }

        // 3. Generar Token y responder
        const token = generateToken(user);
        
        // El requisito RF-1 indica que al ser exitoso, presenta el panel de gestión.
        return res.status(200).json({
            message: `¡Bienvenido, ${user.rol}! Acceso concedido.`,
            token,
            user: { id: user.id, email: user.email, rol: user.rol }
        });

    } catch (error) {
        console.error("Error en el login:", error.message);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

module.exports = {
    login,
};