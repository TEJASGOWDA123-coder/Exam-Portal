import "dotenv/config";
import { turso } from "./lib/turso";

async function check() {
    try {
        const res = await turso.execute("PRAGMA table_info(submissions)");
        console.log("Columns in submissions:");
        console.table(res.rows.map(r => ({ name: r.name, type: r.type, notnull: r.notnull })));
    } catch (e) {
        console.error("Failed to check columns:", e);
    }
}

check();
