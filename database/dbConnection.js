import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});


pool.connect((err, client, release) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Database connected successfully!");
    release();
  }
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

console.log("Database pool initialized.");

export const query = (text, params) => pool.query(text, params);
export default pool;
