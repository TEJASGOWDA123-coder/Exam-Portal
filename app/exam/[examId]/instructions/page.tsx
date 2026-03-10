"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Monitor,
  Timer,
  CheckSquare,
  Globe,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ModeToggle } from "@/components/pageComponents/ModeToggle";
import { useExam } from "@/hooks/contexts/ExamContext";
import { useSession } from "next-auth/react";

export default function Instructions() {
  const { examId } = useParams();
  const { exams, student } = useExam();
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const exam = exams.find((e) => e.id === examId);

  const rules = [
    {
      icon: Timer,
      text: "The exam timer will start immediately once you click Begin and cannot be paused or restarted.",
    },
    {
      icon: Monitor,
      text: "Fullscreen mode is mandatory throughout the exam. Exiting fullscreen will trigger an automatic warning.",
    },
    {
      icon: ShieldCheck,
      text: "Switching tabs, opening new windows, or minimizing the browser is strictly prohibited. All activities are monitored and recorded.",
    },
    {
      icon: AlertTriangle,
      text: `The exam will automatically submit when the time expires or if more than ${exam?.maxViolations || 3} rule violations are detected.`,
    },
    {
      icon: Globe,
      text: "Ensure a stable internet connection before starting. The system is not responsible for connectivity issues.",
    },
    {
      icon: Smartphone,
      text: "Do not use mobile phones, smart devices, or external assistance during the exam.",
    },
  ];

  useEffect(() => {
    if (!student) {
      router.push(`/exam/${examId}`);
    }
  }, [student, router, examId]);

  if (!student || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-medium">Loading examination rules...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="blob w-[600px] h-[600px] bg-emerald-500/10 -top-40 -left-40 animate-float" />
      <div className="blob w-[500px] h-[500px] bg-blue-500/10 -bottom-40 -right-40 animate-float [animation-delay:3s]" />

      <div className="absolute top-6 right-6 z-20">
        <ModeToggle />
      </div>

      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
        <div className="dark:bg-card bg-card  shadow-elevated rounded-3xl p-8 md:p-10">
          <div className="flex flex-col gap-1 mb-8">
            <div className="flex justify-between items-center mb-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Exam Instructions
              </h1>
              <div className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                Compliance Required
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">{exam.title}</span>
              <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">{exam.duration} Minutes Session</span>
            </div>
            {(exam.positiveMarks !== undefined || exam.negativeMarks !== undefined || exam.sectionsConfig?.length) && (
              <div className="flex flex-col gap-3 mt-1 bg-white/40 dark:bg-card border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl backdrop-blur-sm shadow-sm ring-1 ring-black/[0.02]">
                <div className="flex items-center gap-4">
                  {(exam.positiveMarks !== undefined || exam.negativeMarks !== undefined) && (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">+{exam.positiveMarks ?? 1} <span className="text-[10px] opacity-70 uppercase tracking-wider">Correct</span></span>
                      </div>
                      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800" />
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">-{exam.negativeMarks ?? 0} <span className="text-[10px] opacity-70 uppercase tracking-wider">Incorrect</span></span>
                      </div>
                    </>
                  )}
                </div>

                {exam.sectionsConfig && exam.sectionsConfig.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
                    {exam.strictSectionTiming ? (
                      <>
                        {exam.sectionsConfig.map((sec, i) => (
                          <div key={i} className="px-2.5 py-1 rounded-lg bg-card border border-primary/10 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{sec.name}:</span>
                            <span className="text-[10px] font-black text-primary uppercase">{sec.duration} Min</span>
                          </div>
                        ))}
                        <div className="w-full mt-1">
                          <p className="text-[9px] text-muted-foreground italic font-medium">
                            * Strict sectional timing is enabled. Once a section's time ends, you will be moved to the next.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="w-full">
                        {exam.sectionalNavigation === "forward-only" ? (
                          <p className="text-[9px] text-amber-600 dark:text-amber-400 italic font-bold uppercase tracking-wider">
                            * Forward-Only Navigation: You can move to the next section when ready, but you cannot return to previous sections.
                          </p>
                        ) : (
                          <p className="text-[9px] text-emerald-600 dark:text-emerald-400 italic font-bold uppercase tracking-wider">
                            * Global Timing Active: You can navigate between all {exam.sectionsConfig.length} sections freely within the total {exam.duration} minutes.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 mb-10">
            {rules.map((rule, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-card border border-slate-100 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-950/60 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-emerald-500/20 flex items-center justify-center shadow-sm shrink-0 border border-slate-100 dark:border-slate-800">
                  <rule.icon className="w-4.5 h-4.5 text-emerald-500" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{rule.text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 transition-colors hover:border-emerald-500/30">
              <Checkbox
                checked={accepted}
                onCheckedChange={(c) => setAccepted(!!c)}
                id="accept"
                className="h-5 w-5 rounded-md border-emerald-500/50 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              <label
                htmlFor="accept"
                className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none"
              >
                I have read and agree to all Instructions
              </label>
            </div>

            <Button
              className="w-full h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={!accepted}
              onClick={() => router.push(`/exam/${examId}/start`)}
            >
              Start Examination
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
