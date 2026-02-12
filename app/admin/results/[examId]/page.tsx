"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search, RefreshCw, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useExam } from "@/hooks/contexts/ExamContext";
import { format } from "date-fns";
import { useParams } from "next/navigation";

export default function ViewResults() {
  const { exams, results, fetchResults } = useExam();
  const { examId } = useParams();
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentExam = exams.find((e) => e.id === examId);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchResults();
    setIsRefreshing(false);
    toast.success("Results refreshed");
  };

  const filtered = results.filter((r) => {
    if (examId && r.examId !== examId) return false;
    const name = (r.studentName || "").toLowerCase();
    const usn = (r.usn || "").toLowerCase();
    const s = search.toLowerCase();
    return name.includes(s) || usn.includes(s);
  });

  const downloadCSV = () => {
    const header = "Name,USN,Email,Class,Section,Score,Violations,Submitted At\n";
    const rows = filtered
      .map(
        (r) =>
          `"${r.studentName}","${r.usn}","${r.email}","${r.class}","${r.section}",${r.score},${r.violations},"${format(new Date(r.submittedAt), "yyyy-MM-dd HH:mm:ss")}"`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results-${examId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV Downloaded");
  };

  return (
    <div className="animate-fade-in max-w-6xl pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {currentExam ? `${currentExam.title} Results` : "Exam Results"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              <span className="font-bold text-foreground">{filtered.length}</span> submissions registered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={downloadCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by student name or USN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 shadow-sm"
        />
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs uppercase font-bold text-muted-foreground px-6 py-4">Student Info</th>
                <th className="text-left text-xs uppercase font-bold text-muted-foreground px-6 py-4">Class/Sec</th>
                <th className="text-left text-xs uppercase font-bold text-muted-foreground px-6 py-4 text-center">Score</th>
                <th className="text-left text-xs uppercase font-bold text-muted-foreground px-6 py-4 text-center">Violations</th>
                <th className="text-right text-xs uppercase font-bold text-muted-foreground px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">{r.studentName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{r.usn} | {r.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-foreground">{r.class} - {r.section}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <span className="text-sm font-bold">{r.score}</span>
                      {currentExam && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {Math.round((r.score / currentExam.totalMarks) * 100)}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-bold ${r.violations > 0 ? "text-destructive" : "text-foreground"}`}>
                      {r.violations}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(r.submittedAt), "MMM d, yyyy HH:mm")}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground">No submissions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
