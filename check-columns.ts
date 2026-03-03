import "dotenv/config";
import { turso } from "./lib/turso";

async function check() {
    try {
        const resSub = await turso.execute("PRAGMA table_info(submissions)");
        console.log("Columns in submissions:");
        console.table(resSub.rows.map(r => ({ name: r.name, type: r.type, notnull: r.notnull })));

        const resStud = await turso.execute("PRAGMA table_info(students)");
        console.log("Columns in students:");
        console.table(resStud.rows.map(r => ({ name: r.name, type: r.type, notnull: r.notnull })));
    } catch (e) {
        console.error("Failed to check columns:", e);
    }
}

check();
