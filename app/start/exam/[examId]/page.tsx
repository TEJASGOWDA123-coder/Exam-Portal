"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Download, 
  ExternalLink, 
  Lock, 
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 selection:bg-emerald-500/30">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header Section */}
        <div className="p-10 rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <ShieldCheck className="h-48 w-48 text-emerald-500 rotate-12" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Secure Protocol v2.0</span>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
                {exam.title}
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs opacity-60">
                Matrix Authorization Interface
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-2">
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Duration</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{exam.duration} Minutes</span>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Total Marks</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{exam.totalMarks} Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="p-10 rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
           <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                 <BadgeCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter">Candidate Instructions</h2>
           </div>

           <div className="space-y-6">
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                 <ul className="space-y-4 list-none p-0">
                    <li className="flex gap-4">
                       <span className="flex-none w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">01</span>
                       <span>Ensure a stable high-speed network connection before initiation.</span>
                    </li>
                    <li className="flex gap-4">
                       <span className="flex-none w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">02</span>
                       <span>AI Integrity Guard will monitor gaze, audio, and peripheral activity.</span>
                    </li>
                     <li className="flex gap-4">
                        <span className="flex-none w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">03</span>
                        <span>Exiting the secure evaluation environment will trigger a compliance review.</span>
                     </li>
                 </ul>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                  <Button 
                    asChild
                    className="h-20 rounded-[2rem] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg shadow-[0_20px_40px_rgba(34,197,94,0.3)] hover:shadow-[0_25px_50px_rgba(34,197,94,0.4)] transition-all active:scale-[0.98]"
                  >
                    <a href={`/exam/${examId}/live`}>
                      Initiate Assessment Session
                    </a>
                  </Button>
              </div>
           </div>
        </div>

        {/* Footer Support */}
        <div className="flex justify-end items-center px-6 pb-20">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
              <ShieldCheck className="h-3 w-3" />
              End-to-End Encrypted Session
           </div>
        </div>
      </div>
    </div>
  );
}
