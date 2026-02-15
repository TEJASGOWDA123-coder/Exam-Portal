"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useExam } from "@/hooks/contexts/ExamContext";

export default function Result() {
  const { examId } = useParams();
  const { student, exams } = useExam();
  const currentExam = exams.find(e => e.id === examId);
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

  // Check if we should show details
  const showDetails = currentExam ? (currentExam.showResults !== undefined ? !!currentExam.showResults : true) : true;

  if (!showDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Submission Successful</h1>
            <p className="text-muted-foreground mb-8">
              Your exam has been submitted successfully for review. The results will be announced by the administrator.
            </p>
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Parse section scores for display
  const sectionScores = data.sectionScores || {};

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl animate-slide-up space-y-6">
        <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border text-center relative overflow-hidden">
          {/* Status Icon & Header */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? "bg-green-100" : "bg-destructive/10"}`}>
            {passed ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-destructive" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {passed ? "Congratulations!" : "Keep Trying!"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {passed ? "You've passed the exam." : "You did not meet the passing criteria."}
          </p>

          {/* Main Score Display */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 mb-10">
            <div className="text-center">
              <div className="text-6xl font-black text-foreground mb-2 tracking-tighter">
                {pct}%
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scoring Matrix</p>
              <p className="text-sm font-bold text-primary mt-1">{data.score} / {data.totalMarks} marks</p>
            </div>
            
            <div className="h-20 w-px bg-border hidden md:block" />

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center text-green-600 mb-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-foreground">{data.correct}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-destructive mb-1">
                  <XCircle className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-foreground">{data.wrong}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Wrong</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-amber-500 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-foreground">{data.violations}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Alerts</p>
              </div>
            </div>
          </div>

          {/* New: Section Breakdown Card */}
          {Object.keys(sectionScores).length > 0 && (
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 text-left ml-1">Sectional Performance Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(sectionScores).map(([section, score]) => {
                  const config = currentExam?.sectionsConfig?.find(s => s.name === section);
                  const maxMarks = config ? config.pickCount : null;
                  return (
                    <div key={section} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border transition-all hover:border-primary/20">
                      <span className="text-xs font-bold text-foreground">{section}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-black text-emerald-600">{score as any}</span>
                         {maxMarks && <span className="text-[10px] font-bold text-muted-foreground">/ {maxMarks} marks</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
          Generated Security Stamp: {new Date().getTime().toString(16).toUpperCase()}
        </p>
      </div>
    </div>
  );
}
