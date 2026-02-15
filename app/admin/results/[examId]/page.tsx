"use client";

import { useState } from "react";
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
  AlertCircle
} from "lucide-react";
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
  const [fSection, setFSection] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentExam = exams.find((e) => e.id === examId);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchResults();
    setIsRefreshing(false);
    toast.success("Results refreshed");
  };

  const handleReschedule = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to reschedule ${name}? This will delete their current submission and allow them to retake the exam.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/results/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete result");
      toast.success(`${name} has been rescheduled!`);
      fetchResults();
    } catch (error) {
      toast.error("Could not reschedule candidate");
    }
  };

  const filtered = results.filter((r) => {
    if (examId && r.examId !== examId) return false;
    if (fClass !== "all" && r.class !== fClass) return false;
    if (fSection !== "all" && r.section !== fSection) return false;
    
    const name = (r.studentName || "").toLowerCase();
    const usn = (r.usn || "").toLowerCase();
    const s = search.toLowerCase();
    return name.includes(s) || usn.includes(s);
  });

  const classes = Array.from(new Set(results.filter(r => r.examId === examId).map(r => r.class)));
  const studentSections = Array.from(new Set(results.filter(r => r.examId === examId).map(r => r.section)));

  // Identify all unique sections from submissions
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
        submissionSections.forEach(s => {
          sectionData[`Section: ${s}`] = scores?.[s] || 0;
        });
      } catch {}

      return {
        "Student Name": r.studentName,
        "USN": r.usn,
        "Email": r.email,
        "Class": r.class,
        "Section": r.section,
        "Total Score": r.score,
        ...sectionData,
        "Violations": r.violations,
        "Submitted At": format(new Date(r.submittedAt), "yyyy-MM-dd HH:mm:ss")
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, `results-${examId}-${Date.now()}.xlsx`);
    toast.success("Excel Exported");
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-fade-in pb-20">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-4">
        <div className="flex items-center gap-5">
             <Link href="/admin/dashboard" className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-slate-200 dark:border-slate-800">
               <ArrowLeft className="w-5 h-5 text-slate-500" />
             </Link>
             <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentExam ? currentExam.title : "Exam Analysis"}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Evaluation Ledger • {filtered.length} Submissions
                   </p>
                </div>
             </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing} className="h-14 px-8 rounded-2xl font-black border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all active:scale-95">
            <RefreshCw className={`w-4 h-4 mr-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Sync Results
          </Button>
          <Button onClick={downloadExcel} className="h-14 px-10 rounded-2xl bg-emerald-500 font-black text-slate-950 shadow-[0_10px_30px_rgba(34,197,94,0.2)] hover:bg-emerald-400 hover:shadow-[0_15px_35px_rgba(34,197,94,0.3)] transition-all active:scale-95">
            <Download className="w-4 h-4 mr-3" />
            Export Ledger
          </Button>
        </div>
      </section>

      {/* Stats Quick Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Total Candidates", value: filtered.length, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Average Score", value: filtered.length > 0 ? Math.round(filtered.reduce((a, b) => a + b.score, 0) / filtered.length) : 0, icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Integrity Alerts", value: filtered.reduce((a, b) => a + b.violations, 0), icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" }
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-all hover:shadow-2xl hover:-translate-y-2 group">
             <div className="flex items-center justify-between mb-8">
                <div className={`h-14 w-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} transition-transform group-hover:rotate-6`}>
                   <s.icon className="w-7 h-7" />
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-100 dark:bg-slate-800" />
             </div>
             <p className="text-5xl font-black text-slate-950 dark:text-white tabular-nums tracking-tighter">{s.value}</p>
             <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-4">{s.label}</h3>
          </div>
        ))}
      </section>

      {/* Filters */}
      <section className="bg-white p-3 rounded-[2rem] border border-slate-200 flex flex-col md:flex-row gap-3 shadow-sm dark:bg-slate-900 dark:border-slate-800">
         <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by USN or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-14 h-14 bg-slate-50 border-none rounded-2xl font-black dark:bg-slate-800/50 placeholder:text-slate-400 text-slate-900 dark:text-white"
            />
         </div>
         <select value={fClass} onChange={(e) => setFClass(e.target.value)} className="h-14 px-8 rounded-2xl bg-slate-50 border-none font-black text-xs uppercase tracking-widest outline-none cursor-pointer dark:bg-slate-800/50 appearance-none border-r-[40px] border-r-transparent">
            <option value="all">Class: All</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
         </select>
         <select value={fSection} onChange={(e) => setFSection(e.target.value)} className="h-14 px-8 rounded-2xl bg-slate-50 border-none font-black text-xs uppercase tracking-widest outline-none cursor-pointer dark:bg-slate-800/50 appearance-none border-r-[40px] border-r-transparent">
            <option value="all">Section: All</option>
            {studentSections.map(s => <option key={s} value={s}>{s}</option>)}
         </select>
      </section>

      {/* Results Matrix */}
      <section className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/20">
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Candidate Identity</th>
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Classification</th>
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Performance Matrix</th>
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Operations</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-32 text-center text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No entries detected in matrix</td>
                    </tr>
                  ) : filtered.map((r) => {
                    let scores = {};
                    try {
                      scores = typeof r.sectionScores === 'string' ? JSON.parse(r.sectionScores) : r.sectionScores || {};
                    } catch (e) {
                      console.error("Failed to parse sectionScores-S1:", e);
                    }
                    return (
                      <tr key={r.id} className="group hover:bg-emerald-50/10 transition-all">
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-5">
                              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-emerald-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
                                 {r.studentName.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-black text-lg text-slate-900 dark:text-white capitalize leading-none mb-1.5">{r.studentName}</p>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{r.usn}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              {r.class} <span className="opacity-30">•</span> {r.section}
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex flex-col gap-4">
                              <div className="flex items-end gap-3">
                                 <span className="text-3xl font-black text-slate-950 dark:text-white leading-none">{r.score}</span>
                                 <span className="text-[10px] bg-emerald-500 text-slate-950 px-3 py-1 rounded-lg font-black tracking-widest shadow-[0_5px_15px_rgba(34,197,94,0.2)] mb-0.5">
                                    {currentExam ? Math.round((r.score / currentExam.totalMarks) * 100) : 0}%
                                 </span>
                                 {r.violations > 0 && (
                                   <span className="text-[9px] bg-red-500 text-white px-2.5 py-1 rounded-lg font-black tracking-widest uppercase">
                                      {r.violations} Alerts
                                   </span>
                                 )}
                              </div>
                              {/* Section Breakdown Mini Pills */}
                              <div className="flex flex-wrap gap-2">
                                 {Object.entries(scores || {}).map(([s, val]) => (
                                    <div key={s} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest dark:bg-slate-800 dark:border-slate-700">
                                       {s}: <span className="text-emerald-500">{val as any}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <Button variant="ghost" size="sm" onClick={() => handleReschedule(r.id, r.studentName)} className="rounded-2xl h-12 px-6 text-red-500 hover:bg-red-50 hover:text-red-600 font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-all active:scale-95">
                              <CalendarX className="w-4 h-4 mr-2" />
                              Reset Entry
                           </Button>
                        </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </section>
    </div>
  );
}
