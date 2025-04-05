import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

export const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect()
  .then(() => console.log("🟢 PostgreSQL Connected"))
  .catch(err => console.error("🔴 PostgreSQL Error:", err));
