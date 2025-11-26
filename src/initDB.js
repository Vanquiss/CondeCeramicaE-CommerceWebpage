// 1. ¡IMPORTANTE! Cargar variables de entorno PRIMERO
require('dotenv').config(); 

const db = require('./db/db');
const fs = require('fs');
const path = require('path');

async function initDB() {
  try {
    // Ajusta la ruta si tu carpeta 'database' está fuera de 'src'
    // Opción A: Si 'database' está dentro de 'src': path.join(__dirname, 'database', 'schema.sql');
    // Opción B: Si 'database' está en la raíz (fuera de src): path.join(__dirname, '../database/schema.sql');
    
    // Según tu imagen anterior, 'database' está en la raíz, así que usa '../database':
    const sqlPath = path.join(__dirname, '../database/schema.sql');
    
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await db.query(sql);
    
    console.log("✅ Tablas creadas y datos iniciales insertados correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al inicializar la base de datos:", error);
    process.exit(1);
  }
}

initDB();