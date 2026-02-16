"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/pageComponents/ModeToggle";
import { AlertTriangle, ChevronLeft, ChevronRight, Send, Lock, ShieldAlert, Timer as TimerIcon, HelpCircle, ClipboardList } from "lucide-react";
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

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LiveExamPage() {
  const { examId } = useParams();
  const { exams, addResult, student, loading } = useExam();
  const router = useRouter();
  const exam = exams.find((e) => e.id === examId);

  const [preCheck, setPreCheck] = useState(true);

  // Skip pre-check if proctoring is disabled
  useEffect(() => {
    if (exam && !exam.proctoringEnabled) {
      setPreCheck(false);
    }
  }, [exam]);


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
      // Use all questions
      selected = shuffleArray(exam.questions);
    }

    return selected;
  }, [exam]);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | number[] | string>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [violations, setViolations] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTime = useMemo(() => Date.now(), []);

  const submitExam = useCallback(async (isTimeout = false) => {
    if (submitted || isSubmitting || !exam) return;

    if (!student) {
      toast.error("Session Error: Student identity missing. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);
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

    const success = await addResult({
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
      justifications,
      totalMarks: exam.totalMarks,
      submittedAt: new Date(),
    } as any);

    if (!success) {
      setIsSubmitting(false);
      setSubmitted(false);
      toast.error("Submission Failed. Please try again or contact invigilator.");
      return;
    }

    sessionStorage.setItem(
      "lastResult",
      JSON.stringify({
        score,
        totalMarks: exam.totalMarks,
        correct,
        wrong: shuffledQuestions.length - correct,
        violations,
        sectionScores: sectionalResults,
      }),
    );

    // Immediate redirect to avoid proctoring staying active
    router.replace(`/exam/${examId}/result`);
  }, [
    submitted,
    isSubmitting, // Added dependency
    exam,
    student,
    answers,
    shuffledQuestions,
    violations,
    addResult,
    router,
    examId,
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

  const sectionGroups = useMemo(() => {
    const groups: Record<string, { startIndex: number; count: number; questions: any[] }> = {};
    shuffledQuestions.forEach((q, idx) => {
      const s = q.section || "General";
      if (!groups[s]) {
        groups[s] = { startIndex: idx, count: 0, questions: [] };
      }
      groups[s].count++;
      groups[s].questions.push({ ...q, globalIndex: idx });
    });
    return groups;
  }, [shuffledQuestions]);


  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-primary animate-pulse">Loading...</div>;
  if (!exam) return <div className="p-20 text-center text-destructive font-bold">Exam not found</div>;
  if (shuffledQuestions.length === 0) {
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
  const activeSection = question.section || "General";

  const getSectionProgress = (sectionName: string) => {
    const group = sectionGroups[sectionName];
    if (!group) return { answered: 0, total: 0 };
    const answered = group.questions.filter(q => answers[q.id] !== undefined).length;
    return { answered, total: group.count };
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col animate-fade-in">
      <header className="h-20 bg-background border-b border-border shadow-sm sticky top-0 z-[60]">
        <div className="max-w-[1600px] mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="font-bold text-lg leading-tight truncate max-w-[300px]">{exam.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Q{currentQ + 1} / {shuffledQuestions.length}
                </span>
                {exam.proctoringEnabled && (
                  <span className="text-[10px] bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse" />
                    Neural Monitor Active
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-2xl border border-border">
              <TimerIcon className="w-4 h-4 text-primary" />
              <Timer durationSeconds={exam.duration * 60} onTimeUp={() => submitExam(true)} />
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      <nav className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b sticky top-20 z-50">
        <div className="max-w-[1600px] mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 py-2">
            {Object.keys(sectionGroups).map((name) => {
              const { answered, total } = getSectionProgress(name);
              const isActive = activeSection === name;
              return (
                <button
                  key={name}
                  onClick={() => setCurrentQ(sectionGroups[name].startIndex)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${isActive ? "bg-primary text-white shadow-lg" : "hover:bg-muted text-muted-foreground"}`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Section</span>
                    <span className="text-xs font-bold leading-none">{name}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${isActive ? "bg-white/20" : "bg-muted"}`}>
                    {answered}/{total}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        <div className="lg:col-span-8 flex flex-col h-full gap-6">
          <section className="bg-background rounded-3xl border border-border shadow-card flex-1 flex flex-col overflow-hidden">
            <div className="px-8 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4 text-primary" />
                <p className="font-bold text-sm text-foreground">{activeSection}</p>
              </div>
            </div>

            <div className="p-8 flex-1">
              <QuestionCard
                question={question}
                index={currentQ}
                total={shuffledQuestions.length}
                selectedAnswer={answers[question.id] ?? null}
                justification={justifications[question.id] ?? ""}
                onJustify={(text) => setJustifications((prev) => ({ ...prev, [question.id]: text }))}
                onSelect={(val) => {
                  if (question.type === "msq") {
                    setAnswers((prev) => {
                      const current = (prev[question.id] as number[]) || [];
                      const i = val as number;
                      const next = current.includes(i) ? current.filter((c) => c !== i) : [...current, i];
                      return { ...prev, [question.id]: next };
                    });
                  } else {
                    setAnswers((prev) => ({ ...prev, [question.id]: val }));
                  }
                }}
              />

              {/* Primary Navigation Buttons - Inside Card for Flow */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button variant="outline" size="lg" onClick={() => setCurrentQ((c) => c - 1)} disabled={currentQ === 0} className="rounded-xl border-2 px-6 font-bold">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous Question
                </Button>

                {currentQ === shuffledQuestions.length - 1 ? (
                  <Button onClick={() => setShowConfirm(true)} size="lg" className="rounded-xl px-8 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Finish Exam"}
                  </Button>
                ) : (
                  <Button onClick={() => setCurrentQ((c) => c + 1)} size="lg" className="rounded-xl px-8 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    Save & Next <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* Question Palette / Map */}
          <div className="bg-background rounded-2xl border border-border shadow-sm p-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 min-w-max px-2">
              {shuffledQuestions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center shrink-0 ${i === currentQ ? "bg-primary text-white scale-110 shadow-md" : answers[shuffledQuestions[i].id] !== undefined ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 h-full flex flex-col gap-6">
          {exam.proctoringEnabled && (
            <div className="bg-background rounded-3xl border border-border shadow-card overflow-hidden">
              <AIProctor onViolation={handleAIViolation} isFinished={submitted} />
            </div>
          )}

          <div className="bg-background rounded-3xl border border-border shadow-card p-6">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" /> Guidelines
            </h4>
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-xl text-[11px] text-muted-foreground">
                Maintain focus on the exam window. Tab switching is monitored and reported.
              </div>
            </div>
          </div>
        </div>
      </main>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-3xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit your evaluation instance?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm submission of all telemetry and response data. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Review</AlertDialogCancel>
            <AlertDialogAction onClick={() => submitExam()} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm Submission"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
