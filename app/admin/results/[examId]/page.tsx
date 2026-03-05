"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
   Download,
   Search,
   RefreshCw,
   ClipboardList,
   Trash2,
   CalendarX,
   ArrowLeft,
   LayoutGrid,
   CheckCircle2,
   Trophy,
   Users,
   AlertCircle,
   Eye,
   FileSearch,
   Check,
   XCircle,
   X as XIcon,
   Sparkles as SparklesIcon,
   BarChart2
} from "lucide-react";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useExam } from "@/hooks/contexts/ExamContext";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function ViewResults() {
   const { exams, results, fetchResults } = useExam();
   const { examId } = useParams();
   const router = useRouter();
   const [search, setSearch] = useState("");
   const [fClass, setFClass] = useState("all");
   const [fYear, setFYear] = useState("all");
   const [fSection, setFSection] = useState("all");
   const [isRefreshing, setIsRefreshing] = useState(false);
   const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
   const [validatingJustification, setValidatingJustification] = useState<Record<string, boolean>>({});
   const [aiFeedbacks, setAiFeedbacks] = useState<Record<string, any>>({});

   const currentExam = exams.find((e) => e.id === examId);

   // Auto-refresh on mount to ensure we see new submissions
   useEffect(() => {
      fetchResults();
   }, []);

   const handleRefresh = async () => {
      setIsRefreshing(true);
      await fetchResults();
      setIsRefreshing(false);
      toast.success("Consolidated ledger updated");
   };

   const handleReschedule = async (id: string, name: string) => {
      if (!confirm(`Confirm reschedule for ${name}? This will clear their current result and allow them to retake the exam. This action is irreversible.`)) {
         return;
      }

      try {
         const res = await fetch(`/api/results/${id}`, { method: "DELETE" });
         if (!res.ok) throw new Error("Failed to delete result");
         toast.success(`${name} rescheduled successfully`);
         fetchResults();
      } catch (error) {
         toast.error("Operation failed");
      }
   };

   const handleRescheduleAll = async () => {
      const confirmation = prompt(`Type "RESCHEDULE" to confirm resetting ALL results for "${currentExam?.title}". This will allow all students to re-take the exam. This action is IRREVERSIBLE.`);

      if (confirmation !== "RESCHEDULE") {
         if (confirmation !== null) toast.error("Incorrect confirmation text");
         return;
      }

      setIsRefreshing(true);
      try {
         const res = await fetch(`/api/results?examId=${examId}`, { method: "DELETE" });
         if (!res.ok) throw new Error("Failed to reset results");
         toast.success("Exam has been rescheduled for all candidates");
         await fetchResults();
      } catch (error) {
         toast.error("Bulk reschedule failed");
      } finally {
         setIsRefreshing(false);
      }
   };

   const filtered = results.filter((r) => {
      if (examId && r.examId !== examId) return false;
      if (fClass !== "all" && r.class !== fClass) return false;
      if (fYear !== "all" && r.year !== fYear) return false;
      if (fSection !== "all" && r.section !== fSection) return false;

      const name = (r.studentName || "").toLowerCase();
      const usn = (r.usn || "").toLowerCase();
      const s = search.toLowerCase();
      return name.includes(s) || usn.includes(s);
   });

   const classes = Array.from(new Set(results.filter(r => r.examId === examId).map(r => r.class)));
   const years = Array.from(new Set(results.filter(r => r.examId === examId).map(r => r.year)));
   const studentSections = Array.from(new Set(results.filter(r => r.examId === examId).map(r => r.section)));

   const submissionSections = Array.from(new Set(
      filtered.flatMap(r => {
         try {
            const scores = typeof r.sectionScores === 'string' ? JSON.parse(r.sectionScores) : r.sectionScores;
            return Object.keys(scores || {});
         } catch { return []; }
      })
   ));

   const downloadExcel = () => {
      const data = filtered.map(r => {
         let sectionData: Record<string, any> = {};
         try {
            const scores = typeof r.sectionScores === 'string' ? JSON.parse(r.sectionScores) : r.sectionScores;
            const sectionsToUse = currentExam?.sectionsConfig?.map(s => s.name) || submissionSections;
            sectionsToUse.forEach(s => {
               sectionData[`Section: ${s}`] = scores?.[s] || 0;
            });
         } catch { }

         return {
            "Student Name": r.studentName,
            "USN": r.usn,
            "Email": r.email,
            "Department": r.class,
            "Year": r.year,
            "Section": r.section,
            "Total Score": r.score,
            "Max Marks": currentExam?.totalMarks || 0,
            ...sectionData,
            "Violations": r.violations,
            "Submitted At": format(new Date(r.submittedAt), "yyyy-MM-dd HH:mm:ss")
         };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
      XLSX.writeFile(workbook, `results-${examId}-${Date.now()}.xlsx`);
      toast.success("Export generated successfully");
   };

   const validateAI = async (qId: string, qText: string, correct: string, just: string) => {
      setValidatingJustification(prev => ({ ...prev, [qId]: true }));
      try {
         const resp = await fetch("/api/ai/validate-justification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: qText, correctAnswer: correct, studentJustification: just })
         });
         const data = await resp.json();
         setAiFeedbacks(prev => ({ ...prev, [`${selectedSubmission.id}-${qId}`]: data }));
         toast.success("Validation complete");
      } catch (e) {
         toast.error("Validation failed");
      } finally {
         setValidatingJustification(prev => ({ ...prev, [qId]: false }));
      }
   };

   return (
      <div className="w-full animate-fade-in pb-10 px-4">
         {/* Header */}
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold">
                  <Trophy className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h1 className="text-3xl font-bold text-foreground font-title">{currentExam ? currentExam.title : "Exam Results"}</h1>
                  <p className="text-muted-foreground mt-1 text-sm font-medium">Evaluation Ledger • {filtered.length} Submissions</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <Button variant="ghost" asChild className="font-bold">
                  <Link href="/admin/dashboard">
                     <ArrowLeft className="w-4 h-4 mr-2" />
                     Back to Dashboard
                  </Link>
               </Button>
               <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing} className="font-bold">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  Sync
               </Button>
               <Button onClick={handleRescheduleAll} variant="destructive" disabled={isRefreshing || filtered.length === 0} className="font-bold shadow-lg shadow-destructive/20 border-red-500/50">
                  <CalendarX className="w-4 h-4 mr-2" />
                  Reschedule All
               </Button>
               <Button onClick={downloadExcel} className="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
               </Button>
            </div>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
               { label: "Total Candidates", value: filtered.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
               { label: "Average Score", value: filtered.length > 0 ? Math.round(filtered.reduce((a, b) => a + b.score, 0) / filtered.length) : 0, icon: BarChart2, color: "text-amber-500", bg: "bg-amber-500/10" },
               { label: "Integrity Alerts", value: filtered.reduce((a, b) => a + b.violations, 0), icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" }
            ].map((s, idx) => (
               <div key={idx} className="bg-card p-6 rounded-2xl border border-border shadow-card hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                     <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                        <s.icon className="w-5 h-5" />
                     </div>
                  </div>
                  <div>
                     <p className="text-3xl font-bold text-foreground tabular-nums">{s.value}</p>
                     <p className="text-xs font-medium text-muted-foreground mt-1">{s.label}</p>
                  </div>
               </div>
            ))}
         </div>

         {/* Filters & Table */}
         <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                     placeholder="Search candidates..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="pl-9 h-11 bg-card"
                  />
               </div>
               <div className="flex gap-4">
                  <select
                     value={fClass}
                     onChange={(e) => setFClass(e.target.value)}
                     className="h-11 px-4 rounded-md bg-card border border-input text-sm font-medium focus:ring-1 focus:ring-ring"
                  >
                     <option value="all">Dept: All</option>
                     {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                     value={fYear}
                     onChange={(e) => setFYear(e.target.value)}
                     className="h-11 px-4 rounded-md bg-card border border-input text-sm font-medium focus:ring-1 focus:ring-ring"
                  >
                     <option value="all">Year: All</option>
                     {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select
                     value={fSection}
                     onChange={(e) => setFSection(e.target.value)}
                     className="h-11 px-4 rounded-md bg-card border border-input text-sm font-medium focus:ring-1 focus:ring-ring"
                  >
                     <option value="all">Sec: All</option>
                     {studentSections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-border bg-muted/30">
                           <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Candidate</th>
                           <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Class Info</th>
                           <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Performance</th>
                           <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border">
                        {filtered.length === 0 ? (
                           <tr>
                              <td colSpan={4} className="py-12 text-center text-muted-foreground font-medium">No results found</td>
                           </tr>
                        ) : filtered.map((r) => {
                           let scores = {};
                           try {
                              scores = typeof r.sectionScores === 'string' ? JSON.parse(r.sectionScores) : r.sectionScores || {};
                           } catch (e) { }

                           return (
                              <tr key={r.id} className="group hover:bg-muted/30 transition-colors">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
                                          {r.studentName.charAt(0)}
                                       </div>
                                       <div>
                                          <p className="font-bold text-foreground text-sm">{r.studentName}</p>
                                          <p className="text-xs text-muted-foreground font-mono">{r.usn}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                       <span className="px-2 py-1 rounded bg-muted text-xs font-medium text-foreground border border-border">
                                          {r.class}
                                       </span>
                                       <span className="px-2 py-1 rounded bg-muted text-xs font-medium text-foreground border border-border">
                                          Year: {r.year}
                                       </span>
                                       <span className="px-2 py-1 rounded bg-muted text-xs font-medium text-foreground border border-border">
                                          Sec: {r.section}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="space-y-2">
                                       <div className="flex items-center gap-2">
                                          <span className="text-lg font-bold text-foreground">{r.score}</span>
                                          <span className="text-xs text-muted-foreground">/ {currentExam?.totalMarks}</span>
                                          {r.violations > 0 && (
                                             <span className="ml-2 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border border-red-200 dark:border-red-800">
                                                {r.violations} Alerts
                                             </span>
                                          )}
                                       </div>
                                       <div className="flex flex-wrap gap-1">
                                          {Object.entries(scores || {}).map(([s, val]) => (
                                             <span key={s} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                {s}: <strong className="text-foreground">{val as any}</strong>
                                             </span>
                                          ))}
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedSubmission(r)} className="h-8 text-xs font-bold">
                                       <Eye className="w-3.5 h-3.5 mr-2" /> View
                                    </Button>
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => handleReschedule(r.id, r.studentName)}
                                       className="h-8 text-[10px] font-bold text-red-600 hover:text-white hover:bg-white px-3"
                                    >
                                       <CalendarX className="w-3.5 h-3.5 mr-2" /> Reschedule
                                    </Button>
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Details Modal */}
         <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] p-0 border-none shadow-2xl bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-2xl">
               <DialogHeader className="sr-only">
                  <DialogTitle>{selectedSubmission?.studentName || "Candidate"} - Assessment Report</DialogTitle>
                  <DialogDescription>
                     Detailed performance review for USN {selectedSubmission?.usn}
                  </DialogDescription>
               </DialogHeader>

               {/* Background Blobs for Modal */}
               <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="blob w-[400px] h-[400px] bg-emerald-500/10 -top-20 -left-20 animate-float opacity-50" />
                  <div className="blob w-[300px] h-[300px] bg-blue-500/10 -bottom-20 -right-20 animate-float [animation-delay:3s] opacity-50" />
               </div>

               <div className="relative flex flex-col h-full max-h-[90vh] overflow-hidden">
                  <div className="p-10 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                           <div className="h-16 w-16 rounded-[1.25rem] bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500 font-black text-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                              {selectedSubmission?.studentName.charAt(0)}
                           </div>
                           <div className="space-y-1">
                              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                                 {selectedSubmission?.studentName}
                              </h2>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                   USN: {selectedSubmission?.usn}
                                </span>
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">
                                   Assessment Report
                                </span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-4 items-stretch">
                           <div className="flex flex-col justify-center bg-white/60 dark:bg-slate-900/60 px-6 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm">
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                                     +{currentExam?.positiveMarks ?? 1} 
                                     <span className="ml-1.5 text-[10px] opacity-60 font-bold uppercase tracking-widest">Correct</span>
                                  </span>
                                </div>
                                <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700" />
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-red-500" />
                                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                                     -{currentExam?.negativeMarks ?? 0} 
                                     <span className="ml-1.5 text-[10px] opacity-60 font-bold uppercase tracking-widest">Incorrect</span>
                                  </span>
                                </div>
                              </div>
                           </div>
                           <div className="min-w-[120px] text-center bg-emerald-500 px-6 py-4 rounded-3xl shadow-[0_0_25px_rgba(16,185,129,0.2)] flex flex-col items-center justify-center border border-emerald-400/20">
                              <p className="text-3xl font-black text-white leading-none mb-1 tracking-tighter">
                                 {selectedSubmission?.score}
                              </p>
                              <span className="text-[10px] uppercase font-black text-white/80 tracking-widest">Total Points</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar relative z-10">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Email</p>
                           <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedSubmission?.email}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Batch / Class</p>
                           <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedSubmission?.year} • {selectedSubmission?.class} • Section {selectedSubmission?.section}</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                  {currentExam?.questions.map((q, idx) => {
                     const justs = typeof selectedSubmission?.justifications === 'string' ? JSON.parse(selectedSubmission.justifications) : selectedSubmission?.justifications || {};
                     const studentJust = justs[q.id];
                     const feedback = aiFeedbacks[`${selectedSubmission?.id}-${q.id}`];
                     const isValidating = validatingJustification[q.id];

                     const answers = typeof selectedSubmission?.answers === 'string' ? JSON.parse(selectedSubmission.answers) : selectedSubmission?.answers || {};
                     const studentAnswer = answers[q.id];

                     let parsedOptions: any[] = [];
                     try {
                        parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options || [];
                     } catch(e) {}

                     const renderAnswer = (ans: any) => {
                        if (ans === undefined || ans === null || ans === "") return <span className="text-muted-foreground italic">Not answered</span>;
                        
                        if (q.type !== 'mcq' && q.type !== 'msq') {
                           return <span className="text-foreground">{String(ans)}</span>;
                        }

                        if (q.type === 'mcq') {
                           const idx = parseInt(ans);
                           if (isNaN(idx)) return String(ans);
                           return <span className="text-foreground">{parsedOptions[idx]?.text || `Option ${idx + 1}`}</span>;
                        }
                        
                        if (q.type === 'msq') {
                           let arr = ans;
                           if (typeof ans === 'string') {
                              try { arr = JSON.parse(ans); } catch(e) { arr = []; }
                           }
                           if (Array.isArray(arr)) {
                              return (
                                 <ul className="list-disc list-inside text-foreground space-y-1">
                                    {arr.map(i => <li key={i}>{parsedOptions[parseInt(i)]?.text || `Option ${parseInt(i) + 1}`}</li>)}
                                 </ul>
                              );
                           }
                           return String(ans);
                        }
                        return String(ans);
                     };

                     const checkCorrectness = () => {
                        if (studentAnswer === undefined || studentAnswer === null || studentAnswer === "") return false;
                        if (q.type === 'mcq') return parseInt(studentAnswer) === parseInt(q.correctAnswer);
                        if (q.type === 'msq') {
                           let sArr = Array.isArray(studentAnswer) ? studentAnswer.map(Number) : [];
                           let cArr: number[] = [];
                           try { cArr = typeof q.correctAnswer === 'string' ? JSON.parse(q.correctAnswer).map(Number) : []; } catch(e) {}
                           return sArr.length === cArr.length && [...sArr].sort().join(',') === [...cArr].sort().join(',');
                        }
                        return String(studentAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
                     };

                     const isCorrect = checkCorrectness();
                     const isAnswered = studentAnswer !== undefined && studentAnswer !== null && studentAnswer !== "";

                     return (
                        <div key={q.id} className="group p-6 rounded-2xl bg-white/5 dark:bg-slate-900/40 border border-slate-800/60 transition-all hover:bg-white/10 dark:hover:bg-slate-900/60">
                           <div className="flex items-start gap-4">
                              <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center text-sm font-bold text-slate-300 border border-slate-700 mt-0.5">{idx + 1}</span>
                              <div className="flex-1 space-y-5">
                                 <div>
                                    <div className="flex justify-between items-start mb-2">
                                       <h4 className="font-bold text-white text-lg leading-relaxed whitespace-pre-wrap">{q.question}</h4>
                                       <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                                          {isAnswered ? (
                                             isCorrect ? (
                                                <span className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm flex items-center gap-1.5">
                                                   <CheckCircle2 className="w-4 h-4" /> Correct <span className="opacity-70 text-[10px]">+{currentExam?.positiveMarks || 1}</span>
                                                </span>
                                             ) : (
                                                <span className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm flex items-center gap-1.5">
                                                   <XCircle className="w-4 h-4" /> Incorrect <span className="opacity-70 text-[10px]">-{currentExam?.negativeMarks || 0}</span>
                                                </span>
                                             )
                                          ) : (
                                             <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 shadow-sm flex items-center gap-1.5">
                                                Skipped <span className="opacity-70 text-[10px]">0</span>
                                             </span>
                                          )}
                                       </div>
                                    </div>
                                    <div className="flex gap-2">
                                       <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800/50 text-slate-400 border border-slate-700/50">
                                          {q.section}
                                       </span>
                                       <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800/50 text-slate-400 border border-slate-700/50 uppercase tracking-widest">
                                          {q.type}
                                       </span>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className={`rounded-xl border p-5 flex flex-col transition-colors ${isAnswered ? (isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20') : 'bg-slate-800/40 border-slate-700/50'}`}>
                                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                          Student Selection
                                       </div>
                                       <div className="text-sm flex-1 text-slate-200 font-medium">
                                          {renderAnswer(studentAnswer)}
                                       </div>
                                    </div>
                                    <div className="bg-primary/5 rounded-xl border border-primary/20 p-5 flex flex-col">
                                       <div className="text-[10px] font-bold text-primary mb-3 flex items-center gap-2 uppercase tracking-wider">
                                          Correct Answer(s)
                                       </div>
                                       <div className="text-sm flex-1 text-slate-200 font-medium">
                                          {renderAnswer(q.correctAnswer)}
                                       </div>
                                    </div>
                                 </div>

                                 {q.requiresJustification ? (
                                    <div className="bg-muted/30 rounded-xl border border-border p-4">
                                       <div className="flex items-center justify-between mb-4">
                                          <div className="flex items-center gap-2">
                                             <SparklesIcon className="w-4 h-4 text-amber-500" />
                                             <span className="text-xs font-bold text-foreground">Justification</span>
                                          </div>
                                          <Button
                                             size="sm"
                                             disabled={isValidating || !studentJust}
                                             onClick={() => validateAI(q.id, q.question, q.correctAnswer, studentJust)}
                                             className="h-8 text-xs font-bold bg-primary text-primary-foreground"
                                          >
                                             {isValidating ? <RefreshCw className="w-3 h-3 animate-spin mr-2" /> : <div className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2" /> Validate</div>}
                                          </Button>
                                       </div>
                                       <p className="text-sm text-muted-foreground p-3 bg-background rounded-lg border border-border italic mb-4">
                                          "{studentJust || "No justification provided."}"
                                       </p>

                                       {feedback && (
                                          <div className={`p-4 rounded-lg border flex items-start gap-3 animation-fade-in ${feedback.isValid ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                             {feedback.isValid ? <Check className="w-4 h-4 text-emerald-600 mt-0.5" /> : <XIcon className="w-4 h-4 text-red-600 mt-0.5" />}
                                             <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                   <span className="text-xs font-bold text-foreground">AI Analysis</span>
                                                   <span className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border font-mono">{feedback.score}/10</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground hover:text-foreground transition-colors">{feedback.feedback}</p>
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 ) : (
                                    <p className="text-[10px] text-muted-foreground italic font-medium opacity-60">No justification required for this question.</p>
                                 )}
                              </div>
                           </div>
                        </div>
                     );
                  })}
                     </div>
                  </div>
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}
