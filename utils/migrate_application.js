import "dotenv/config";
import { query } from "../database/dbConnection.js";

async function run() {
  try {
    await query(`
      ALTER TABLE "Application" 
      ADD COLUMN IF NOT EXISTS "level" varchar(255) DEFAULT 'Development',
      ADD COLUMN IF NOT EXISTS "description" TEXT DEFAULT 'Software application and development tool.';
    `);
    console.log("Application table updated with level and description columns!");
    process.exit(0);
  } catch(e) {
    console.log("Error updating table:", e);
    process.exit(1);
  }
}

run();
