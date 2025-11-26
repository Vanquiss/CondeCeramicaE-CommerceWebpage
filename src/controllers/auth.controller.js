const prisma = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Se requieren email y contraseña." });
  }

  try {
    // 1. Buscar en la tabla AdminUser con Prisma
    const user = await prisma.adminUser.findUnique({
      where: { email: email }
    });

    // 2. Verificar si existe y si la contraseña coincide
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // 3. Generar Token JWT
    // Payload: Guardamos el ID y hardcodeamos el rol 'admin' ya que viene de la tabla AdminUser
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'admin' },
      process.env.JWT_SECRET || 'secreto_super_seguro', 
      { expiresIn: '8h' }
    );

    res.json({
      message: `Bienvenido al panel, ${user.name}`,
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = { login };