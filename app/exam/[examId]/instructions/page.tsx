"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Monitor,
  Copy,
  Timer,
  Shuffle,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ModeToggle } from "@/components/pageComponents/ModeToggle";
import { useExam } from "@/hooks/contexts/ExamContext";
import { useSession } from "next-auth/react";

const rules = [
  {
    icon: Timer,
    text: "The timer starts when you begin and cannot be paused.",
  },
  {
    icon: Monitor,
    text: "Fullscreen mode is mandatory. Exiting will trigger a warning.",
  },
  {
    icon: AlertTriangle,
    text: "Tab switching is not allowed. Violations are tracked.",
  },
  {
    icon: Copy,
    text: "Copy-paste and right-click are disabled during the exam.",
  },
  { icon: Shuffle, text: "Questions are randomly shuffled for each student." },
  {
    icon: CheckSquare,
    text: "The exam auto-submits when time runs out or after excessive violations.",
  },
];

export default function Instructions() {
  const { examId } = useParams();
  const { exams, student } = useExam();
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const exam = exams.find((e) => e.id === examId);

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      <div className="w-full max-w-xl animate-fade-in">
        <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-foreground">
              Exam Instructions
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded">
              {exam.status}
            </span>
          </div>
          <p className="text-muted-foreground mb-8">
            {exam.title} · {exam.duration} minutes · {exam.totalMarks} marks
          </p>

          <div className="space-y-3.5 mb-8">
            {rules.map((rule, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/40 border border-border/50"
              >
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                  <rule.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{rule.text}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Checkbox
              checked={accepted}
              onCheckedChange={(c) => setAccepted(!!c)}
              id="accept"
              className="border-orange-500/50 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <label
              htmlFor="accept"
              className="text-sm font-bold text-orange-900 cursor-pointer"
            >
              I have read and agree to all examination rules
            </label>
          </div>

          <Button
            className="w-full h-12 text-sm font-bold shadow-sm"
            disabled={!accepted}
            onClick={() => router.push(`/exam/${examId}/start`)}
          >
            Start Examination
          </Button>
        </div>
      </div>
    </div>
  );
}
