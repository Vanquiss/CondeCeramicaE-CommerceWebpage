// src/server.js
require('dotenv').config(); 
const express = require('express');
const db = require('./db/db'); 
const app = express();

// Importar rutas
const authRoutes = require('./routes/authRoutes'); // <--- AÑADIR

const PORT = process.env.PORT || 3000;

app.use(express.json());
// ------------------------------------------------------------------
// 1. RUTA DE PRUEBA Y VERIFICACIÓN DE CONEXIÓN A DB
// ------------------------------------------------------------------
app.get('/', async (req, res) => {
  try {
    // Prueba de conexión: consulta la fecha/hora actual del servidor DB
    const result = await db.query('SELECT NOW()');
    
    // Si la consulta es exitosa, la DB está conectada
    res.status(200).json({
      message: 'Servidor Express funcionando.',
      database_status: 'Conexión a PostgreSQL OK.',
      database_time: result.rows[0].now,
    });
  } catch (error) {
    console.error('Error al consultar la DB:', error.message);
    res.status(500).json({
      message: 'Servidor Express funcionando.',
      database_status: 'Error en la conexión a PostgreSQL.',
      error: error.message,
    });
  }
});

// ------------------------------------------------------------------
// 2. RUTAS DE LA APLICACIÓN (Auth, Productos, etc.)
//    Aquí conectarías las rutas de tu proyecto (RF-1 a RF-20)
// ------------------------------------------------------------------
app.use('/api/auth', authRoutes);
// ------------------------------------------------------------------
// 3. INICIO DEL SERVIDOR
// ------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});