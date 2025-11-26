const jwt = require('jsonwebtoken');

// Middleware para verificar si el usuario está logueado
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // El formato suele ser: "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Guardamos los datos del usuario en la petición
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

// Middleware para verificar si es Admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') { // Nota: en el token guardamos 'rol' (mira authController)
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de Administrador.' });
    }
};

module.exports = { verifyToken, isAdmin };