import { db } from "@/lib/db";
import { submissions, examSessions } from "@/lib/db/schema";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "admin" && (session.user as any)?.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        
        // 1. Find the submission first to get student info
        const submission = await db.query.submissions.findFirst({
            where: eq(submissions.id, id)
        });

        if (!submission) {
            return NextResponse.json({ error: "Result not found" }, { status: 404 });
        }

        // 2. Delete the submission
        await db.delete(submissions).where(eq(submissions.id, id));

        // 3. Delete any associated exam sessions to allow a clean retake
        await db.delete(examSessions).where(
            and(
                eq(examSessions.examId, submission.examId),
                eq(examSessions.studentUsn, submission.usn)
            )
        );

        return NextResponse.json({ success: true, message: "Result and session cleared. Student can now re-attempt." });
    } catch (error) {
        console.error("Failed to delete submission:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
