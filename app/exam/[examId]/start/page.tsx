"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/pageComponents/ModeToggle";
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
import AIProctor from "@/components/proctoring/AIProctor";
import PreExamCheck from "@/components/exam/PreExamCheck";
import { useSession } from "next-auth/react";
import { ClipboardList, ShieldAlert, Timer as TimerIcon, HelpCircle } from "lucide-react";

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

  const [preCheck, setPreCheck] = useState(true);
  const shuffledQuestions = useMemo(() => {
    if (!exam) return [];
    
    // Group all questions by section
    const pools: Record<string, typeof exam.questions> = {};
    exam.questions.forEach(q => {
      const s = q.section || "General";
      if (!pools[s]) pools[s] = [];
      pools[s].push(q);
    });

    let selected: typeof exam.questions = [];

    if (exam.sectionsConfig && exam.sectionsConfig.length > 0) {
      // Pick based on config
      exam.sectionsConfig.forEach(config => {
        const pool = pools[config.name] || [];
        const count = Math.min(config.pickCount, pool.length);
        const shuffledPool = shuffleArray(pool);
        selected = [...selected, ...shuffledPool.slice(0, count)];
      });
    } else {
      // Use all questions, but shuffle within sections or just shuffle all
      selected = shuffleArray(exam.questions);
    }

    return selected;
  }, [exam]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | number[] | string>>({});
  const [violations, setViolations] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const startTime = useMemo(() => Date.now(), []);
  
  const submitExam = useCallback(async (isTimeout = false) => {
    if (submitted || !exam || !student) return;
    setSubmitted(true);

    if (isTimeout) {
      toast.info("Time is up! Your exam is being submitted automatically.", {
        duration: 5000,
      });
    }

    let correct = 0;
    let totalObtained = 0;
    const sectionalResults: Record<string, number> = {};

    shuffledQuestions.forEach((q) => {
      const ans = answers[q.id];
      const section = q.section || "General";
      if (!sectionalResults[section]) sectionalResults[section] = 0;

      let isCorrect = false;
      if (q.type === "msq") {
        const correctIndices = q.correctAnswer.split(",").map(i => parseInt(i)).sort();
        if (
          Array.isArray(ans) &&
          ans.length === correctIndices.length &&
          [...ans].sort((a, b) => a - b).every((val, idx) => val === correctIndices[idx])
        ) {
          isCorrect = true;
        }
      } else if (q.type === "text") {
        if (
          typeof ans === "string" &&
          ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
        ) {
          isCorrect = true;
        }
      } else {
        if (String(ans) === q.correctAnswer) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        correct++;
        const m = q.marks || 1;
        totalObtained += m;
        sectionalResults[section] += m;
      }
    });
    
    const score = totalObtained;

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
      sectionScores: sectionalResults,
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

  const handleAIViolation = useCallback((reason: string, points: number) => {
    if (submitted) return;
    setViolations((v) => {
      const next = v + 1;
      toast.error(`⚠️ AI Detection: ${reason}! Violation ${next}/3`, {
        description: "Please maintain proper exam conduct.",
      });
      if (next >= 3) submitExam();
      return next;
    });
  }, [submitted, submitExam]);

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
      if (document.hidden && !submitted && !preCheck) {
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
  }, [submitted, submitExam, preCheck]);

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

  // Fullscreen only when exam starts
  useEffect(() => {
    if (!preCheck) {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen().catch(() => { });
      return () => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
      };
    }
  }, [preCheck]);

  if (!exam || shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground font-medium">No questions available for this exam.</p>
        </div>
      </div>
    );
  }

  if (preCheck) {
    return <PreExamCheck examTitle={exam.title} onProceed={() => setPreCheck(false)} />;
  }

  const question = shuffledQuestions[currentQ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col animate-fade-in">
      {/* Redesigned Header */}
      <header className="h-20 bg-background border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="font-bold text-lg leading-tight truncate max-w-[300px]">{exam.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Question {currentQ + 1} of {shuffledQuestions.length}
                </span>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {question.section || "General"}
                </span>
                {exam.proctoringEnabled && (
                  <span className="text-[10px] bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse" />
                    Live Proctoring
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {violations > 0 && (
              <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-xl border border-destructive/20 animate-pulse">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-bold">{violations}/3 Violations</span>
              </div>
            )}
            <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-2xl border border-border shadow-inner">
              <TimerIcon className="w-4 h-4 text-primary" />
              <Timer durationSeconds={exam.duration * 60} onTimeUp={() => submitExam(true)} />
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Left Area: Questions & Nav */}
        <div className="lg:col-span-8 flex flex-col h-full gap-6">
          <section className="bg-background rounded-3xl border border-border shadow-card p-8 flex-1">
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
          </section>

          {/* Navigation Controls */}
          <div className="bg-background rounded-2xl border border-border shadow-sm p-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentQ((c) => c - 1)}
              disabled={currentQ === 0}
              className="rounded-xl border-2 px-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="hidden md:flex gap-2">
              {shuffledQuestions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQ(i)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all transform active:scale-95 ${i === currentQ
                    ? "bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary/20"
                    : answers[q.id] !== undefined
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-muted text-muted-foreground border border-transparent hover:border-border"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQ === shuffledQuestions.length - 1 ? (
              <Button onClick={() => setShowConfirm(true)} size="lg" className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
                <Send className="w-4 h-4 mr-2" />
                Submit Exam
              </Button>
            ) : (
              <Button onClick={() => setCurrentQ((c) => c + 1)} size="lg" className="rounded-xl px-8 font-bold">
                Next Question
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Proctoring & Guidelines */}
        <div className="lg:col-span-4 h-full flex flex-col gap-6">
          {exam.proctoringEnabled && (
            <div className="bg-background rounded-3xl border border-border shadow-card overflow-hidden">
              <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  Live Proctor
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">System AI</span>
              </div>
              <AIProctor onViolation={handleAIViolation} />
            </div>
          )}

          <div className="bg-background rounded-3xl border border-border shadow-card p-6">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              Exam Guidelines
            </h4>
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-xl border border-border text-[11px] text-muted-foreground leading-relaxed">
                Stay focused. Each violation is recorded and repeated attempts may lead to automatic disqualification.
              </div>
              <ul className="space-y-3">
                {[
                  "Maintain a clear view of your face",
                  "No background conversations allowed",
                  "Tab switching is strictly prohibited",
                  "Ensure stable internet throughout"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-[11px] text-muted-foreground font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-3xl border-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Submit your exam?</AlertDialogTitle>
            <AlertDialogDescription className="text-base py-4">
              You have answered <span className="font-bold text-foreground">{Object.keys(answers).length}</span> out of <span className="font-bold text-foreground">{shuffledQuestions.length}</span> questions. 
              {Object.keys(answers).length < shuffledQuestions.length && (
                <span className="block mt-2 text-destructive font-bold uppercase text-xs">⚠️ Warning: Some questions are still unanswered.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-2 px-6">Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={() => submitExam()} className="rounded-xl px-8 font-bold bg-primary hover:bg-primary/90">Yes, Submit Exam</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
