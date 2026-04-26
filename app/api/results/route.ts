import { db } from "@/lib/db";
import { submissions, exams, students, examSessions } from "@/lib/db/schema";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "admin" && (session.user as any)?.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");

    try {
        if (examId) {
            // Enhanced fetch for specific exam - includes in-progress students
            const allStudents = await db.query.students.findMany({
                where: eq(students.examId, examId)
            });
            
            const allSubmissions = await db.query.submissions.findMany({
                where: eq(submissions.examId, examId)
            });

            // Map students to submissions
            const consolidated = allStudents.map(student => {
                const submission = allSubmissions.find(s => s.usn === student.usn);
                if (submission) {
                    return {
                        ...submission,
                        status: "submitted"
                    };
                }
                return {
                    id: student.id,
                    examId: student.examId,
                    studentName: student.name,
                    usn: student.usn,
                    email: student.email,
                    class: student.class,
                    year: student.year,
                    section: student.section,
                    score: 0,
                    violations: 0,
                    status: "in-progress"
                };
            });

            return NextResponse.json(consolidated);
        }

        const result = await db.select().from(submissions);
        return NextResponse.json(result.map(r => ({ ...r, status: "submitted" })));
    } catch (error) {
        console.error("Failed to fetch consolidated results:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { examId, studentName, usn, email, class: studentClass, year, section, score, violations, sectionScores, answers, justifications } = data;

        if (!examId || !usn || !studentName) {
            return NextResponse.json({ error: "Missing critical fields" }, { status: 400 });
        }

        // Fetch exam to check if SEB is required
        const exam = await db.query.exams.findFirst({
            where: eq(exams.id, examId)
        });

        if (exam?.sebConfigId) {
            const ua = req.headers.get("user-agent") || "";
            if (!ua.includes("SEB")) {
                return NextResponse.json({
                    error: "Security violation: This exam must be submitted using the Safe Exam Browser.",
                }, { status: 403 });
            }
        }

        const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        try {
            await db.insert(submissions).values({
                id,
                examId,
                studentName,
                usn,
                email,
                class: studentClass,
                year: year,
                section,
                score,
                violations: violations || 0,
                sectionScores: sectionScores ? JSON.stringify(sectionScores) : null,
                answers: answers ? JSON.stringify(answers) : null,
                justifications: justifications ? JSON.stringify(justifications) : null,
                submittedAt: new Date()
            });
        } catch (dbError: any) {
            console.error("Database error during insert:", dbError);
            if (dbError.message?.includes("UNIQUE constraint failed")) {
                return NextResponse.json({
                    error: "You have already submitted this exam.",
                }, { status: 409 });
            }
            return NextResponse.json({
                error: `Database error: ${dbError.message}`,
            }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Top-level submission error:", error);
        return NextResponse.json({
            error: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "admin" && (session.user as any)?.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const examId = searchParams.get("examId");

        if (!examId) {
            return NextResponse.json({ error: "Missing examId" }, { status: 400 });
        }

        // Clear everything for this exam
        await db.delete(submissions).where(eq(submissions.examId, examId));
        await db.delete(examSessions).where(eq(examSessions.examId, examId));
        await db.delete(students).where(eq(students.examId, examId));

        return NextResponse.json({ success: true, message: "Exam history reset. Candidates can now re-register or re-take." });
    } catch (error: any) {
        console.error("Failed to bulk reset exam history:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
