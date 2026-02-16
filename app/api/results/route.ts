import { db } from "@/lib/db";
import { submissions, exams } from "@/lib/db/schema";
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
        const { examId, studentName, usn, email, class: studentClass, section, score, violations, sectionScores, justifications } = data;

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
                section,
                score,
                violations: violations || 0,
                sectionScores: sectionScores ? JSON.stringify(sectionScores) : null,
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

        await db.delete(submissions).where(eq(submissions.examId, examId));

        return NextResponse.json({ success: true, message: "All results for this exam have been reset." });
    } catch (error: any) {
        console.error("Failed to bulk delete results:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
