import { db } from "@/lib/db";
import { examSessions } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    const { searchParams } = new URL(req.url);
    const usn = searchParams.get("usn");
    const { examId } = await params;

    if (!usn || !examId) {
        return NextResponse.json({ error: "Missing USN or ExamId" }, { status: 400 });
    }

    try {
        const session = await db.query.examSessions.findFirst({
            where: and(
                eq(examSessions.examId, examId),
                eq(examSessions.usn, usn)
            ),
        });

        if (!session) {
            return NextResponse.json({ found: false });
        }

        return NextResponse.json({ 
            found: true, 
            startTime: session.startTime,
            answers: session.answers ? JSON.parse(session.answers) : null,
            justifications: session.justifications ? JSON.parse(session.justifications) : null,
            violations: session.violations
        });
    } catch (error) {
        console.error("Failed to fetch session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    const { examId } = await params;
    const { usn } = await req.json();

    if (!usn || !examId) {
        return NextResponse.json({ error: "Missing USN or ExamId" }, { status: 400 });
    }

    try {
        // Check if session already exists
        const existing = await db.query.examSessions.findFirst({
            where: and(
                eq(examSessions.examId, examId),
                eq(examSessions.usn, usn)
            ),
        });

        if (existing) {
            return NextResponse.json({ success: true, startTime: existing.startTime });
        }

        // Create new session
        const startTime = new Date();
        const id = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await db.insert(examSessions).values({
            id,
            examId,
            usn,
            startTime,
        });

        return NextResponse.json({ success: true, startTime });
    } catch (error) {
        console.error("Failed to create session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    const { examId } = await params;
    const { usn, answers, justifications, violations } = await req.json();

    if (!usn || !examId) {
        return NextResponse.json({ error: "Missing USN or ExamId" }, { status: 400 });
    }

    try {
        await db.update(examSessions)
            .set({
                answers: JSON.stringify(answers),
                justifications: JSON.stringify(justifications),
                violations: violations,
                lastSync: new Date()
            })
            .where(and(
                eq(examSessions.examId, examId),
                eq(examSessions.usn, usn)
            ));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to sync session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
