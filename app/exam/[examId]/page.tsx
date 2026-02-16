"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GraduationCap, ShieldCheck, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/pageComponents/ModeToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useExam } from "@/hooks/contexts/ExamContext";

import { signIn } from "next-auth/react";

export default function ExamEntry() {
  const { examId } = useParams();
  const { exams, registerStudent, student } = useExam();
  const router = useRouter();
  const exam = exams.find((e) => e.id === examId);

  const [usn, setUsn] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [isInSeb, setIsInSeb] = useState(true);

  useEffect(() => {
    if (exam?.sebConfigId) {
      const ua = navigator.userAgent;
      const isSeb = ua.includes("SEB") || (window as any).SafeExamBrowser;
      setIsInSeb(!!isSeb);
    }
  }, [exam]);

  if (!exam)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-lg">Exam not found.</p>
      </div>
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usn.trim() || !name.trim() || !email.trim() || !className.trim() || !section.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      // Direct submission check
      const checkResp = await fetch(`/api/results/my-result?examId=${examId}&usn=${usn.trim()}`);
      if (checkResp.ok) {
        const { found } = await checkResp.json();
        if (found) {
          toast.info("You have already submitted this exam. Redirecting to results...");
          router.push(`/exam/${examId}/result`);
          return;
        }
      }

      const success = await registerStudent({
        examId: examId as string,
        name: name.trim(),
        email: email.trim(),
        usn: usn.trim(),
        class: className.trim(),
        section: section.trim(),
      });

      if (!success) {
        toast.error("Entry failed. Please try again.");
      } else {
        toast.success(`Welcome, ${name}!`);
        router.push(`/exam/${examId}/instructions`);
      }
    } catch (error) {
      toast.error("An error occurred during entry");
    }
  };

  // Add auto-redirect if already logged in and submitted
  useEffect(() => {
    if (student && examId) {
      const checkSubmission = async () => {
        const resp = await fetch(`/api/results/my-result?examId=${examId}&usn=${student.usn}`);
        if (resp.ok) {
          const { found } = await resp.json();
          if (found) router.push(`/exam/${examId}/result`);
        }
      };
      checkSubmission();
    }
  }, [student, examId, router]);

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-10 relative">
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-card rounded-2xl shadow-elevated p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{exam.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {exam.duration} min · {exam.totalMarks} marks
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="usn">USN / Roll Number</Label>
                <Input
                  id="usn"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  placeholder="e.g. 1AB21CS001"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="class">Class</Label>
                <Input
                  id="class"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. 6th"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g. A"
                  className="mt-1.5"
                />
              </div>
            </div>
            <Button type="submit" className="w-full font-semibold h-11 mt-4">
              Continue to Instructions
            </Button>
          </form>
        </div>

        {exam.sebConfigId && !isInSeb && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/90 backdrop-blur-md border border-red-500/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <ShieldCheck className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Security Requirement</h3>
              </div>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                This exam is restricted to the <span className="text-white font-bold">Safe Exam Browser</span>. You cannot enter the exam using a standard browser.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  className="bg-red-600 hover:bg-red-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-red-600/20"
                  onClick={() => {
                    const host = window.location.host;
                    // Using sebs:// for secure HTTPS connection as required by Vercel
                    window.location.href = `sebs://${host}/api/seb/config/${examId}`;
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Launch in SEB
                </Button>
                <div className="flex items-center justify-between gap-3 mt-2">
                   <a 
                    href={`/api/seb/config/${examId}`} 
                    download
                    className="flex-1 text-[10px] text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 py-2 border border-slate-800 rounded-lg"
                   >
                     <Download className="w-3 h-3" />
                     Download Config
                   </a>
                   <a 
                    href="https://safeexambrowser.org/download_en.html" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 text-[10px] text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 py-2 border border-slate-800 rounded-lg"
                   >
                     <ExternalLink className="w-3 h-3" />
                     Install SEB
                   </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
