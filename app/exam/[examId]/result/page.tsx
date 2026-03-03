"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Home, ClipboardList } from "lucide-react";
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
              const answers = result.answers ? JSON.parse(result.answers) : {};
              const questions = currentExam?.questions || [];

              let derivedCorrect = 0;
              let derivedWrong = 0;

              questions.forEach((q: any) => {
                const ans = answers[q.id];
                if (ans === undefined) return;

                let isCorrect = false;
                if (q.type === 'msq') {
                  const correctIndices = q.correctAnswer.split(',').map((val: string) => parseInt(val)).sort();
                  isCorrect = Array.isArray(ans) &&
                    ans.length === correctIndices.length &&
                    [...ans].sort((a, b) => a - b).every((val, i) => val === correctIndices[i]);
                } else if (q.type === 'text') {
                  isCorrect = typeof ans === 'string' && ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                } else {
                  isCorrect = String(ans) === String(q.correctAnswer);
                }

                if (isCorrect) derivedCorrect++;
                else derivedWrong++;
              });

              setData({
                score: result.score,
                totalMarks: result.totalMarks || 100,
                correct: derivedCorrect,
                wrong: derivedWrong,
                violations: result.violations,
                sectionScores: result.sectionScores ? JSON.parse(result.sectionScores) : {},
                answers: answers,
                justifications: result.justifications ? JSON.parse(result.justifications) : {},
                questions: questions,
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

  // Parse section scores and answers for display
  const sectionScores = data.sectionScores || {};
  const userAnswers = data.answers || {};
  const examQuestions = data.questions || currentExam?.questions || [];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 gap-8">
      <div className="w-full max-w-4xl animate-slide-up space-y-8">
        {/* Main Score Card */}
        <div className="bg-card rounded-3xl shadow-elevated p-10 border border-border text-center overflow-hidden relative">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${passed ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-destructive/10"}`}>
            {passed ? (
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            ) : (
              <XCircle className="w-12 h-12 text-destructive" />
            )}
          </div>
          <h1 className="text-4xl font-black text-foreground mb-3 tracking-tight">
            {passed ? "Exam Accomplished!" : "Review Required"}
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            {passed ? "You've successfully cleared the assessment." : "The passing threshold was not reached this time."}
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-10">
            <div className="text-center">
              <div className="text-7xl font-black text-foreground mb-2 tracking-tighter">
                {pct}%
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Overall Proficiency</p>
              <div className="mt-2 px-4 py-1.5 bg-primary/10 rounded-full inline-block">
                <p className="text-sm font-bold text-primary">{data.score} / {data.totalMarks} Marks</p>
              </div>
            </div>

            <div className="h-24 w-px bg-border hidden md:block" />

            <div className="grid grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mx-auto mb-2 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-foreground">{data.correct}</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Correct</p>
              </div>
              <div className="text-center group">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mx-auto mb-2 group-hover:bg-destructive group-hover:text-white transition-all">
                  <XCircle className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-foreground">{data.wrong}</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Failed</p>
              </div>
              <div className="text-center group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mx-auto mb-2 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-foreground">{data.violations}</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Alerts</p>
              </div>
            </div>
          </div>

          {(currentExam?.positiveMarks !== undefined || currentExam?.negativeMarks !== undefined) && (
            <div className="flex items-center justify-center gap-6 mt-4 p-4 rounded-2xl bg-muted/20 border border-border max-w-md mx-auto">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Positive Marking</span>
                <span className="text-sm font-bold text-emerald-600">+{currentExam.positiveMarks || 1} Points</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Negative Marking</span>
                <span className="text-sm font-bold text-destructive">-{currentExam.negativeMarks || 0} Points</span>
              </div>
            </div>
          )}

          {/* Sectional Breakdown */}
          {Object.keys(sectionScores).length > 0 && (
            <div className="mt-10 pt-10 border-t border-border">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 text-left">Sectional Performance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(sectionScores).map(([section, score]) => {
                  const config = currentExam?.sectionsConfig?.find(s => s.name === section);
                  const maxMarks = config ? config.pickCount : null;
                  return (
                    <div key={section} className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all">
                      <div className="flex flex-col items-start">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Domain</span>
                        <span className="text-sm font-bold text-foreground">{section}</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-primary">{score as any}</span>
                          {maxMarks && <span className="text-[10px] font-bold text-muted-foreground">/ {maxMarks}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Answer Review */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-primary" />
              Detailed Response Review
            </h2>
            <div className="px-3 py-1 bg-muted rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {examQuestions.length} Questions Evaluated
            </div>
          </div>

          <div className="grid gap-6">
            {examQuestions.map((q: any, idx: number) => {
              const userAns = userAnswers[q.id];
              let isCorrect = false;

              if (q.type === 'msq') {
                const correctIndices = q.correctAnswer.split(',').map((val: string) => parseInt(val)).sort();
                isCorrect = Array.isArray(userAns) &&
                  userAns.length === correctIndices.length &&
                  [...userAns].sort((a, b) => a - b).every((val, i) => val === correctIndices[i]);
              } else if (q.type === 'text') {
                isCorrect = typeof userAns === 'string' && userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
              } else {
                isCorrect = String(userAns) === String(q.correctAnswer);
              }

              return (
                <div key={q.id} className="bg-card rounded-3xl border border-border shadow-sm p-8 transition-all hover:shadow-md">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                          {idx + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'bg-emerald-500/10 text-emerald-600' : userAns === undefined ? 'bg-muted text-muted-foreground' : 'bg-destructive/10 text-destructive'}`}>
                          {isCorrect ? 'Correct Path' : userAns === undefined ? 'Did Not Attempt' : 'Incorrect Choice'}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-auto">
                          {q.section || 'General'} • {q.marks} Marks
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground leading-relaxed">
                        {q.question}
                      </h3>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Student Response */}
                    <div className={`p-5 rounded-2xl border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : userAns === undefined ? 'bg-muted/50 border-border' : 'bg-destructive/5 border-destructive/20'}`}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Your Response</p>
                      <div className="text-sm font-bold">
                        {q.type === 'text' ? (
                          userAns || <span className="text-muted-foreground italic">No response provided</span>
                        ) : q.type === 'msq' ? (
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(userAns) && userAns.length > 0 ? userAns.map((i: number) => (
                              <span key={i} className={`px-3 py-1 rounded-lg text-xs font-black ${isCorrect ? 'bg-emerald-500/20 text-emerald-700' : 'bg-destructive/20 text-destructive-700'}`}>
                                {q.options?.[i]?.text || i}
                              </span>
                            )) : <span className="text-muted-foreground italic">No options selected</span>}
                          </div>
                        ) : (
                          <span className={isCorrect ? 'text-emerald-700' : 'text-destructive-700'}>
                            {userAns !== undefined && q.options?.[userAns] ? q.options[userAns].text : userAns !== undefined ? userAns : <span className="text-muted-foreground italic">No option selected</span>}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Correct Solution */}
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Verified Solution</p>
                      <div className="text-sm font-bold text-foreground">
                        {q.type === 'msq' ? (
                          <div className="flex flex-wrap gap-2">
                            {q.correctAnswer.split(',').map((i: string) => parseInt(i)).map((i: number) => (
                              <span key={i} className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-black">
                                {q.options?.[i]?.text || i}
                              </span>
                            ))}
                          </div>
                        ) : q.type === 'text' ? (
                          q.correctAnswer
                        ) : (
                          <span className="text-primary">{q.options?.[parseInt(q.correctAnswer)]?.text || q.correctAnswer}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {q.solution && (
                    <div className="mt-6 p-6 rounded-2xl bg-muted/50 border border-border">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 border-b border-border pb-2">Academic Explanation</p>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {q.solution}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center pt-8 border-t border-border mt-12">
          <Button asChild size="lg" className="rounded-2xl px-12 font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105">
            <Link href="/">
              <Home className="w-5 h-5 mr-3" />
              Complete & Exit Portal
            </Link>
          </Button>
          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30">
            Security Access Token: {new Date().getTime().toString(16).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
