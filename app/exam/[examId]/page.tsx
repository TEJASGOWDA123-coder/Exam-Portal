"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  Download,
  ExternalLink,
  Clock,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  User,
  Mail,
  Hash,
  Building2,
  CalendarDays,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/pageComponents/ModeToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  registerStudentThunk,
  loadStudentFromStorage,
  setStudent,
} from "@/store/slices/examSlice";
import { cn } from "@/lib/utils";

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  htmlFor,
  icon: Icon,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  icon: React.ElementType;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
      >
        <Icon className="w-3 h-3 shrink-0" />
        {label}
      </Label>
      {children}
      {hint && (
        <p className="text-[11px] text-muted-foreground/60 pl-0.5">{hint}</p>
      )}
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ label }: { label: string }) {
  return (
    <span className="text-xs font-semibold text-muted-foreground bg-muted/60 border border-border px-2.5 py-1 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

// ── Select skeleton ───────────────────────────────────────────────────────────
function SelectSkeleton() {
  return (
    <div className="h-10 rounded-xl border border-border bg-muted/30 animate-pulse" />
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10 relative">
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 opacity-20 dark:opacity-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% -10%, hsl(var(--primary) / 0.5), transparent)",
          }}
        />
      </div>
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ExamEntry() {
  const { examId } = useParams();
  const exams = useAppSelector((state) => state.exam.exams);
  const student = useAppSelector((state) => state.exam.student);
  const dispatch = useAppDispatch();
  const registerStudent = async (studentData: any) => {
    try {
      await dispatch(registerStudentThunk(studentData)).unwrap();
      return true;
    } catch {
      return false;
    }
  };
  const router = useRouter();
  const exam = exams.find((e) => e.id === examId);

  const [usn, setUsn] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deptId, setDeptId] = useState("");
  const [yearId, setYearId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [isInSeb, setIsInSeb] = useState(true);
  const [timeStatus, setTimeStatus] = useState<
    "upcoming" | "active" | "completed"
  >("active");
  const [submitting, setSubmitting] = useState(false);
  const [academicData, setAcademicData] = useState<any>(null);
  const [loadingAcademic, setLoadingAcademic] = useState(true);

  useEffect(() => {
    dispatch(loadStudentFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (!exam) return;
    if (exam.sebConfigId) {
      const ua = navigator.userAgent;
      setIsInSeb(ua.includes("SEB") || !!(window as any).SafeExamBrowser);
    }
    const now = new Date();
    if (exam.startTime && new Date(exam.startTime) > now)
      setTimeStatus("upcoming");
    else if (exam.endTime && new Date(exam.endTime) < now)
      setTimeStatus("completed");
    else setTimeStatus("active");
  }, [exam]);

  useEffect(() => {
    if (!student || !examId) return;

    const checkSessionAndSubmission = async () => {
      if (student.examId !== examId) return;
      try {
        // First check for active session
        const sessionResp = await fetch(
          `/api/exam/${examId}/session?studentUsn=${student.usn}`,
        );
        if (sessionResp.ok) {
          const sessionData = await sessionResp.json();
          if (sessionData.canResume && sessionData.session) {
            // Active session found, redirect to live exam
            router.push(`/exam/${examId}/live`);
            return;
          }
        }

        // Then check for existing submission
        const resultResp = await fetch(
          `/api/results/my-result?examId=${examId}&usn=${student.usn}`,
        );
        if (resultResp.ok) {
          const { found } = await resultResp.json();
          if (found) router.push(`/exam/${examId}/result`);
        }
      } catch (err) {
        console.error("Failed to check session/submission status:", err);
      }
    };

    checkSessionAndSubmission();
  }, [student, examId, router]);

  useEffect(() => {
    fetch("/api/academic")
      .then((r) => r.json())
      .then((result) => {
        if (result.success) setAcademicData(result.data);
      })
      .catch(() => {})
      .finally(() => setLoadingAcademic(false));
  }, []);

  if (!exam)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm font-medium">
          Exam not found.
        </p>
      </div>
    );

  const departments = academicData?.departments ?? [];
  const filteredYears =
    academicData?.years?.filter((y: any) => y.departmentId === deptId) ?? [];
  const filteredSections =
    academicData?.sections?.filter((s: any) => s.departmentId === deptId) ?? [];

  const selectedDept = departments.find((d: any) => d.id === deptId);
  const selectedYear = filteredYears.find((y: any) => y.id === yearId);
  const selectedSection = filteredSections.find((s: any) => s.id === sectionId);

  const handleDeptChange = (val: string) => {
    setDeptId(val);
    setYearId("");
    setSectionId("");
  };
  const handleYearChange = (val: string) => {
    setYearId(val);
    // Don't reset section since sections are independent of years
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !usn.trim() ||
      !name.trim() ||
      !email.trim() ||
      !deptId ||
      !yearId ||
      !sectionId
    ) {
      toast.error("Please fill all fields");
      return;
    }
    if (exam?.sebConfigId && !isInSeb) {
      toast.error("This exam must be taken in Safe Exam Browser.");
      return;
    }
    setSubmitting(true);
    try {
      // Check for existing session first
      const sessionResp = await fetch(
        `/api/exam/${examId}/session?studentUsn=${usn.trim()}`,
      );
      if (sessionResp.ok) {
        const sessionData = await sessionResp.json();
        if (sessionData.canResume && sessionData.session) {
          // IMPORTANT: If we found a session, we MUST populate the student Redux state 
          // because if they manually re-entered their details, Redux might be empty.
          dispatch(
            setStudent({
              id: sessionData.session.studentUsn, // Fallback if ID is missing from session
              examId: examId as string,
              name: sessionData.session.studentName || name.trim(),
              email: sessionData.session.studentEmail || email.trim(),
              usn: sessionData.session.studentUsn || usn.trim(),
              class: sessionData.session.studentClass || (selectedDept?.code ?? deptId),
              year: sessionData.session.studentYear || (selectedYear?.name ?? yearId),
              section: sessionData.session.studentSection || (selectedSection?.name ?? sectionId),
            }),
          );

          toast.info("Existing session found. Redirecting to exam...");
          router.push(`/exam/${examId}/live`);
          return;
        }
      }

      const checkResp = await fetch(
        `/api/results/my-result?examId=${examId}&usn=${usn.trim()}`,
      );
      if (checkResp.ok) {
        const { found } = await checkResp.json();
        if (found) {
          toast.info("Already submitted. Redirecting…");
          router.push(`/exam/${examId}/result`);
          return;
        }
      }
      const success = await registerStudent({
        examId: examId as string,
        name: name.trim(),
        email: email.trim(),
        usn: usn.trim(),
        class: selectedDept?.code ?? deptId,
        year: selectedYear?.name ?? yearId,
        section: selectedSection?.name ?? sectionId,
      });
      if (!success) toast.error("Entry failed. Please try again.");
      else {
        toast.success(`Welcome, ${name}!`);
        router.push(`/exam/${examId}/instructions`);
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isEntryDisabled = !!(exam?.sebConfigId && !isInSeb);

  // ── Upcoming ───────────────────────────────────────────────────────────────
  if (timeStatus === "upcoming")
    return (
      <PageShell>
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-lg shadow-black/5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
              <Clock className="w-7 h-7 text-amber-500" />
            </div>
            <h1 className="text-xl font-black text-foreground mb-2">
              Exam Starts Soon
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              This exam hasn't started yet. The link becomes active at the
              scheduled time.
            </p>
            <div className="bg-muted/40 border border-border rounded-xl p-4 mb-6 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                Scheduled Start
              </p>
              <p className="text-sm font-bold text-foreground">
                {exam.startTime
                  ? new Date(exam.startTime).toLocaleString()
                  : "TBD"}
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="w-full h-10 rounded-xl font-bold text-sm shadow-sm shadow-primary/20"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Page
            </Button>
          </div>
        </div>
      </PageShell>
    );

  // ── Completed ──────────────────────────────────────────────────────────────
  if (timeStatus === "completed")
    return (
      <PageShell>
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-lg shadow-black/5">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-7 h-7 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-black text-foreground mb-2">
              Exam Concluded
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              This exam has ended. Contact your administrator if you need a
              reschedule.
            </p>
            <div className="bg-muted/40 border border-border rounded-xl p-4 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                Concluded At
              </p>
              <p className="text-sm font-bold text-foreground">
                {exam.endTime ? new Date(exam.endTime).toLocaleString() : "TBD"}
              </p>
            </div>
          </div>
        </div>
      </PageShell>
    );

  // ── Active ─────────────────────────────────────────────────────────────────
  return (
    <PageShell>
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
        {/* Entry card */}
        <div className="bg-card border border-border rounded-2xl shadow-lg shadow-black/5 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-border bg-muted/10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-base font-black text-foreground leading-tight mb-3 line-clamp-2 px-2">
              {exam.title}
            </h1>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <StatChip label={`${exam.duration} min`} />
              <StatChip label={`${exam.totalMarks} marks`} />
              {exam.sebConfigId && (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SEB Required
                </span>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <Field label="USN / Roll Number" htmlFor="usn" icon={Hash}>
              <Input
                id="usn"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                placeholder="e.g. 1AB21CS001"
                disabled={isEntryDisabled}
                className="h-10 rounded-xl"
              />
            </Field>

            <Field label="Full Name" htmlFor="name" icon={User}>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                disabled={isEntryDisabled}
                className="h-10 rounded-xl"
              />
            </Field>

            <Field label="Email" htmlFor="email" icon={Mail}>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isEntryDisabled}
                className="h-10 rounded-xl"
              />
            </Field>

            {/* Academic section — stacked with divider */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                  Academic Details
                </p>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Department — full width */}
              <Field label="Department" htmlFor="dept" icon={Building2}>
                {loadingAcademic ? (
                  <SelectSkeleton />
                ) : (
                  <Select
                    value={deptId}
                    onValueChange={handleDeptChange}
                    disabled={isEntryDisabled}
                  >
                    <SelectTrigger id="dept" className="h-10 rounded-xl">
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>
                          <span className="font-bold">{d.code}</span>
                          <span className=" ml-1.5 text-xs">— {d.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>

              {/* Year + Section — side by side, both available after dept chosen */}
              <div
                className={cn(
                  "grid grid-cols-2 gap-3 transition-opacity duration-200",
                  !deptId && "opacity-40 pointer-events-none",
                )}
              >
                <Field
                  label="Year"
                  htmlFor="year"
                  icon={CalendarDays}
                  hint={!deptId ? "Select dept first" : undefined}
                >
                  {loadingAcademic ? (
                    <SelectSkeleton />
                  ) : (
                    <Select
                      value={yearId}
                      onValueChange={handleYearChange}
                      disabled={isEntryDisabled || !deptId}
                    >
                      <SelectTrigger
                        id="year"
                        className="h-10 rounded-xl w-full"
                      >
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {filteredYears.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            No years found
                          </SelectItem>
                        ) : (
                          filteredYears.map((y: any) => (
                            <SelectItem key={y.id} value={y.id}>
                              {y.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </Field>

                <Field
                  label="Section"
                  htmlFor="section"
                  icon={BookOpen}
                  hint={!deptId ? "Select dept first" : undefined}
                >
                  {loadingAcademic ? (
                    <SelectSkeleton />
                  ) : (
                    <Select
                      value={sectionId}
                      onValueChange={setSectionId}
                      disabled={isEntryDisabled || !deptId}
                    >
                      <SelectTrigger
                        id="section"
                        className={cn(
                          "h-10 rounded-xl w-full",
                          !deptId && "opacity-50",
                        )}
                      >
                        <SelectValue placeholder="Section" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {filteredSections.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            No sections found
                          </SelectItem>
                        ) : (
                          filteredSections.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isEntryDisabled || submitting}
              className="w-full h-11 rounded-xl font-bold text-sm shadow-md shadow-primary/20 mt-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying…
                </>
              ) : isEntryDisabled ? (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  SEB Required to Proceed
                </>
              ) : (
                <>
                  Continue to Instructions
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* SEB warning */}
        {exam.sebConfigId && !isInSeb && (
          <div className="bg-slate-900 dark:bg-slate-950 border border-red-500/20 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-sm font-bold text-white">
                Security Requirement
              </p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              This exam is restricted to{" "}
              <span className="text-white font-bold">Safe Exam Browser</span>.
              Standard browsers are not permitted.
            </p>
            <div className="space-y-2">
              <Button
                className="w-full h-11 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20"
                onClick={() => {
                  window.location.href = `sebs://${window.location.host}/api/seb/config/${examId}`;
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Launch in Safe Exam Browser
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`/api/seb/config/${examId}`}
                  download
                  className="flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> Download Config
                </a>
                <a
                  href="https://safeexambrowser.org/download_en.html"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors text-xs font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Install SEB
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
