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

        // Create sections table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS sections (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                identity_prompt TEXT NOT NULL,
                transformation_prompt TEXT NOT NULL,
                validation_rules TEXT,
                output_schema TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at INTEGER NOT NULL
            )
        `);
        console.log("Sections table OK");

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
                sections_config TEXT,
                blueprint TEXT,
                generated_questions TEXT,
                status TEXT NOT NULL DEFAULT 'upcoming',
                proctoring_enabled INTEGER NOT NULL DEFAULT 0,
                show_results INTEGER NOT NULL DEFAULT 1,
                seb_config_id TEXT,
                created_by TEXT NOT NULL REFERENCES users(id),
                created_at INTEGER NOT NULL
            )
        `);
        console.log("Exams table OK");

        // Add blueprint and generated_questions to exams if they don't exist (using individual try-catch for SQLITE compatibility)
        try { await turso.execute("ALTER TABLE exams ADD COLUMN blueprint TEXT"); } catch(e) {}
        try { await turso.execute("ALTER TABLE exams ADD COLUMN generated_questions TEXT"); } catch(e) {}
        try { await turso.execute("ALTER TABLE exams ADD COLUMN sections_config TEXT"); } catch(e) {}
        try { await turso.execute("ALTER TABLE exams ADD COLUMN show_results INTEGER NOT NULL DEFAULT 1"); } catch(e) {}
        try { await turso.execute("ALTER TABLE exams ADD COLUMN seb_config_id TEXT"); } catch(e) {}

        // Create students table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS students (
                id TEXT PRIMARY KEY,
                exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                usn TEXT NOT NULL,
                class TEXT NOT NULL,
                section TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )
        `);
        console.log("Students table OK");

        // Create questions table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS questions (
                id TEXT PRIMARY KEY,
                exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                section_id TEXT REFERENCES sections(id),
                question TEXT NOT NULL,
                question_image TEXT,
                options TEXT,
                correct_answer TEXT NOT NULL,
                solution TEXT,
                section TEXT NOT NULL DEFAULT 'General',
                marks INTEGER NOT NULL DEFAULT 1,
                requires_justification INTEGER NOT NULL DEFAULT 0,
                source TEXT NOT NULL DEFAULT 'generated',
                source_id TEXT,
                embedding TEXT,
                created_at INTEGER NOT NULL
            )
        `);
        console.log("Questions table OK");

        // Add new columns to questions if they don't exist
        try { await turso.execute("ALTER TABLE questions ADD COLUMN section_id TEXT REFERENCES sections(id)"); } catch(e) {}
        try { await turso.execute("ALTER TABLE questions ADD COLUMN solution TEXT"); } catch(e) {}
        try { await turso.execute("ALTER TABLE questions ADD COLUMN requires_justification INTEGER NOT NULL DEFAULT 0"); } catch(e) {}
        try { await turso.execute("ALTER TABLE questions ADD COLUMN source TEXT NOT NULL DEFAULT 'generated'"); } catch(e) {}
        try { await turso.execute("ALTER TABLE questions ADD COLUMN source_id TEXT"); } catch(e) {}
        try { await turso.execute("ALTER TABLE questions ADD COLUMN embedding TEXT"); } catch(e) {}
        try { await turso.execute("ALTER TABLE questions ADD COLUMN options TEXT"); } catch(e) {}
        try { await turso.execute("ALTER TABLE questions ADD COLUMN section TEXT NOT NULL DEFAULT 'General'"); } catch(e) {}
        try { await turso.execute("ALTER TABLE questions ADD COLUMN marks INTEGER NOT NULL DEFAULT 1"); } catch(e) {}

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
                violations INTEGER NOT NULL DEFAULT 0,
                section_scores TEXT,
                justifications TEXT,
                submitted_at INTEGER NOT NULL
            )
        `);
        // Add new columns if table already existed
        try { await turso.execute("ALTER TABLE submissions ADD COLUMN violations INTEGER NOT NULL DEFAULT 0"); } catch(e) {}
        try { await turso.execute("ALTER TABLE submissions ADD COLUMN section_scores TEXT"); } catch(e) {}
        try { await turso.execute("ALTER TABLE submissions ADD COLUMN justifications TEXT"); } catch(e) {}

        // Create seb_configs table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS seb_configs (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                config_data TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL
            )
        `);
        console.log("SEB Configs table OK");

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
