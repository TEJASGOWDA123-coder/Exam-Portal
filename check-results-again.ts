import "dotenv/config";
import { db } from "./lib/db";
import { submissions } from "./lib/db/schema";

async function check() {
    try {
        const allSubmissions = await db.select().from(submissions);
        console.log("Total Submissions:", allSubmissions.length);

        if (allSubmissions.length > 0) {
            console.log("First Submission:", JSON.stringify(allSubmissions[0], null, 2));
            console.log("Student Name:", allSubmissions[0].studentName);
            console.log("USN:", allSubmissions[0].usn);
            console.log("Score:", allSubmissions[0].score);
        } else {
            console.log("No submissions found in database");
        }

        process.exit(0);
    } catch (err) {
        console.error("DB check failed:", err);
        process.exit(1);
    }
}

check();
