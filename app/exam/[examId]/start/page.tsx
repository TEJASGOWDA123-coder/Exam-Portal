"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useExam } from "@/hooks/contexts/ExamContext";
import QuestionCard from "@/components/QuestionCard";
import Timer from "@/components/Timer";
import { useSession } from "next-auth/react";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ExamPage() {
  const { examId } = useParams();
  const { exams, addResult, student } = useExam();
  const router = useRouter();
  const exam = exams.find((e) => e.id === examId);

  const shuffledQuestions = useMemo(
    () => (exam ? shuffleArray(exam.questions) : []),
    [exam],
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | number[] | string>>({});
  const [violations, setViolations] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const startTime = useMemo(() => Date.now(), []);

  const { data: adminSession } = useSession();

  const submitExam = useCallback(async (isTimeout = false) => {
    if (submitted || !exam || !student) return;
    setSubmitted(true);

    if (isTimeout) {
      toast.info("Time is up! Your exam is being submitted automatically.", {
        duration: 5000,
      });
    }

    let correct = 0;
    shuffledQuestions.forEach((q) => {
      const ans = answers[q.id];
      if (q.type === "msq") {
        const correctIndices = q.correctAnswer.split(",").map(i => parseInt(i)).sort();
        if (
          Array.isArray(ans) &&
          ans.length === correctIndices.length &&
          [...ans].sort((a, b) => a - b).every((val, idx) => val === correctIndices[idx])
        ) {
          correct++;
        }
      } else if (q.type === "text") {
        if (
          typeof ans === "string" &&
          ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
        ) {
          correct++;
        }
      } else {
        if (String(ans) === q.correctAnswer) {
          correct++;
        }
      }
    });
    const marksPerQ = exam.totalMarks / shuffledQuestions.length;
    const score = Math.round(correct * marksPerQ);

    await addResult({
      id: `r-${Date.now()}`,
      examId: exam.id,
      studentName: student.name,
      usn: student.usn,
      email: student.email,
      class: student.class,
      section: student.section,
      score,
      violations,
      totalMarks: exam.totalMarks,
      submittedAt: new Date(),
    } as any);

    sessionStorage.setItem(
      "lastResult",
      JSON.stringify({
        score,
        totalMarks: exam.totalMarks,
        correct,
        wrong: shuffledQuestions.length - correct,
        violations,
      }),
    );
    router.push(`/exam/${examId}/result`);
  }, [
    submitted,
    exam,
    student,
    answers,
    shuffledQuestions,
    violations,
    addResult,
    router,
    examId,
    startTime,
  ]);

  // Check for existing submission on mount
  useEffect(() => {
    if (student && examId && !submitted) {
      const checkSubmission = async () => {
        try {
          const resp = await fetch(`/api/results/my-result?examId=${examId}&usn=${student.usn}`);
          if (resp.ok) {
            const { found } = await resp.json();
            if (found) {
              toast.info("You have already submitted this exam.");
              router.push(`/exam/${examId}/result`);
            }
          }
        } catch (err) {
          console.error("Failed to check submission status:", err);
        }
      };
      checkSubmission();
    }
  }, [student, examId, router, submitted]);

  // Proctoring: tab visibility
  useEffect(() => {
    const handler = () => {
      if (document.hidden && !submitted) {
        setViolations((v) => {
          const next = v + 1;
          toast.error(`⚠️ Tab switch detected! Violation ${next}/3`);
          if (next >= 3) submitExam();
          return next;
        });
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [submitted, submitExam]);

  // Proctoring: disable copy/paste/right-click
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("copy", prevent);
    document.addEventListener("paste", prevent);
    document.addEventListener("contextmenu", prevent);
    const keyHandler = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "a", "x"].includes(e.key.toLowerCase())
      )
        e.preventDefault();
    };
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("paste", prevent);
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  // Fullscreen request
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => { });
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
    };
  }, []);

  if (!exam || shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">
          No questions available for this exam.
        </p>
      </div>
    );
  }

  const question = shuffledQuestions[currentQ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-foreground text-lg">
            {exam.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            {Object.keys(answers).length}/{shuffledQuestions.length} answered
          </p>
        </div>
        <div className="flex items-center gap-4">
          {violations > 0 && (
            <div className="flex items-center gap-1 text-destructive text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {violations}/3
            </div>
          )}
          <Timer durationSeconds={exam.duration * 60} onTimeUp={() => submitExam(true)} />
        </div>
      </div>

      {/* Question */}
      <div className="exam-container py-8">
        <QuestionCard
          question={question}
          index={currentQ}
          total={shuffledQuestions.length}
          selectedAnswer={answers[question.id] ?? null}
          onSelect={(val) => {
            if (question.type === "msq") {
              setAnswers((prev) => {
                const current = (prev[question.id] as number[]) || [];
                const i = val as number;
                const next = current.includes(i)
                  ? current.filter((c) => c !== i)
                  : [...current, i];
                return { ...prev, [question.id]: next };
              });
            } else {
              setAnswers((prev) => ({ ...prev, [question.id]: val }));
            }
          }}
        />

        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentQ((c) => c - 1)}
            disabled={currentQ === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          {currentQ === shuffledQuestions.length - 1 ? (
            <Button onClick={() => setShowConfirm(true)}>
              <Send className="w-4 h-4 mr-2" />
              Submit Exam
            </Button>
          ) : (
            <Button onClick={() => setCurrentQ((c) => c + 1)}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Question navigation dots */}
        <div className="flex flex-wrap gap-2 mt-8 justify-center">
          {shuffledQuestions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${i === currentQ
                ? "gradient-primary text-primary-foreground"
                : answers[q.id] !== undefined
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              You've answered {Object.keys(answers).length} of{" "}
              {shuffledQuestions.length} questions.
              {Object.keys(answers).length < shuffledQuestions.length &&
                " Some questions are unanswered."}{" "}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => submitExam()}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
