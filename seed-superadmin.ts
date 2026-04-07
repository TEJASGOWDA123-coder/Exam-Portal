import "dotenv/config";
import { db } from "./lib/db";
import { users } from "./lib/db/schema";
import bcrypt from "bcryptjs";

async function seed() {
    const email = "superadmin@example.com";
    const password = "adminpassword"; // Change this in production
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
        id: "superadmin-1",
        name: "Super Admin",
        email,
        password: hashedPassword,
        role: "superadmin",
    }).onConflictDoNothing();

    console.log("Superadmin seeded!");
}

seed();
// [
//   {
//     "id": "superadmin-1",
//     "name": "Super Admin",
//     "email": "admin@cdc.com",
//     "password": "$2b$10$NBiqPRbmeJ/iFQ9biXFkV.bCVJFpnEllaH3jxWX9XavCpU0PGM1uq",
//     "role": "superadmin",
//     "created_at": 1707900000000
//   }
// ]