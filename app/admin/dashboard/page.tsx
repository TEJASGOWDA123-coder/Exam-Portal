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
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExam } from "@/hooks/contexts/ExamContext";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  active: "status-active",
  upcoming: "status-upcoming",
  completed: "status-completed",
};

export default function Dashboard() {
  const { exams, results, students, deleteExam } = useExam();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const stats = [
    { label: "Total Exams", value: exams.length, icon: FileText },
    { label: "Total Students", value: students.length, icon: GraduationCap },
    {
      label: "Active Exams",
      value: exams.filter((e) => e.status === "active").length,
      icon: CheckCircle,
    },
    { label: "Total Submissions", value: results.length, icon: Users },
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
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Hello, {session?.user?.name || "Admin"}</p>
        </div>
        <div className="flex gap-2">
          {role === "superadmin" && (
            <Button variant="outline" asChild>
              <Link href="/admin/manage-admins">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Manage Admins
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/admin/create-exam">
              <Plus className="w-4 h-4 mr-2" />
              Create Exam
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-2xl p-6 shadow-card border border-border group hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground leading-tight">{s.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-muted/30">
          <h2 className="font-bold text-foreground text-lg">Your Examinations</h2>
        </div>
        <div className="divide-y divide-border">
          {exams.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No exams created yet.
            </div>
          ) : (
            exams.map((exam) => (
              <div
                key={exam.id}
                className="px-6 py-5 flex items-center justify-between hover:bg-muted/10 transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{exam.title}</h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusStyles[exam.status]}`}
                    >
                      {exam.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-3">
                    <span>{exam.duration} Minutes</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{exam.questions.length} Questions</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{exam.totalMarks} Total Marks</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    <Link href={`/admin/edit-exam/${exam.id}`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(exam.id, exam.title)} className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button variant="outline" size="sm" asChild className="h-9 px-4 font-semibold">
                    <Link href={`/admin/add-questions/${exam.id}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Questions
                    </Link>
                  </Button>
                  <Button variant="default" size="sm" asChild className="h-9 px-4 font-semibold shadow-sm">
                    <Link href={`/admin/results/${exam.id}`}>
                      <BarChart2 className="w-4 h-4 mr-2" />
                      Results
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
