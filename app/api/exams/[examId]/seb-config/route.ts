import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

    const origin = new URL(req.url).origin;
    const liveUrl = `${origin}/exam/${examId}/live`;

    // SEB Config is a Plist XML file
    // We set the StartURL and enable Browser Exam Key sending
    const sebConfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>originatorVersion</key>
	<string>SEB_Win_3.0.0</string>
	<key>startURL</key>
	<string>${liveUrl}</string>
	<key>sendBrowserExamKey</key>
	<true/>
	<key>showMenuBar</key>
	<false/>
	<key>showTaskBar</key>
	<false/>
	<key>allowQuit</key>
	<true/>
	<key>quitPassword</key>
	<string></string>
	<key>ignoreExitKeys</key>
	<true/>
	<key>ignoreRightClick</key>
	<true/>
	<key>monitorSecondScreen</key>
	<true/>
	<key>browserWindowAllowReload</key>
	<true/>
	<key>browserWindowShowURL</key>
	<false/>
	<key>allowPreferencesWindow</key>
	<false/>
</dict>
</plist>`;

    return new NextResponse(sebConfig, {
      headers: {
        "Content-Type": "application/seb",
        "Content-Disposition": `attachment; filename="exam-${examId}.seb"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate SEB config:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
