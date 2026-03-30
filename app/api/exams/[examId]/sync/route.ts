import { db } from "@/lib/db";
import { examSessions } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const data = await req.json();
    const { 
      usn, 
      answers, 
      violations, 
      violationEvents, 
      justifications, 
      studentName, 
      email, 
      class: studentClass, 
      year, 
      section,
      currentQ,
      currentSectionIndex,
      visited,
      markedForReview,
      endTimestamp,
      sectionEndTimestamps,
      shuffledQuestionIds
    } = data;

    if (!examId || !usn) {
      return NextResponse.json({ error: "Missing examId or usn" }, { status: 400 });
    }

    // Check if an active session already exists
    const existingSession = await db.query.examSessions.findFirst({
      where: and(
        eq(examSessions.examId, examId),
        eq(examSessions.studentUsn, usn),
        eq(examSessions.status, "in-progress")
      )
    });

    if (existingSession) {
      // Update existing session with partial progress data
      await db.update(examSessions)
        .set({
          violations: violations ?? existingSession.violations,
          violationEvents: violationEvents ? JSON.stringify(violationEvents) : existingSession.violationEvents,
          answers: answers ? JSON.stringify(answers) : existingSession.answers,
          justifications: justifications ? JSON.stringify(justifications) : existingSession.justifications,
          visitedQuestions: visited ? JSON.stringify(visited) : existingSession.visitedQuestions,
          markedForReview: markedForReview ? JSON.stringify(markedForReview) : existingSession.markedForReview,
          currentQuestionIndex: currentQ ?? existingSession.currentQuestionIndex,
          currentSectionIndex: currentSectionIndex ?? existingSession.currentSectionIndex,
          lastActivityAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(examSessions.id, existingSession.id));
      
      return NextResponse.json({ success: true, updated: true });
    } else {
      // Create a new "in-progress" session if it doesn't exist
      if (!studentName) {
        return NextResponse.json({ error: "Student name required for initial session creation" }, { status: 400 });
      }

      const id = nanoid();
      
      await db.insert(examSessions).values({
        id,
        examId,
        studentName,
        studentUsn: usn,
        studentEmail: email || "",
        status: "in-progress",
        violations: violations || 0,
        violationEvents: violationEvents ? JSON.stringify(violationEvents) : null,
        answers: answers ? JSON.stringify(answers) : null,
        justifications: justifications ? JSON.stringify(justifications) : null,
        visitedQuestions: visited ? JSON.stringify(visited) : null,
        markedForReview: markedForReview ? JSON.stringify(markedForReview) : null,
        currentQuestionIndex: currentQ || 0,
        currentSectionIndex: currentSectionIndex || 0,
        shuffledQuestionIds: shuffledQuestionIds ? JSON.stringify(shuffledQuestionIds) : null,
        endTimestamp: endTimestamp || null,
        sectionEndTimestamps: sectionEndTimestamps ? JSON.stringify(sectionEndTimestamps) : null,
        startedAt: new Date(),
        lastActivityAt: new Date(),
        updatedAt: new Date()
      } as any);

      return NextResponse.json({ success: true, created: true });
    }
  } catch (error: any) {
    const isNetworkError = 
      error.code === 'ENOTFOUND' || 
      error.cause?.code === 'ENOTFOUND' || 
      error.message?.includes('ENOTFOUND') ||
      error.cause?.message?.includes('ENOTFOUND');

    if (isNetworkError) {
      console.warn("Sync failed due to network unavailability (ENOTFOUND). Still saved locally.");
      return NextResponse.json({ 
        error: "Network unavailable. Changes cached locally.", 
        networkError: true 
      }, { status: 503 });
    }
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
