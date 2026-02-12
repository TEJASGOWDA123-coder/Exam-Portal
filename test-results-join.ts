import "dotenv/config";
import { db } from "./lib/db";
import { submissions } from "./lib/db/schema";

async function testSubmissions() {
    try {
        const allSubmissions = await db.select({
            id: submissions.id,
            examId: submissions.examId,
            studentName: submissions.studentName,
            usn: submissions.usn,
            email: submissions.email,
            class: submissions.class,
            section: submissions.section,
            score: submissions.score,
            submittedAt: submissions.submittedAt,
        })
            .from(submissions);

        console.log("All Submissions:", JSON.stringify(allSubmissions, null, 2));
        console.log("Total Submissions:", allSubmissions.length);
        process.exit(0);
    } catch (err) {
        console.error("Submissions test failed:", err);
        process.exit(1);
    }
}

testSubmissions();
