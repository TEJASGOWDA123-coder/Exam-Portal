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
        const { examId, studentName, usn, email, class: studentClass, section, score, violations, sectionScores, justifications } = data;

        // ... existing checks ...

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
            sectionScores: sectionScores ? JSON.stringify(sectionScores) : null,
            justifications: justifications ? JSON.stringify(justifications) : null
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to submit results:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
