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
    // Student submissions now use local identity tracking, 
    // so we don't strictly require a NextAuth session for POST.
    // Admin GET still requires auth.

    try {
        const data = await req.json();
        const { examId, studentName, usn, email, class: studentClass, section, score, violations } = data;

        // Check if student already submitted for this exam
        const existing = await db.query.submissions.findFirst({
            where: and(
                eq(submissions.examId, examId),
                eq(submissions.usn, usn)
            )
        });

        if (existing) {
            return NextResponse.json({ error: "You have already submitted this exam." }, { status: 400 });
        }

        // Verify exam is still active and not expired
        const exam = await db.query.exams.findFirst({
            where: eq(exams.id, examId)
        });

        if (!exam) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }

        // Optional: Server-side timer validation
        const now = new Date();
        const endTime = new Date(exam.endTime);
        if (now > new Date(endTime.getTime() + 1000 * 60 * 5)) { // 5 min grace period
            return NextResponse.json({ error: "Exam time has expired" }, { status: 400 });
        }

        const id = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await db.insert(submissions).values({
            id,
            examId,
            studentName,
            usn,
            email,
            class: studentClass,
            section,
            score,
            violations,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to submit results:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
