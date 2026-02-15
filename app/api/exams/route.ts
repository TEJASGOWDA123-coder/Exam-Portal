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
                if (now < start) {
                    status = "upcoming";
                } else if (now >= start && now <= end) {
                    status = "active";
                } else {
                    status = "completed";
                }

                let parsedSectionsConfig = [];
                if (typeof exam.sectionsConfig === "string") {
                    try {
                        parsedSectionsConfig = JSON.parse(exam.sectionsConfig);
                    } catch (e) {
                        console.error(`Error parsing sectionsConfig for exam ${exam.id}:`, e);
                        parsedSectionsConfig = [];
                    }
                } else if (exam.sectionsConfig) {
                    parsedSectionsConfig = exam.sectionsConfig;
                }

                return {
                    ...exam,
                    status,
                    sectionsConfig: parsedSectionsConfig,
                    questions: examQuestions.map(q => {
                        let parsedOptions = [];
                        if (typeof q.options === "string") {
                            try {
                                parsedOptions = JSON.parse(q.options);
                            } catch (e) {
                                console.error(`Error parsing options for question ${q.id}:`, e);
                                parsedOptions = [];
                            }
                        } else if (q.options) {
                            parsedOptions = q.options;
                        }

                        return {
                            id: q.id,
                            type: q.type,
                            question: q.question,
                            questionImage: q.questionImage,
                            options: parsedOptions,
                            correctAnswer: q.correctAnswer,
                            section: q.section,
                            marks: q.marks
                        };
                    }),
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
        const { id, title, duration, totalMarks, startTime, endTime, status, proctoringEnabled, questions: examQuestions } = data;

        await db.transaction(async (tx) => {
            const existingExam = await tx.query.exams.findFirst({
                where: eq(exams.id, id),
            });

            if (existingExam) {
                await tx.update(exams)
                    .set({
                        title,
                        duration,
                        totalMarks,
                        startTime,
                        endTime,
                        status,
                        proctoringEnabled: proctoringEnabled ? 1 : 0,
                        sectionsConfig: data.sectionsConfig ? JSON.stringify(data.sectionsConfig) : null
                    })
                    .where(eq(exams.id, id));
                await tx.delete(questions).where(eq(questions.examId, id));
            } else {
                await tx.insert(exams).values({
                    id,
                    title,
                    duration,
                    totalMarks,
                    startTime,
                    endTime,
                    status,
                    proctoringEnabled: proctoringEnabled ? 1 : 0,
                    sectionsConfig: data.sectionsConfig ? JSON.stringify(data.sectionsConfig) : null
                });
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
                        marks: q.marks || 1,
                    });
                }
            }
        });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Failed to save exam:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
