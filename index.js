// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importamos tus rutas
const authRoutes = require('./src/routes/auth.routes');
const productRoutes = require('./src/routes/product.routes');

const app = express();

// Middlewares obligatorios
app.use(cors());
app.use(express.json()); // Para entender JSON

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend listo en http://localhost:${PORT}`);
  console.log('Use terminal (curl) para probar.\n');
});