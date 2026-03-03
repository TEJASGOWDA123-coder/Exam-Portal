"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Download,
  ExternalLink,
  Lock,
  Clock,
  BadgeCheck,
  AlertCircle
} from "lucide-react";
import { useExam } from "@/hooks/contexts/ExamContext";

export default function PublicStartPage() {
  const { examId } = useParams();
  const { exams } = useExam();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const resp = await fetch(`/api/exams/${examId}`);
        if (resp.ok) {
          const data = await resp.json();
          setExam(data);
        }
      } catch (err) {
        console.error("Failed to fetch exam:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-black">Exam Not Found</h1>
          <p className="text-slate-500">The requested evaluation matrix does not exist or has been decommissioned.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 selection:bg-emerald-500/30 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Blobs */}
      <div className="blob w-[500px] h-[500px] bg-emerald-500/20 -top-20 -left-20 animate-float" />
      <div className="blob w-[400px] h-[400px] bg-blue-500/20 -bottom-20 -right-20 animate-float [animation-delay:2s]" />
      <div className="blob w-[300px] h-[300px] bg-purple-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float [animation-delay:5s]" />

      <div className="max-w-2xl w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">

        {/* Header Section - Glassmorphic */}
        <div className="p-8 rounded-3xl glass relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <ShieldCheck className="h-48 w-48 text-emerald-500 rotate-12" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Secure Access</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Node
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {exam.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">
                Standard Evaluation Interface v2.4
              </p>
            </div>

            <div className="pt-4">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-colors hover:border-emerald-500/30">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Duration</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{exam.duration} Minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="p-2 rounded-[2rem] glass relative group/btn overflow-hidden transition-all duration-300">
          <div className="flex flex-col gap-4 relative z-10">
            <Button
              asChild
              className="h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center"
            >
              <a href={`/exam/${examId}/live`} className="w-full h-full flex items-center justify-center gap-4">
                Initiate Assessment Session
                <Lock className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" />
              Encrypted
            </div>
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="h-3 w-3" />
              Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
