import "dotenv/config";
import { turso } from "./lib/turso";
import bcrypt from "bcryptjs";

async function init() {
    console.log("Starting manual database migration...");

    try {
        // Create users table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT,
                role TEXT NOT NULL DEFAULT 'student',
                created_at INTEGER NOT NULL
            )
        `);
        console.log("Users table OK");

        // Create exams table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS exams (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                duration INTEGER NOT NULL,
                total_marks INTEGER NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'upcoming',
                proctoring_enabled INTEGER NOT NULL DEFAULT 0,
                created_by TEXT NOT NULL REFERENCES users(id),
                created_at INTEGER NOT NULL
            )
        `);
        console.log("Exams table OK");

        // Create questions table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS questions (
                id TEXT PRIMARY KEY,
                exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                question TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )
        `);
        console.log("Questions table OK");

        // Create submissions table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS submissions (
                id TEXT PRIMARY KEY,
                exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                student_name TEXT NOT NULL,
                usn TEXT NOT NULL,
                email TEXT NOT NULL,
                class TEXT NOT NULL,
                section TEXT NOT NULL,
                score INTEGER NOT NULL,
                submitted_at INTEGER NOT NULL
            )
        `);
        await turso.execute(`
            CREATE UNIQUE INDEX IF NOT EXISTS exam_usn_unique ON submissions(exam_id, usn)
        `);
        console.log("Submissions table OK");

        // Seed superadmin
        const email = "superadmin@example.com";
        const password = "adminpassword";
        const hashedPassword = await bcrypt.hash(password, 10);

        await turso.execute({
            sql: "INSERT OR IGNORE INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            args: ["superadmin-1", "Super Admin", email, hashedPassword, "superadmin", Date.now()]
        });
        console.log("Superadmin seeded!");

    } catch (error) {
        console.error("Migration failed:", error);
    }
}

init();
