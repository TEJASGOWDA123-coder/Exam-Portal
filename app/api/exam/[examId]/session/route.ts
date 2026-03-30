import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { examSessions, exams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import crypto from "crypto";

// GET /api/exam/[examId]/session - Check for existing session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> },
) {
  try {
    const { examId } = await params;
    const { searchParams } = new URL(request.url);
    const studentUsn = searchParams.get("studentUsn");

    if (!studentUsn) {
      return NextResponse.json(
        { error: "Student USN is required" },
        { status: 400 },
      );
    }

    // Check if exam exists and is active
    const exam = await db.query.exams.findFirst({
      where: eq(exams.id, examId),
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.status !== "active") {
      return NextResponse.json(
        { error: "Exam is not active" },
        { status: 403 },
      );
    }

    // Look for existing session
    const existingSession = await db.query.examSessions.findFirst({
      where: and(
        eq(examSessions.examId, examId),
        eq(examSessions.studentUsn, studentUsn),
        eq(examSessions.status, "in-progress"),
      ),
    });

    if (existingSession) {
      // Check if session is still valid (not expired)
      const now = Date.now();
      const sessionEnd = existingSession.endTimestamp || 0;

      if (sessionEnd > 0 && now > sessionEnd) {
        // Mark session as expired
        await db
          .update(examSessions)
          .set({
            status: "expired",
            updatedAt: new Date(),
          })
          .where(eq(examSessions.id, existingSession.id));

        return NextResponse.json(
          { error: "Exam session has expired" },
          { status: 410 },
        );
      }

      // Verify session integrity
      const sessionHash = generateSessionHash(existingSession);
      if (
        existingSession.sessionHash &&
        existingSession.sessionHash !== sessionHash
      ) {
        return NextResponse.json(
          { error: "Session integrity check failed" },
          { status: 422 },
        );
      }

      return NextResponse.json({
        session: existingSession,
        canResume: true,
        message: "Session found and valid",
      });
    }

    return NextResponse.json({
      canResume: false,
      message: "No active session found",
    });
  } catch (error) {
    console.error("Error checking exam session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/exam/[examId]/session - Create new session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> },
) {
  try {
    const { examId } = await params;
    const body = await request.json();

    const {
      studentUsn,
      studentName,
      studentEmail,
      shuffledQuestionIds,
      examVersion = 1,
    } = body;

    if (!studentUsn || !studentName || !studentEmail || !shuffledQuestionIds) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if exam exists and is active
    const exam = await db.query.exams.findFirst({
      where: eq(exams.id, examId),
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.status !== "active") {
      return NextResponse.json(
        { error: "Exam is not active" },
        { status: 403 },
      );
    }

    // Check for existing active session
    const existingSession = await db.query.examSessions.findFirst({
      where: and(
        eq(examSessions.examId, examId),
        eq(examSessions.studentUsn, studentUsn),
        eq(examSessions.status, "in-progress"),
      ),
    });

    if (existingSession) {
      return NextResponse.json(
        { error: "Active session already exists" },
        { status: 409 },
      );
    }

    // Calculate exam end time
    const now = Date.now();
    const duration = (exam.duration || 60) * 60 * 1000; // Convert minutes to milliseconds
    const endTimestamp = now + duration;

    // Calculate section end times
    const sectionEndTimestamps: Record<string, number> = {};
    if (exam.sectionsConfig) {
      const sectionsConfig = Array.isArray(exam.sectionsConfig)
        ? exam.sectionsConfig
        : JSON.parse(exam.sectionsConfig || "[]");

      sectionsConfig.forEach((section: any) => {
        const sectionDuration = (section.duration || 5) * 60 * 1000;
        sectionEndTimestamps[section.name] = now + sectionDuration;
      });
    }

    // Create new session
    const sessionId = nanoid();
    const sessionData = {
      id: sessionId,
      examId,
      studentUsn,
      studentName,
      studentEmail,
      status: "in-progress" as const,
      currentQuestionIndex: 0,
      currentSectionIndex: 0,
      answers: null,
      justifications: null,
      visitedQuestions: JSON.stringify([shuffledQuestionIds[0]]),
      markedForReview: JSON.stringify([]),
      startedAt: new Date(now),
      lastActivityAt: new Date(now),
      endTimestamp,
      sectionEndTimestamps: JSON.stringify(sectionEndTimestamps),
      totalTimeSpent: 0,
      violations: 0,
      violationEvents: null,
      shuffledQuestionIds: JSON.stringify(shuffledQuestionIds),
      examVersion,
      sessionHash: null, // Will be set after creation
      userAgent: request.headers.get("user-agent") || null,
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        null,
      browserFingerprint: generateBrowserFingerprint(request),
    };

    const [newSession] = await db
      .insert(examSessions)
      .values(sessionData)
      .returning();

    // Generate and update session hash
    const sessionHash = generateSessionHash(newSession);
    await db
      .update(examSessions)
      .set({ sessionHash })
      .where(eq(examSessions.id, sessionId));

    return NextResponse.json({
      session: { ...newSession, sessionHash },
      message: "Session created successfully",
    });
  } catch (error) {
    console.error("Error creating exam session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/exam/[examId]/session - Update session progress
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> },
) {
  try {
    const { examId } = await params;
    const body = await request.json();

    const {
      studentUsn,
      currentQuestionIndex,
      currentSectionIndex,
      answers,
      justifications,
      visitedQuestions,
      markedForReview,
      violations,
      violationEvents,
      totalTimeSpent,
    } = body;

    if (!studentUsn) {
      return NextResponse.json(
        { error: "Student USN is required" },
        { status: 400 },
      );
    }

    // Find existing session
    const existingSession = await db.query.examSessions.findFirst({
      where: and(
        eq(examSessions.examId, examId),
        eq(examSessions.studentUsn, studentUsn),
        eq(examSessions.status, "in-progress"),
      ),
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 404 },
      );
    }

    // Check if session is still valid
    const now = Date.now();
    const sessionEnd = existingSession.endTimestamp || 0;

    if (sessionEnd > 0 && now > sessionEnd) {
      await db
        .update(examSessions)
        .set({
          status: "expired",
          updatedAt: new Date(),
        })
        .where(eq(examSessions.id, existingSession.id));

      return NextResponse.json(
        { error: "Exam session has expired" },
        { status: 410 },
      );
    }

    // Update session data
    const updateData: Partial<typeof examSessions.$inferInsert> = {
      lastActivityAt: new Date(now),
      updatedAt: new Date(),
    };

    if (currentQuestionIndex !== undefined) {
      updateData.currentQuestionIndex = currentQuestionIndex;
    }
    if (currentSectionIndex !== undefined) {
      updateData.currentSectionIndex = currentSectionIndex;
    }
    if (answers !== undefined) {
      updateData.answers = JSON.stringify(answers);
    }
    if (justifications !== undefined) {
      updateData.justifications = JSON.stringify(justifications);
    }
    if (visitedQuestions !== undefined) {
      updateData.visitedQuestions = JSON.stringify(visitedQuestions);
    }
    if (markedForReview !== undefined) {
      updateData.markedForReview = JSON.stringify(markedForReview);
    }
    if (violations !== undefined) {
      updateData.violations = violations;
    }
    if (violationEvents !== undefined) {
      updateData.violationEvents = JSON.stringify(violationEvents);
    }
    if (totalTimeSpent !== undefined) {
      updateData.totalTimeSpent = totalTimeSpent;
    }

    const [updatedSession] = await db
      .update(examSessions)
      .set(updateData)
      .where(eq(examSessions.id, existingSession.id))
      .returning();

    // Update session hash
    const sessionHash = generateSessionHash(updatedSession);
    await db
      .update(examSessions)
      .set({ sessionHash })
      .where(eq(examSessions.id, existingSession.id));

    return NextResponse.json({
      session: { ...updatedSession, sessionHash },
      message: "Session updated successfully",
    });
  } catch (error) {
    console.error("Error updating exam session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper functions
function generateSessionHash(session: any): string {
  const hashData = {
    examId: session.examId,
    studentUsn: session.studentUsn,
    shuffledQuestionIds: session.shuffledQuestionIds,
    examVersion: session.examVersion,
    status: session.status,
  };
  return crypto
    .createHash("md5")
    .update(JSON.stringify(hashData))
    .digest("hex");
}

function generateBrowserFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  const acceptEncoding = request.headers.get("accept-encoding") || "";

  return crypto
    .createHash("md5")
    .update(`${userAgent}|${acceptLanguage}|${acceptEncoding}`)
    .digest("hex");
}
