const { Pool } = require("pg");
require("dotenv").config();

// Configuramos el pool usando las variables individuales
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,      // Esto será 'db' (gracias a Docker)
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Solo activamos SSL si estamos en producción REAL (como Heroku/Render), 
  // pero NO si estamos en Docker local, aunque la variable diga 'production'.
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;