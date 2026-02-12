import "dotenv/config";
import { db } from "./lib/db";
import { exams, submissions } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function testSubmit() {
    console.log("Testing submission...");

    const exam = await db.query.exams.findFirst();
    if (!exam) {
        console.log("No exam found, cannot test.");
        return;
    }

    console.log("Found exam:", exam.id);

    try {
        const id = `test-sub-${Date.now()}`;
        await db.insert(submissions).values({
            id,
            examId: exam.id,
            studentName: "Test Student",
            usn: "TEST001",
            email: "test@example.com",
            class: "10",
            section: "A",
            score: 80,
            violations: 0,
        });
        console.log("Submission successful!");

        const count = await db.select().from(submissions);
        console.log("New submission count:", count.length);

        // Cleanup if needed
        // await db.delete(submissions).where(eq(submissions.id, id));
        // console.log("Cleaned up.");
    } catch (err) {
        console.error("Submission failed:", err);
    }

    process.exit(0);
}

testSubmit();
