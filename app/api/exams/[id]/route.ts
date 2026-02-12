import { db } from "@/lib/db";
import { exams, questions, submissions, students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const exam = await db.query.exams.findFirst({
            where: eq(exams.id, id),
            with: {
                questions: true,
            },
        });

        if (!exam) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }

        const examWithParsedQuestions = {
            ...exam,
            questions: (exam as any).questions?.map((q: any) => ({
                ...q,
                options: typeof q.options === "string" ? JSON.parse(q.options) : (q.options || [])
            })) || []
        };

        return NextResponse.json(examWithParsedQuestions);
    } catch (error) {
        console.error("Failed to fetch exam:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== "admin" && role !== "superadmin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Delete associated data first
        await db.delete(questions).where(eq(questions.examId, id));
        await db.delete(submissions).where(eq(submissions.examId, id));
        await db.delete(students).where(eq(students.examId, id));

        // Delete exam
        const result = await db.delete(exams).where(eq(exams.id, id));

        return NextResponse.json({ message: "Exam and all associated data deleted successfully" });
    } catch (error) {
        console.error("Failed to delete exam:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
