import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySEBHash, isSEB } from "@/lib/seb";

export async function GET(
  req: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    const { examId } = params;
    const exam = await db.query.exams.findFirst({
      where: eq(exams.id, examId),
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (!exam.requireSeb) {
      return NextResponse.json({ verified: true });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const configKeyHash = req.headers.get("x-safeexambrowser-configkeyhash") || "";
    // Note: RequestHash is also sent by SEB, but ConfigKeyHash is easier to verify with a static key
    
    // We need the full URL as SEB sees it.
    // In Next.js/Vercel, we can get this from headers or req.url
    const url = req.url; 

    const isValid = verifySEBHash(url, exam.sebKey || "", configKeyHash);

    if (!isValid && !isSEB(userAgent)) {
       return NextResponse.json({ error: "Forbidden: SEB Required" }, { status: 403 });
    }
    
    if (exam.requireSeb && !isValid) {
        return NextResponse.json({ 
            error: "Security Violation: Invalid SEB Configuration Key Hash",
            details: "Your SEB settings do not match the required configuration for this exam."
        }, { status: 403 });
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("SEB Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
