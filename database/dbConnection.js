import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: !process.env.DATABASE_URL ? process.env.DB_USER : undefined,
  host: !process.env.DATABASE_URL ? process.env.DB_HOST : undefined,
  database: !process.env.DATABASE_URL ? process.env.DB_DATABASE : undefined,
  password: !process.env.DATABASE_URL ? process.env.DB_PASSWORD : undefined,
  port: !process.env.DATABASE_URL ? (process.env.DB_PORT || 5432) : undefined,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

console.log("Database pool initialized.");

export const query = (text, params) => pool.query(text, params);
export default pool;