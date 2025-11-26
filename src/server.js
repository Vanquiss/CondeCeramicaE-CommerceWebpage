require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const db = require('./db/db'); // Importar conexión a DB
const path = require('path');

// --- IMPORTACIÓN DE RUTAS ---
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES GLOBALES ---
// Permite que el servidor entienda peticiones con cuerpo JSON (req.body)
app.use(express.json());

//CONFIGURAR CARPETA PÚBLICA (Agrega esta línea)
// Esto dice: "Cuando alguien pida una URL que empiece con /uploads, busca el archivo en la carpeta public/uploads"
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// --- DEFINICIÓN DE RUTAS (ENDPOINTS) ---

// 1. Rutas de Autenticación (RF-1)
// Prefijo: http://localhost:3000/api/auth
app.use('/api/auth', authRoutes);

// 2. Rutas de Productos (RF-4, RF-11)
// Prefijo: http://localhost:3000/api/products
app.use('/api/products', productRoutes);

// 3. Ruta de Prueba de Salud (Health Check)
// Acceso: http://localhost:3000/
app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({
      message: '✅ Servidor Express funcionando correctamente.',
      database_status: '✅ Conexión a PostgreSQL exitosa.',
      server_time: result.rows[0].now,
    });
  } catch (error) {
    console.error('❌ Error de conexión a la BD:', error.message);
    res.status(500).json({
      message: '⚠️ Servidor funcionando, pero sin base de datos.',
      error: error.message,
    });
  }
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Rutas de Auth activas en /api/auth`);
  console.log(`📦 Rutas de Productos activas en /api/products`);
});