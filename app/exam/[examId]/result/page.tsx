"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useExam } from "@/hooks/contexts/ExamContext";

export default function Result() {
  const { examId } = useParams();
  const { student } = useExam();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localData = JSON.parse(sessionStorage.getItem("lastResult") || "null");
    if (localData) {
      setData(localData);
      setLoading(false);
    } else if (student && examId) {
      // Fetch from API if sessionStorage is empty (e.g. on reload)
      const fetchResult = async () => {
        try {
          const resp = await fetch(`/api/results/my-result?examId=${examId}&usn=${student.usn}`);
          if (resp.ok) {
            const { found, result } = await resp.json();
            if (found) {
              setData({
                score: result.score,
                totalMarks: result.totalMarks || 100, // Fallback if not in DB
                correct: Math.round(result.score / (result.totalMarks / 10)), // Approximate if needed
                wrong: 0, // Approximate
                violations: result.violations,
              });
            }
          }
        } catch (err) {
          console.error("Failed to fetch result:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchResult();
    } else {
      setLoading(false);
    }
  }, [student, examId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No result data found.</p>
          <Button asChild>
            <Link href={`/exam/${examId}`}>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const passed = data.score / data.totalMarks >= 0.4;
  const pct = Math.round((data.score / data.totalMarks) * 100);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? "bg-green-100" : "bg-destructive/10"}`}
          >
            {passed ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-destructive" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {passed ? "Congratulations!" : "Keep Trying!"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {passed
              ? "You've passed the exam."
              : "You did not meet the passing criteria."}
          </p>

          <div className="text-5xl font-extrabold text-foreground mb-1">
            {pct}%
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            {data.score} / {data.totalMarks} marks
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-muted rounded-xl p-3">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-foreground">
                {data.correct}
              </p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <div className="flex items-center justify-center gap-1 text-destructive mb-1">
                <XCircle className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-foreground">{data.wrong}</p>
              <p className="text-xs text-muted-foreground">Wrong</p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <div className="flex items-center justify-center gap-1 text-warning mb-1">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-foreground">
                {data.violations}
              </p>
              <p className="text-xs text-muted-foreground">Violations</p>
            </div>
          </div>

          {/* <Button asChild className="w-full">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button> */}
        </div>
      </div>
    </div>
  );
}
