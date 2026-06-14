const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not defined in .env");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log("Truncating users table to avoid unique constraint conflict on push...");
  try {
    await sql`TRUNCATE TABLE users CASCADE;`;
    console.log("Successfully truncated users table!");
  } catch (err) {
    console.error("Error truncating table:", err);
  }
}

run();
