// "use client";

// import {
//   Plus,
//   FileText,
//   Users,
//   CheckCircle,
//   Clock,
//   LayoutDashboard,
//   GraduationCap,
//   TrendingUp,
//   ArrowRight,
//   Calendar,
//   MoreVertical,
//   Search,
//   Filter,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useExam } from "@/hooks/contexts/ExamContext";
// import Link from "next/link";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";

// const statusStyles: Record<string, string> = {
//   active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
//   upcoming: "bg-amber-500/10 text-amber-500 border-amber-500/20",
//   completed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
// };

// export default function Dashboard() {
//   const { exams, results, students, deleteExam } = useExam();
//   const { data: session } = useSession();
//   const role = (session?.user as any)?.role;

//   const handleDelete = async (id: string, title: string) => {
//     if (
//       confirm(
//         `Are you sure you want to delete the exam "${title}"? This will also delete all associated questions and results.`,
//       )
//     ) {
//       const success = await deleteExam(id);
//       if (success) {
//         toast.success("Exam deleted successfully");
//       } else {
//         toast.error("Failed to delete exam");
//       }
//     }
//   };

//   return (
//     <div className="w-full animate-fade-in pb-10 px-4">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
//         <div className="flex items-center gap-4">
//           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold">
//             <LayoutDashboard className="w-6 h-6 text-primary" />
//           </div>
//           <div>
//             <h1 className="text-3xl font-bold text-foreground font-title">
//               Dashboard
//             </h1>
//             <p className="text-muted-foreground mt-1 text-sm font-medium">
//               Overview of your examination portal
//             </p>
//           </div>
//         </div>
//         <div className="flex gap-3">
//           <Button
//             asChild
//             className="font-bold shadow-lg shadow-primary/20 h-11 px-6 rounded-xl"
//           >
//             <Link href="/admin/create-exam">
//               <Plus className="h-4 w-4 mr-2" />
//               New Exam
//             </Link>
//           </Button>
//         </div>
//       </div>

//       {/* Main Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {/* Total Exams Card */}
//         <Card className="p-6 rounded-2xl shadow-card border border-border bg-card relative overflow-hidden group hover:border-primary/50 transition-colors">
//           <div className="flex items-start justify-between mb-4">
//             <div className="p-3 bg-primary/10 rounded-xl text-primary">
//               <FileText className="w-6 h-6" />
//             </div>
//             <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
//               <TrendingUp className="w-3 h-3" /> +12%
//             </span>
//           </div>
//           <div className="space-y-1">
//             <h3 className="text-3xl font-black text-foreground tracking-tight">
//               {exams.length}
//             </h3>
//             <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
//               Total Exams
//             </p>
//           </div>
//           <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
//             <FileText className="w-32 h-32 -mb-8 -mr-8" />
//           </div>
//         </Card>

//         {/* Active Students Card */}
//         <Card className="p-6 rounded-2xl shadow-card border border-border bg-card relative overflow-hidden group hover:border-blue-500/50 transition-colors">
//           <div className="flex items-start justify-between mb-4">
//             <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
//               <GraduationCap className="w-6 h-6" />
//             </div>
//             <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
//               Active
//             </span>
//           </div>
//           <div className="space-y-1">
//             <h3 className="text-3xl font-black text-foreground tracking-tight">
//               {students.length}
//             </h3>
//             <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
//               Students
//             </p>
//           </div>
//           <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
//             <GraduationCap className="w-32 h-32 -mb-8 -mr-8" />
//           </div>
//         </Card>

//         {/* Active Exams Card */}
//         <Card className="p-6 rounded-2xl shadow-card border border-border bg-card relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
//           <div className="flex items-start justify-between mb-4">
//             <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
//               <CheckCircle className="w-6 h-6" />
//             </div>
//             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
//           </div>
//           <div className="space-y-1">
//             <h3 className="text-3xl font-black text-foreground tracking-tight">
//               {exams.filter((e) => e.status === "active").length}
//             </h3>
//             <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
//               Active Exams
//             </p>
//           </div>
//         </Card>

//         {/* Pending Analysis Card */}
//         <Card className="p-6 rounded-2xl shadow-card border border-border bg-card relative overflow-hidden group hover:border-amber-500/50 transition-colors">
//           <div className="flex items-start justify-between mb-4">
//             <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
//               <Clock className="w-6 h-6" />
//             </div>
//             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
//               Generic
//             </span>
//           </div>
//           <div className="space-y-1">
//             <h3 className="text-3xl font-black text-foreground tracking-tight">
//               {exams.filter((e) => e.status === "completed").length}
//             </h3>
//             <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
//               Completed
//             </p>
//           </div>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Recent Activity / Exams List */}
//         <div className="lg:col-span-2 space-y-6">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-bold text-foreground">Recent Exams</h2>
//             <Button
//               variant="ghost"
//               asChild
//               className="text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary"
//             >
//               <Link href="/admin/exam">View All</Link>
//             </Button>
//           </div>

//           <div className="space-y-4">
//             {exams.slice(0, 5).map((exam) => (
//               <Card
//                 key={exam.id}
//                 className="p-4 rounded-xl shadow-sm border border-border bg-card hover:bg-muted/50 transition-all group flex items-center justify-between"
//               >
//                 <div className="flex items-center gap-4">
//                   <div
//                     className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
//                       exam.status === "active"
//                         ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
//                         : "bg-muted/50 border-border text-muted-foreground"
//                     }`}
//                   >
//                     <FileText className="w-5 h-5" />
//                   </div>
//                   <div>
//                     <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
//                       {exam.title}
//                     </h4>
//                     <div className="flex items-center gap-3 mt-1">
//                       <span
//                         className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border ${statusStyles[exam.status] || statusStyles.completed}`}
//                       >
//                         {exam.status}
//                       </span>
//                       <span className="text-xs text-muted-foreground flex items-center gap-1">
//                         <Calendar className="w-3 h-3" />
//                         {new Date(exam.startTime).toLocaleDateString()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   asChild
//                   className="h-8 w-8 text-muted-foreground hover:text-primary"
//                 >
//                   <Link href={`/admin/results/${exam.id}`}>
//                     <ArrowRight className="w-4 h-4" />
//                   </Link>
//                 </Button>
//               </Card>
//             ))}
//             {exams.length === 0 && (
//               <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
//                 <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
//                   <FileText className="w-6 h-6 text-muted-foreground" />
//                 </div>
//                 <h3 className="font-bold text-muted-foreground">
//                   No exams found
//                 </h3>
//                 <p className="text-sm text-muted-foreground/80 mb-4">
//                   Create your first exam to get started
//                 </p>
//                 <Button asChild variant="outline">
//                   <Link href="/admin/create-exam">Create Exam</Link>
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Side Panel / Quick Actions */}
//         <div className="space-y-6">
//           <Card className="p-6 rounded-2xl shadow-card border border-border bg-card">
//             <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
//             <div className="space-y-3">
//               <Button
//                 variant="outline"
//                 asChild
//                 className="w-full justify-start h-11 font-medium border-border hover:bg-muted/50"
//               >
//                 <Link href="/admin/create-exam">
//                   <Plus className="w-4 h-4 mr-2" />
//                   New Assessment
//                 </Link>
//               </Button>
//               <Button
//                 variant="outline"
//                 asChild
//                 className="w-full justify-start h-11 font-medium border-border hover:bg-muted/50"
//               >
//                 <Link href="/admin/sections">
//                   <LayoutDashboard className="w-4 h-4 mr-2" />
//                   Manage Templates
//                 </Link>
//               </Button>
//               <Button
//                 variant="outline"
//                 asChild
//                 className="w-full justify-start h-11 font-medium border-border hover:bg-muted/50"
//               >
//                 <Link href="/admin/manage-admins">
//                   <Users className="w-4 h-4 mr-2" />
//                   Staff Management
//                 </Link>
//               </Button>
//             </div>
//           </Card>

//           <Card className="p-6 rounded-2xl shadow-card border border-border bg-gradient-to-br from-primary/10 to-transparent">
//             <div className="mb-4">
//               <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-3">
//                 <TrendingUp className="w-5 h-5" />
//               </div>
//               <h3 className="font-bold text-foreground">Pro Tips</h3>
//               <p className="text-xs text-muted-foreground mt-1">
//                 Enhance your exam quality with AI suggestions.
//               </p>
//             </div>
//             <Button
//               variant="secondary"
//               className="w-full font-bold text-xs h-9 bg-background/80 hover:bg-background"
//             >
//               View Insights
//             </Button>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import {
  Plus,
  FileText,
  Users,
  CheckCircle,
  Clock,
  LayoutDashboard,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  Calendar,
  Sparkles,
  Zap,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { deleteExamThunk } from "@/store/slices/examSlice";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  upcoming: {
    label: "Upcoming",
    dot: "bg-amber-500",
    badge:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  completed: {
    label: "Completed",
    dot: "bg-slate-400",
    badge:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  },
};

const statCards = (exams: any[], students: any[]) => [
  {
    title: "Total Exams",
    value: exams.length,
    icon: FileText,
    accent: "text-violet-500",
    bg: "bg-violet-500/10",
    ring: "hover:ring-violet-500/30",
    badge: {
      label: "+12%",
      color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
  },
  {
    title: "Students",
    value: students.length,
    icon: GraduationCap,
    accent: "text-sky-500",
    bg: "bg-sky-500/10",
    ring: "hover:ring-sky-500/30",
    badge: {
      label: "Active",
      color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
  },
  {
    title: "Live Now",
    value: exams.filter((e) => e.status === "active").length,
    icon: CheckCircle,
    accent: "text-emerald-500",
    bg: "bg-emerald-500/10",
    ring: "hover:ring-emerald-500/30",
    badge: null,
    pulse: true,
  },
  {
    title: "Completed",
    value: exams.filter((e) => e.status === "completed").length,
    icon: Clock,
    accent: "text-amber-500",
    bg: "bg-amber-500/10",
    ring: "hover:ring-amber-500/30",
    badge: {
      label: "Total",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  },
];

function StatCard({ card }: { card: ReturnType<typeof statCards>[number] }) {
  const Icon = card.icon;
  return (
    <Card
      className={cn(
        "relative overflow-hidden p-6 rounded-2xl border border-border bg-card",
        "transition-all duration-200 ease-out",
        "hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5",
        "ring-2 ring-transparent",
        card.ring,
      )}
    >
      <div className="flex items-start justify-between mb-5">
        <div className={cn("p-2.5 rounded-xl", card.bg)}>
          <Icon className={cn("w-5 h-5", card.accent)} />
        </div>
        {card.pulse ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live
          </span>
        ) : card.badge ? (
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
              card.badge.color,
            )}
          >
            {card.badge.label}
          </span>
        ) : null}
      </div>

      <p className="text-[42px] font-black tracking-tighter leading-none text-foreground tabular-nums">
        {card.value}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
        {card.title}
      </p>

      {/* Ghost icon */}
      <Icon
        className={cn(
          "absolute -right-4 -bottom-4 w-28 h-28 opacity-[0.04]",
          card.accent,
        )}
      />
    </Card>
  );
}

export default function Dashboard() {
  const exams = useAppSelector((state) => state.exam.exams);
  const results = useAppSelector((state) => state.exam.results);
  const students = useAppSelector((state) => state.exam.students);
  const dispatch = useAppDispatch();
  
  const deleteExam = async (id: string) => {
    try {
      await dispatch(deleteExamThunk(id)).unwrap();
      return true;
    } catch { return false; }
  };
  const { data: session } = useSession();

  const handleDelete = async (id: string, title: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${title}"? This will also delete all associated questions and results.`,
      )
    ) {
      const success = await deleteExam(id);
      if (success) {
        toast.success("Exam deleted successfully");
      } else {
        toast.error("Failed to delete exam");
      }
    }
  };

  const cards = statCards(exams, students);

  return (
    <div className="w-full min-h-screen pb-16 px-4 sm:px-6 animate-fade-in">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-none">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Examination portal overview
            </p>
          </div>
        </div>

        <Button
          asChild
          className="h-10 px-5 rounded-sm px-2 font-bold text-sm shadow-md shadow-primary/20 shrink-0"
        >
          <Link href="/admin/create-exam">
            <Plus className="h-4 w-4 mr-1.5" />
            New Exam
          </Link>
        </Button>
      </div>

      {/* ── Stats Grid ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {cards.map((card, i) => (
          <StatCard key={i} card={card} />
        ))}
      </div>

      {/* ── Body ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Exams */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              Recent Exams
            </h2>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary h-8 px-3 rounded-lg"
            >
              <Link href="/admin/exam">View all →</Link>
            </Button>
          </div>

          <div className="space-y-2">
            {exams.slice(0, 5).map((exam) => {
              const sc = statusConfig[exam.status] ?? statusConfig.completed;
              return (
                <Link
                  key={exam.id}
                  href={`/admin/results/${exam.id}`}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card
                             hover:bg-muted/40 hover:border-border/80 transition-all duration-150
                             hover:shadow-sm hover:-translate-y-px"
                >
                  {/* Status dot + icon */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span
                      className={cn(
                        "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card",
                        sc.dot,
                      )}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {exam.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                          sc.badge,
                        )}
                      >
                        {sc.label}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(exam.startTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}

            {exams.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-bold text-muted-foreground text-sm">
                  No exams yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1 mb-5">
                  Create your first exam to get started
                </p>
                <Button
                  asChild
                  size="sm"
                  className="rounded-xl h-9 px-5 font-bold text-xs"
                >
                  <Link href="/admin/create-exam">
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Create Exam
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="p-5 rounded-2xl border border-border bg-card">
            <p className="text-sm font-bold text-foreground mb-3">
              Quick Actions
            </p>
            <div className="space-y-2">
              {[
                {
                  href: "/admin/create-exam",
                  icon: Plus,
                  label: "New Assessment",
                },
                {
                  href: "/admin/sections",
                  icon: LayoutDashboard,
                  label: "Manage Templates",
                },
                {
                  href: "/admin/manage-admins",
                  icon: Users,
                  label: "Staff Management",
                },
              ].map(({ href, icon: Icon, label }) => (
                <Button
                  key={href}
                  variant="ghost"
                  asChild
                  className="w-full justify-start h-10 text-sm font-medium rounded-xl text-foreground hover:bg-muted/60 hover:text-foreground"
                >
                  <Link href={href}>
                    <Icon className="w-4 h-4 mr-2 text-muted-foreground" />
                    {label}
                  </Link>
                </Button>
              ))}
            </div>
          </Card>

          {/* Insights promo */}
          <Card className="p-5 rounded-2xl border border-border bg-gradient-to-br from-primary/[0.08] via-card to-card overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-8 translate-x-8 pointer-events-none" />
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="font-bold text-sm text-foreground">AI Insights</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4 leading-relaxed">
                Enhance your exam quality with AI-powered suggestions and
                performance analytics.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full font-bold text-xs h-9 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
              >
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                View Insights
              </Button>
            </div>
          </Card>

          {/* Mini performance summary (bonus!) */}
          <Card className="p-5 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-foreground">
                Completion Rate
              </p>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Active",
                  count: exams.filter((e) => e.status === "active").length,
                  color: "bg-emerald-500",
                },
                {
                  label: "Upcoming",
                  count: exams.filter((e) => e.status === "upcoming").length,
                  color: "bg-amber-500",
                },
                {
                  label: "Completed",
                  count: exams.filter((e) => e.status === "completed").length,
                  color: "bg-slate-400",
                },
              ].map(({ label, count, color }) => {
                const pct =
                  exams.length > 0
                    ? Math.round((count / exams.length) * 100)
                    : 0;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">
                        {label}
                      </span>
                      <span className="text-xs font-semibold text-foreground tabular-nums">
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          color,
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
