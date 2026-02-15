"use client";

import {
  Plus,
  Eye,
  BarChart2,
  Users,
  FileText,
  CheckCircle,
  ShieldCheck,
  Edit,
  Trash2,
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExam } from "@/hooks/contexts/ExamContext";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  upcoming: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  completed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function Dashboard() {
  const { exams, results, students, deleteExam } = useExam();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const stats = [
    { label: "Total Exams", value: exams.length, icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Students", value: students.length, icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active", value: exams.filter((e) => e.status === "active").length, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Submissions", value: results.length, icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the exam "${title}"? This will also delete all associated questions and results.`)) {
      const success = await deleteExam(id);
      if (success) {
        toast.success("Exam deleted successfully");
      } else {
        toast.error("Failed to delete exam");
      }
    }
  };

  return (
    <div className="w-full space-y-12 animate-fade-in pb-20">
      {/* Welcome & Quick Actions */}
      {/* Header section inspired by image */}
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
            Hello, <span className="text-emerald-500">Chief Admin</span>
          </h1>
          <p className="text-slate-400 font-bold tracking-wide text-sm opacity-80">
            Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-4">
             {role === "superadmin" && (
              <Button variant="outline" asChild className="h-14 px-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-emerald-950/40 font-black text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <Link href="/admin/manage-admins">
                  <ShieldCheck className="mr-3 h-5 w-5" />
                  Staff
                </Link>
              </Button>
            )}
            <Button asChild className="h-14 w-14 rounded-full bg-emerald-500 p-0 flex items-center justify-center shadow-[0_10px_25px_rgba(16,185,129,0.3)] hover:scale-110 active:scale-95 transition-all">
              <Link href="/admin/create-exam">
                <Plus className="h-6 w-6 text-white" />
              </Link>
            </Button>
        </div>
      </section>

      {/* Main Stat Card - Inspired by "Total Exams Conducted" */}
      <section className="px-4">
        <div className="bg-white dark:bg-emerald-950/40 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-emerald-50/50 to-transparent dark:from-emerald-950/20 pointer-events-none" />
          
          <div className="flex flex-col items-start gap-8 relative z-10">
            <div className="flex items-center justify-between w-full">
              <div className="h-16 w-16 rounded-[1.25rem] bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
                <FileText className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                12% vs last month
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                {exams.length.toLocaleString()}
              </p>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Total Assessments Curated</p>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {/* Active Students Style */}
        <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl group">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Cohort</span>
          </div>
          <div className="flex items-end justify-between mb-4">
            <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
              {students.length.toLocaleString()}
            </p>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 rounded-full w-2/3 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>
        </div>

        {/* Pending Results Style */}
        <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl group">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Analysis Pending</span>
          </div>
          <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
            {exams.filter(e => e.status === 'completed').length}
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
             <Clock className="h-3 w-3" /> Awaiting data audit
          </div>
        </div>
      </section>

      {/* Main Content */}
      {/* Recent Activity Section inspired by "Recent Activity" list */}
      <section className="space-y-6 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recent Activity</h2>
          <Button variant="ghost" asChild className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50/50 px-4 rounded-xl hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/40">
            <Link href="/admin/exam">See All</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {exams.slice(0, 4).map((exam, idx) => (
            <div key={exam.id} className="group bg-white dark:bg-slate-900/40 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800 flex items-center gap-6 shadow-sm hover:shadow-xl transition-all">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center relative ${
                exam.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50' : 
                'bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50'
              }`}>
                {exam.status === 'active' ? <Clock className="h-7 w-7 text-emerald-500" /> : <FileText className="h-7 w-7 text-slate-400" />}
                {exam.status === 'active' && (
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-500 transition-colors">{exam.title}</h4>
                <p className="text-xs font-bold text-slate-400 mt-1">Scheduled for Batch A-2024</p>
              </div>

              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums italic">
                {idx === 0 ? "2m ago" : `${(idx + 1) * 15}m ago`}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Action Button - Mobile Insight */}
      <div className="fixed bottom-8 right-8 z-50 md:hidden">
        <Button asChild className="h-16 w-16 rounded-full bg-emerald-500 p-0 flex items-center justify-center shadow-[0_15px_35px_rgba(16,185,129,0.4)] hover:scale-110 active:scale-95 transition-all">
          <Link href="/admin/create-exam">
            <Plus className="h-8 w-8 text-white" />
          </Link>
        </Button>
      </div>

      {/* Examination Matrix Grid Section - Preserving Original Content with New Theme */}
      <section className="space-y-8 px-4 pt-12">
        <div className="flex items-center gap-3">
            <div className="h-10 w-1 pt-1.5 bg-emerald-500 rounded-full" />
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Examination Matrix</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {exams.length === 0 ? (
            <div className="col-span-full rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-32 text-center dark:border-slate-800 dark:bg-slate-950/20">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-8 dark:bg-slate-900">
                <FileText className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Terminal Empty</h3>
              <p className="mt-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Await Initialization</p>
              <Button asChild className="mt-10 rounded-2xl h-14 px-8 font-black bg-emerald-500 text-slate-950" variant="default">
                <Link href="/admin/create-exam">Create First Exam</Link>
              </Button>
            </div>
          ) : (
            exams.map((exam) => (
              <div key={exam.id} className="group flex flex-col rounded-[2.5rem] border border-slate-200 bg-white p-2 transition-all hover:border-emerald-500/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900 transform-gpu active:scale-[0.98]">
                <div className="relative flex-1 rounded-[2rem] p-7">
                  {/* Card Header */}
                  <div className="mb-8 flex items-start justify-between">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${statusStyles[exam.status]}`}>
                      <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${exam.status === 'active' ? 'bg-emerald-500' : 'bg-current opacity-40'}`} />
                      {exam.status}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-500 dark:bg-slate-800 transition-colors">
                        <Link href={`/admin/edit-exam/${exam.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(exam.id, exam.title)} className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:bg-slate-800">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Card Title */}
                  <div className="mb-10 min-h-[64px]">
                    <h3 className="line-clamp-2 text-2xl font-black leading-[1.2] text-slate-950 dark:text-white group-hover:text-emerald-500 transition-colors">
                      {exam.title}
                    </h3>
                  </div>

                  {/* Card Info Pills */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex flex-col gap-1 rounded-[1.5rem] bg-slate-50/50 p-4 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/20">
                      <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-emerald-500" /> Duration
                      </span>
                      <span className="text-lg font-black text-slate-950 dark:text-white">{exam.duration}m</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-[1.5rem] bg-slate-50/50 p-4 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/20">
                      <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-blue-500" /> Max Score
                      </span>
                      <span className="text-lg font-black text-slate-950 dark:text-white">{exam.totalMarks} <span className="text-[10px] text-slate-400">PTS</span></span>
                    </div>
                  </div>

                  {/* Date Metadata */}
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {new Date(exam.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>

                {/* Tactical Actions */}
                <div className="grid grid-cols-2 gap-2 p-2 mt-auto">
                  <Button variant="ghost" asChild className="h-14 rounded-3xl bg-slate-50 font-black text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-400 border border-transparent hover:border-emerald-100 transition-all">
                    <Link href={`/admin/add-questions/${exam.id}`}>
                      Pool Matrix
                    </Link>
                  </Button>
                  <Button asChild className="h-14 rounded-3xl bg-slate-950 font-black text-white hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-lg active:scale-95 group/btn">
                    <Link href={`/admin/results/${exam.id}`} className="flex items-center justify-center">
                      Analysis
                      <ArrowRight className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
