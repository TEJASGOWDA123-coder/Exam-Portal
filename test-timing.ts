import "dotenv/config";
import { db } from "./lib/db";
import { exams } from "./lib/db/schema";

async function testTiming() {
  const now = new Date();
  
  // 1. Strict Exam (10 mins, already started 5 mins ago)
  const strictId = "test-strict-" + Date.now();
  await db.insert(exams).values({
    id: strictId,
    title: "Test Strict Timing",
    duration: 10,
    startTime: new Date(now.getTime() - 5 * 60000), // 5 mins ago
    endTime: new Date(now.getTime() + 5 * 60000),   // 5 mins from now
    totalMarks: 10,
    status: "active",
    createdBy: "superadmin-1",
    timerMode: "strict",
  });
  console.log("Created strict exam:", strictId);

  // 2. Flexible Exam (10 mins, window from 5 mins ago to 1 hour from now)
  const flexibleId = "test-flexible-" + Date.now();
  await db.insert(exams).values({
    id: flexibleId,
    title: "Test Flexible Timing",
    duration: 10,
    startTime: new Date(now.getTime() - 5 * 60000), // 5 mins ago
    endTime: new Date(now.getTime() + 55 * 60000),  // 55 mins from now
    totalMarks: 10,
    status: "active",
    createdBy: "superadmin-1",
    timerMode: "flexible",
  });
  console.log("Created flexible exam:", flexibleId);
}

testTiming();
