import "dotenv/config";
import { db } from "./lib/db";
import { submissions, exams, users, students } from "./lib/db/schema";

async function check() {
    console.log("Checking database...");

    const allUsers = await db.select().from(users);
    console.log("Total Users:", allUsers.length);
    console.log("Users:", allUsers.map(u => ({ email: u.email, role: u.role })));

    const allExams = await db.select().from(exams);
    console.log("Total Exams:", allExams.length);
    console.log("Exam IDs:", allExams.map(e => e.id));

    const allStudents = await db.select().from(students);
    console.log("Total Students:", allStudents.length);

    const allSubmissions = await db.select().from(submissions);
    console.log("Total Submissions:", allSubmissions.length);
    if (allSubmissions.length > 0) {
        console.log("Submissions detail:", allSubmissions.map(s => ({
            id: s.id,
            examId: s.examId,
            usn: s.usn,
            score: s.score
        })));
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
