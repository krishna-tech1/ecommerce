const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not defined in .env");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log("Truncating all database tables to clear state...");
  try {
    await sql`TRUNCATE TABLE abandoned_carts CASCADE;`;
    await sql`TRUNCATE TABLE meta_events CASCADE;`;
    await sql`TRUNCATE TABLE order_items CASCADE;`;
    await sql`TRUNCATE TABLE orders CASCADE;`;
    await sql`TRUNCATE TABLE users CASCADE;`;
    console.log("Truncation successful!");

    console.insert = true;
    console.log("Inserting admin user 'Muthu'...");
    await sql`
      INSERT INTO users (name, email, phone, role, created_at)
      VALUES (
        'Muthu',
        'muthukrishnan8733@gmail.com',
        '9876543210',
        'admin',
        NOW()
      );
    `;
    console.log("Successfully seeded admin user!");
  } catch (err) {
    console.error("Error during seeding:", err);
  }
}

run();
