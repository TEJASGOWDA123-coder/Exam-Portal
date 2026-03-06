import { db } from "./lib/db/index";

async function main() {
    try {
        const examsData = await db.query.exams.findMany({
            with: { questions: true }
        });

        for (const exam of examsData) {
            console.log(`Exam ID: ${exam.id}, Title: ${exam.title}`);
            const sectionsConfig = typeof exam.sectionsConfig === 'string' ? JSON.parse(exam.sectionsConfig) : exam.sectionsConfig;
            console.log(`sectionsConfig:`, JSON.stringify(sectionsConfig, null, 2));

            const pools: Record<string, number> = {};
            for (const q of (exam.questions || [])) {
                const s = q.section || "General";
                pools[s] = (pools[s] || 0) + 1;
            }
            console.log(`Questions per section in DB:`, pools);
            console.log("---------------------------------------------------");
        }
    } catch (e) {
        console.error(e);
    }
}
main();
