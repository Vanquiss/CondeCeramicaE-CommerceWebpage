const { Pool } = require('pg');

// Las variables de entorno son cargadas automáticamente por dotenv
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Opcional: configurar pool size y timeout
  // max: 20, 
  // idleTimeoutMillis: 30000,
});

// Verificación de conexión (opcional, pero útil)
pool.on('connect', () => {
  console.log('Conexión exitosa a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1); // Salir de la aplicación si hay un error grave
});

module.exports = {
  // Exportamos el método 'query' y el objeto 'pool'
  query: (text, params) => pool.query(text, params),
  pool,
};