// SEB_CONFIG_ROUTE_V2_2026-02-16X
import { db } from "@/lib/db";
import { exams, sebConfigs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params;
  console.log(`[SEB Config] Fetching for examId: ${examId}`);

  try {
    const examResult = await db.select().from(exams).where(eq(exams.id, examId)).limit(1);
    const exam = examResult[0];

    if (!exam) {
      console.log(`[SEB Config] Exam ${examId} not found`);
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (!exam.sebConfigId) {
      console.log(`[SEB Config] Exam ${examId} has no SEB config assigned`);
      return NextResponse.json({ error: "SEB configuration not assigned to this exam" }, { status: 404 });
    }

    const config = await db.query.sebConfigs.findFirst({
      where: eq(sebConfigs.id, exam.sebConfigId),
    });

    if (!config) {
      return NextResponse.json({ error: "Configuration data missing" }, { status: 404 });
    }

    // Return the .seb file content with the correct MIME type
    return new NextResponse(config.configData, {
      headers: {
        "Content-Type": "application/seb",
        "Content-Disposition": `attachment; filename="${config.name}.seb"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
