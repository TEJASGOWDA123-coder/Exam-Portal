import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");
    const usn = searchParams.get("usn");

    if (!examId || !usn) {
        return NextResponse.json({ error: "Missing examId or usn" }, { status: 400 });
    }

    try {
        const result = await db.query.submissions.findFirst({
            where: and(
                eq(submissions.examId, examId),
                eq(submissions.usn, usn)
            )
        });

        if (!result) {
            return NextResponse.json({ found: false });
        }

        return NextResponse.json({ found: true, result });
    } catch (error) {
        console.error("Failed to fetch my result:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
