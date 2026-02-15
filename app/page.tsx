"use client";
import { GraduationCap, Shield, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useExam } from "@/hooks/contexts/ExamContext";
import { ModeToggle } from "@/components/pageComponents/ModeToggle";

const Index = () => {
  const { exams } = useExam();
  const demoExam = exams.find(e => e.status === "active") || exams[0];

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      {/* Hero */}
      <div className="flex-1 gradient-hero flex items-center justify-center px-4">
        <div className="text-center max-w-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-extrabold text-primary-foreground mb-4 tracking-tight">
            ExamPortal
          </h1>
          <p className="text-lg text-primary-foreground/70 mb-10 leading-relaxed">
            Secure online examination platform with real-time proctoring,
            automated grading, and comprehensive analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="gradient-primary text-primary-foreground font-bold px-10 h-12 rounded-full shadow-elevated hover:opacity-90 transition-all"
            >
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Secure Proctoring",
              desc: "Tab switch detection, fullscreen enforcement, and copy-paste blocking.",
            },
            {
              icon: BookOpen,
              title: "Easy Exam Creation",
              desc: "Create exams with MCQs, set timers, and generate shareable links.",
            },
            {
              icon: GraduationCap,
              title: "Instant Results",
              desc: "Automated grading with detailed analytics and CSV export.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 shadow-card text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
