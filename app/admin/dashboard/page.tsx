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
    <div className="max-w-[1400px] mx-auto space-y-12 animate-fade-in pb-20">
      {/* Welcome & Quick Actions */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-16 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-none border border-white/5">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-emerald-900/10 blur-[120px]" />
        
        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>Performance Hub</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight md:text-6xl text-white">
              Hello, <span className="text-emerald-500">{session?.user?.name || "Admin"}</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-xl leading-relaxed">Your emerald evaluation center is ready. Monitor, create, and refine your examinations here.</p>
          </div>
          <div className="flex shrink-0 gap-4">
            {role === "superadmin" && (
              <Button variant="outline" asChild className="h-16 px-8 rounded-2xl border-white/10 bg-white/5 font-black text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <Link href="/admin/manage-admins">
                  <ShieldCheck className="mr-3 h-5 w-5" />
                  Staff Panel
                </Link>
              </Button>
            )}
            <Button asChild className="h-16 px-10 rounded-2xl bg-emerald-500 font-black text-slate-950 shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:bg-emerald-400 hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all active:scale-95">
              <Link href="/admin/create-exam">
                <Plus className="mr-2 h-5 w-5" />
                Initialize Exam
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="group relative rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:border-emerald-500/30 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-8">
              <div className={`rounded-2xl ${s.bg} p-4 transition-transform group-hover:rotate-6`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div className="h-1 w-12 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>
            <div>
              <p className="text-5xl font-black text-slate-950 dark:text-white tabular-nums tracking-tighter">{s.value}</p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Main Content */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 pt-1.5 bg-emerald-500 rounded-full" />
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Examination Matrix</h2>
          </div>
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
