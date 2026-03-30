import { db } from "@/lib/db";
import { submissions, exams, examSessions } from "@/lib/db/schema";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "admin" && (session.user as any)?.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await db.select().from(submissions);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to fetch submissions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { examId, studentName, usn, email, class: studentClass, year, section, score, violations, violationEvents, sectionScores, answers, justifications } = data;

        if (!examId || !usn || !studentName) {
            return NextResponse.json({ error: "Missing critical fields" }, { status: 400 });
        }

        // Fetch exam to check if SEB is required (skip if DB unreachable)
        let exam = null;
        try {
            exam = await db.query.exams.findFirst({
                where: eq(exams.id, examId)
            });
        } catch (fetchError: any) {
            // If DB is unreachable, skip SEB check and proceed with submission
            console.warn("Could not fetch exam for SEB check (network may be down), proceeding:", fetchError.cause?.code || fetchError.code);
        }

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
            // Check if submission already exists (e.g. from background sync)
            const existing = await db.query.submissions.findFirst({
                where: and(
                    eq(submissions.examId, examId),
                    eq(submissions.usn, usn)
                )
            });

            if (existing) {
                await db.update(submissions)
                    .set({
                        studentName,
                        email,
                        class: studentClass,
                        year: year,
                        section,
                        score,
                        violations: violations || 0,
                        violationEvents: violationEvents ? JSON.stringify(violationEvents) : null,
                        sectionScores: sectionScores ? JSON.stringify(sectionScores) : null,
                        answers: answers ? JSON.stringify(answers) : null,
                        justifications: justifications ? JSON.stringify(justifications) : null,
                        submittedAt: new Date()
                    })
                    .where(eq(submissions.id, existing.id));
            } else {
                // If no existing submission, insert a new one
                await db.insert(submissions)
                    .values({
                        id,
                        examId,
                        studentName,
                        usn,
                        email,
                        class: studentClass,
                        year: year,
                        section,
                        score: score || 0,
                        violations: violations || 0,
                        violationEvents: violationEvents ? JSON.stringify(violationEvents) : null,
                        sectionScores: sectionScores ? JSON.stringify(sectionScores) : null,
                        answers: answers ? JSON.stringify(answers) : null,
                        justifications: justifications ? JSON.stringify(justifications) : null,
                        submittedAt: new Date()
                    });
            }
            
            // Also update/finalize the exam session if it exists
            try {
                await db.update(examSessions)
                    .set({
                        status: "submitted",
                        updatedAt: new Date()
                    })
                    .where(and(
                        eq(examSessions.examId, examId),
                        eq(examSessions.studentUsn, usn)
                    ));
            } catch (sessionError) {
                console.error("Warning: Failed to finalize exam session:", sessionError);
                // We don't fail the submission if session update fails, as the result is already saved
            }

        } catch (dbError: any) {
            console.error("Database error during submission:", dbError);
            const isNetworkError =
                dbError.code === 'ENOTFOUND' ||
                dbError.cause?.code === 'ENOTFOUND' ||
                dbError.message?.includes('ENOTFOUND') ||
                dbError.cause?.message?.includes('ENOTFOUND');

            if (isNetworkError) {
                return NextResponse.json({
                    error: "Database temporarily unreachable. Your answers are saved locally and will sync automatically.",
                    networkError: true
                }, { status: 503 });
            }

            const isUniqueConstraint = 
                dbError.code === 'SQLITE_CONSTRAINT' || 
                dbError.cause?.code === 'SQLITE_CONSTRAINT' ||
                dbError.message?.includes("UNIQUE constraint failed") ||
                dbError.cause?.message?.includes("UNIQUE constraint failed");

            if (isUniqueConstraint) {
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
        const isNetworkError =
            error.code === 'ENOTFOUND' ||
            error.cause?.code === 'ENOTFOUND' ||
            error.message?.includes('ENOTFOUND') ||
            error.cause?.message?.includes('ENOTFOUND');

        if (isNetworkError) {
            return NextResponse.json({
                error: "Database temporarily unreachable. Your answers are saved locally.",
                networkError: true
            }, { status: 503 });
        }
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

        // 1. Delete all submissions for this exam
        await db.delete(submissions).where(eq(submissions.examId, examId));

        // 2. Delete all exam sessions for this exam to allow all students to re-take
        await db.delete(examSessions).where(eq(examSessions.examId, examId));

        return NextResponse.json({ success: true, message: "All results and sessions for this exam have been reset." });
    } catch (error: any) {
        console.error("Failed to bulk delete results:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
