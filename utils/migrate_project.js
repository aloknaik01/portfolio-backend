import "dotenv/config";
import { query } from "file:///C:/Users/alokn/Desktop/Portfolio/portfolio-backend/database/dbConnection.js";

async function run() {
  try {
    await query(`ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS category varchar(255) DEFAULT 'Full Stack';`);
    console.log("Project table updated with category column!");
    process.exit(0);
  } catch(e) {
    console.log("Error updating table:", e);
    process.exit(1);
  }
}

run();
