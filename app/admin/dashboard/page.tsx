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
  MoreVertical,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExam } from "@/hooks/contexts/ExamContext";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  upcoming: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  completed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function Dashboard() {
  const { exams, results, students, deleteExam } = useExam();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

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
    <div className="w-full animate-fade-in pb-10 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-title">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Overview of your examination portal</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild className="font-bold shadow-lg shadow-primary/20 h-11 px-6 rounded-xl">
            <Link href="/admin/create-exam">
              <Plus className="h-4 w-4 mr-2" />
              New Exam
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Exams Card */}
        <Card className="p-6 rounded-2xl shadow-card border border-border bg-card relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-foreground tracking-tight">{exams.length}</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Exams</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
            <FileText className="w-32 h-32 -mb-8 -mr-8" />
          </div>
        </Card>

        {/* Active Students Card */}
        <Card className="p-6 rounded-2xl shadow-card border border-border bg-card relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Active
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-foreground tracking-tight">{students.length}</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Students</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
            <GraduationCap className="w-32 h-32 -mb-8 -mr-8" />
          </div>
        </Card>

        {/* Active Exams Card */}
        <Card className="p-6 rounded-2xl shadow-card border border-border bg-card relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-foreground tracking-tight">{exams.filter(e => e.status === 'active').length}</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Exams</p>
          </div>
        </Card>

        {/* Pending Analysis Card */}
        <Card className="p-6 rounded-2xl shadow-card border border-border bg-card relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Generic</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-foreground tracking-tight">{exams.filter(e => e.status === 'completed').length}</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Exams List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Recent Exams</h2>
            <Button variant="ghost" asChild className="text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary">
              <Link href="/admin/exam">View All</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {exams.slice(0, 5).map((exam) => (
              <Card key={exam.id} className="p-4 rounded-xl shadow-sm border border-border bg-card hover:bg-muted/50 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${exam.status === 'active'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      : 'bg-muted/50 border-border text-muted-foreground'
                    }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{exam.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border ${statusStyles[exam.status] || statusStyles.completed}`}>
                        {exam.status}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(exam.startTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Link href={`/admin/results/${exam.id}`}>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </Card>
            ))}
            {exams.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-muted-foreground">No exams found</h3>
                <p className="text-sm text-muted-foreground/80 mb-4">Create your first exam to get started</p>
                <Button asChild variant="outline">
                  <Link href="/admin/create-exam">Create Exam</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel / Quick Actions */}
        <div className="space-y-6">
          <Card className="p-6 rounded-2xl shadow-card border border-border bg-card">
            <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" asChild className="w-full justify-start h-11 font-medium border-border hover:bg-muted/50">
                <Link href="/admin/create-exam">
                  <Plus className="w-4 h-4 mr-2" />
                  New Assessment
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start h-11 font-medium border-border hover:bg-muted/50">
                <Link href="/admin/sections">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Manage Templates
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start h-11 font-medium border-border hover:bg-muted/50">
                <Link href="/admin/manage-admins">
                  <Users className="w-4 h-4 mr-2" />
                  Staff Management
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl shadow-card border border-border bg-gradient-to-br from-primary/10 to-transparent">
            <div className="mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground">Pro Tips</h3>
              <p className="text-xs text-muted-foreground mt-1">Enhance your exam quality with AI suggestions.</p>
            </div>
            <Button variant="secondary" className="w-full font-bold text-xs h-9 bg-background/80 hover:bg-background">
              View Insights
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
