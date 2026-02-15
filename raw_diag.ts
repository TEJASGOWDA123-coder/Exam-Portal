import "dotenv/config";
import { turso } from "./lib/turso";

async function raw() {
    console.log("Executing raw SQL query...");
    try {
        const res = await turso.execute("SELECT name FROM sqlite_master WHERE type='table'");
        console.log("Tables in database:", JSON.stringify(res, null, 2));
        
        const examsRes = await turso.execute("SELECT * FROM exams LIMIT 5");
        console.log("Exams (raw):", JSON.stringify(examsRes, null, 2));
    } catch (err: any) {
        console.error("Raw SQL Error:", err.message);
    }
    process.exit(0);
}

raw().catch(err => {
    console.error(err);
    process.exit(1);
});
