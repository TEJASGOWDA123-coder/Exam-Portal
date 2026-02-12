const { drizzle } = require("drizzle-orm/libsql");
const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function seed() {
    const email = "admin@cdc.com";
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Seeding admin: ${email}...`);

    try {
        // Check if user exists
        // Note: Since this is a standalone script, we might not have access to the schema objects easily without complex setup.
        // We'll use raw SQL for simplicity if needed, or try to import but it's risky with TS/Next.js setup.

        await client.execute({
            sql: "INSERT OR REPLACE INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            args: ["admin-1", "Admin", email, hashedPassword, "admin", Date.now()]
        });

        console.log("Admin seeded successfully!");
        console.log(`Email: ${email}`);
        console.log(`Password: admin123`);
    } catch (error) {
        console.error("Failed to seed admin:", error);
    } finally {
        process.exit();
    }
}

seed();
