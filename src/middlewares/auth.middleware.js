const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Formato esperado: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secreto_super_seguro';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Guardamos los datos del usuario en la request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

const isAdmin = (req, res, next) => {
  // Verificamos el rol que guardamos en el login
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Requiere privilegios de Administrador.' });
  }
};

module.exports = { verifyToken, isAdmin };