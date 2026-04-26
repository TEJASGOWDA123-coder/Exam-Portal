import { db } from "@/lib/db";
import { submissions, examSessions, students } from "@/lib/db/schema";
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
        
        // Find the submission first to get keys for other tables
        const sub = await db.query.submissions.findFirst({
            where: eq(submissions.id, id)
        });

        if (sub) {
            await db.delete(submissions).where(eq(submissions.id, id));
            // Also clear session and registration
            await db.delete(examSessions).where(and(eq(examSessions.examId, sub.examId), eq(examSessions.usn, sub.usn)));
            await db.delete(students).where(and(eq(students.examId, sub.examId), eq(students.usn, sub.usn)));
        } else {
            // Fallback: If no submission, maybe it's just a session/student record? 
            // In the consolidated view, we use student.id as sub.id for in-progress ones
            if (id.startsWith("sub-")) {
                 return NextResponse.json({ error: "Submission not found" }, { status: 404 });
            }
            
            // Assume it's a student ID for an in-progress candidate
            const studentEntry = await db.query.students.findFirst({
                where: eq(students.id, id)
            });
            if (studentEntry) {
                await db.delete(students).where(eq(students.id, id));
                await db.delete(examSessions).where(and(eq(examSessions.examId, studentEntry.examId), eq(examSessions.usn, studentEntry.usn)));
            }
        }

        return NextResponse.json({ success: true, message: "Candidate history cleared. Student can now re-attempt." });
    } catch (error) {
        console.error("Failed to delete submission record:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "admin" && (session.user as any)?.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { studentName, usn, email, class: className, year, section } = body;

        await db.update(submissions)
            .set({
                studentName,
                usn,
                email,
                class: className,
                year,
                section,
            })
            .where(eq(submissions.id, id));

        return NextResponse.json({ success: true, message: "Details updated successfully" });
    } catch (error) {
        console.error("Failed to update submission:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
