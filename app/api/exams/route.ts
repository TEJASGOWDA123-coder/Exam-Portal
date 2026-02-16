// VERIFIED_FIX_2026-02-15_V1
import { db } from "@/lib/db";
import { exams, questions } from "@/lib/db/schema";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const result = await db.select().from(exams);

        // Fetch questions for each exam
        const examsWithQuestions = await Promise.all(
            result.map(async (exam) => {
                const examQuestions = await db
                    .select()
                    .from(questions)
                    .where(eq(questions.examId, exam.id));

                const now = new Date();
                const start = new Date(exam.startTime);
                const end = new Date(exam.endTime);

                let status = exam.status;
                if (now < start) status = "upcoming";
                else if (now >= start && now <= end) status = "active";
                else status = "completed";

                const parseJson = (val: any) => {
                    if (typeof val === "string") {
                        try { return JSON.parse(val); } 
                        catch (e) { return []; }
                    }
                    return val || [];
                };

                return {
                    ...exam,
                    status,
                    sectionsConfig: parseJson(exam.sectionsConfig),
                    blueprint: parseJson(exam.blueprint),
                    questions: examQuestions.map(q => ({
                        id: q.id,
                        type: q.type,
                        question: q.question,
                        questionImage: q.questionImage,
                        options: parseJson(q.options),
                        correctAnswer: q.correctAnswer,
                        section: q.section,
                        sectionId: q.sectionId,
                        marks: q.marks,
                        requiresJustification: q.requiresJustification,
                        solution: q.solution,
                        source: q.source
                    })),
                };
            })
        );

        return NextResponse.json(examsWithQuestions);
    } catch (error) {
        console.error("Failed to fetch exams:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin" && (session.user as any)?.role !== "superadmin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const { id, title, duration, totalMarks, startTime, endTime, status, proctoringEnabled, showResults, sebConfigId, questions: examQuestions, blueprint } = data;



        await db.transaction(async (tx) => {
            const existingExam = await tx.query.exams.findFirst({
                where: eq(exams.id, id),
            });

            const examValues = {
                title,
                duration,
                totalMarks,
                startTime,
                endTime,
                status,
                proctoringEnabled: proctoringEnabled ? 1 : 0,
                showResults: showResults !== undefined ? (showResults ? 1 : 0) : 1,
                sebConfigId: sebConfigId || null,
                sectionsConfig: data.sectionsConfig ? JSON.stringify(data.sectionsConfig) : null,
                blueprint: blueprint ? JSON.stringify(blueprint) : null
            };

            if (existingExam) {
                await tx.update(exams).set(examValues).where(eq(exams.id, id));
                await tx.delete(questions).where(eq(questions.examId, id));
            } else {
                await tx.insert(exams).values({ id, ...examValues });
            }

            if (examQuestions && examQuestions.length > 0) {
                for (const q of examQuestions) {
                    await tx.insert(questions).values({
                        id: q.id || `q-${Date.now()}-${Math.random()}`,
                        examId: id,
                        type: q.type || "mcq",
                        question: q.question,
                        questionImage: q.questionImage,
                        options: q.options ? JSON.stringify(q.options) : null,
                        correctAnswer: q.correctAnswer,
                        section: q.section || "General",
                        sectionId: q.sectionId,
                        marks: q.marks || 1,
                        requiresJustification: q.requiresJustification || false,
                        solution: q.solution,
                        source: q.source || "generated"
                    });
                }
            }
        });

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error("Failed to save exam:", error);
        

        
        return NextResponse.json({ 
            error: error?.message || "Internal Server Error",
            details: error?.message || "Failed to save exam. Please check the console for details."
        }, { status: 500 });
    }
}
