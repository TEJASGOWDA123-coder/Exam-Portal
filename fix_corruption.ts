import "dotenv/config";
import { db } from "./lib/db";
import { exams, questions } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function fix() {
    console.log("Starting database diagnostic...");

    const allExams = await db.select().from(exams);
    console.log(`Found ${allExams.length} exams.`);
    for (const exam of allExams) {
        console.log(`Exam ID: ${exam.id}`);
        console.log(`  sectionsConfig Type: ${typeof exam.sectionsConfig}`);
        console.log(`  sectionsConfig Value: ${JSON.stringify(exam.sectionsConfig)}`);
        
        if (typeof exam.sectionsConfig === "string") {
            try {
                if (exam.sectionsConfig.trim() !== "" && exam.sectionsConfig !== "null") {
                    JSON.parse(exam.sectionsConfig);
                    console.log("  JSON.parse: SUCCESS");
                }
            } catch (e: any) {
                console.log(`  JSON.parse: FAILED - ${e.message}`);
                console.log(`  FIXING...`);
                await db.update(exams)
                    .set({ sectionsConfig: null })
                    .where(eq(exams.id, exam.id));
            }
        }
    }

    process.exit(0);
}

fix().catch(err => {
    console.error(err);
    process.exit(1);
});
