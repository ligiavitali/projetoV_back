import dotenv from "dotenv";
import app from "./app.js";
import { pool } from "./db.js";
import { ensureDatabaseSchema } from "./initDatabase.js";

dotenv.config();

const PORT = Number(process.env.PORT || 3001);

const start = async () => {
  try {
    await pool.query("SELECT 1");
    await ensureDatabaseSchema();
    app.listen(PORT, () => {
      console.log(`Backend rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Falha ao conectar no PostgreSQL:", error.message);
    process.exit(1);
  }
};

start();
