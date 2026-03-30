"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch } from "@/store/hooks";
import { addExamThunk, Exam } from "@/store/slices/examSlice";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Upload,
  Trash2,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Clock,
  ShieldCheck,
  BarChart2,
  FilePlus,
  Calendar,
  Layers,
  Settings2,
  FileText,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ── Pill tab component ──────────────────────────────────────────────────────
const TABS = [
  { id: "details", label: "Details", icon: FileText },
  { id: "sections", label: "Sections", icon: Layers },
  { id: "settings", label: "Settings", icon: Settings2 },
];

function TabPill({
  tab,
  active,
  onClick,
  complete,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onClick: () => void;
  complete?: boolean;
}) {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {tab.label}
      {complete && !active && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-2 right-2" />
      )}
    </button>
  );
}

// ── Toggle row ──────────────────────────────────────────────────────────────
function ToggleRow({
  icon,
  iconColor,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={cn(
            "mt-0.5 p-1.5 rounded-lg shrink-0",
            `bg-${iconColor}-500/10`,
          )}
        >
          <Icon className={cn("w-4 h-4", `text-${iconColor}-500`)} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">
            {label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0"
      />
    </div>
  );
}

// ── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-foreground"
      >
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ── Icon input ───────────────────────────────────────────────────────────────
function IconInput({
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<"input"> & { icon: React.ElementType }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input {...props} className={cn("pl-9 h-11", props.className)} />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CreateExam() {
  const [activeTab, setActiveTab] = useState("details");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(["details"]),
  );

  const goToTab = (id: string) => {
    setActiveTab(id);
    setVisitedTabs((prev) => new Set([...prev, id]));
  };
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [proctoringEnabled, setProctoringEnabled] = useState(false);
  const [proctoringAudio, setProctoringAudio] = useState(true);
  const [proctoringVideo, setProctoringVideo] = useState(true);
  const [showResults, setShowResults] = useState(true);
  const [strictSectionTiming, setStrictSectionTiming] = useState(false);
  const [sectionalNavigation, setSectionalNavigation] = useState<
    "free" | "forward-only"
  >("free");
  const [sebConfigId, setSebConfigId] = useState<string | null>(null);
  const [positiveMarks, setPositiveMarks] = useState("1");
  const [negativeMarks, setNegativeMarks] = useState("0");
  const [maxViolations, setMaxViolations] = useState("3");
  const [configs, setConfigs] = useState<{ id: string; name: string }[]>([]);
  const [availableSections, setAvailableSections] = useState<
    { id: string; name: string }[]
  >([]);
  const [uploadingSeb, setUploadingSeb] = useState(false);
  const [sectionsConfig, setSectionsConfig] = useState<
    { name: string; pickCount: number; duration: number }[]
  >([]);
  const dispatch = useAppDispatch();
  const addExam = async (exam: Exam) => {
    try {
      await dispatch(addExamThunk(exam)).unwrap();
      return true;
    } catch { return false; }
  };
  const router = useRouter();

  useEffect(() => {
    if (startTime && duration) {
      const start = new Date(startTime);
      const mins = parseInt(duration);
      if (!isNaN(mins) && mins > 0) {
        const end = new Date(start.getTime() + mins * 60000);
        const pad = (n: number) => String(n).padStart(2, "0");
        setEndTime(
          `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`,
        );
      }
    }
  }, [startTime, duration]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sebResp, secResp] = await Promise.all([
          fetch("/api/admin/seb"),
          fetch("/api/sections"),
        ]);
        if (sebResp.ok) setConfigs(await sebResp.json());
        if (secResp.ok) setAvailableSections(await secResp.json());
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchData();
  }, []);

  const handleSebUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".seb")) {
      toast.error("Please upload a valid .seb file");
      return;
    }
    setUploadingSeb(true);
    try {
      const text = await file.text();
      const resp = await fetch("/api/admin/seb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name.replace(".seb", ""),
          configData: text,
        }),
      });
      if (resp.ok) {
        const newConfig = await resp.json();
        toast.success("SEB configuration uploaded!");
        const listResp = await fetch("/api/admin/seb");
        if (listResp.ok) {
          const data = await listResp.json();
          setConfigs(data);
          setSebConfigId(newConfig.id);
        }
      } else {
        const error = await resp.json();
        throw new Error(error.error || "Upload failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploadingSeb(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !duration || !totalMarks || !startTime) {
      toast.error("Please fill all required fields");
      goToTab("details");
      return;
    }
    const id = `exam-${Date.now()}`;
    const exam: Exam = {
      id,
      title: title.trim(),
      duration: parseInt(duration),
      totalMarks: parseInt(totalMarks),
      startTime,
      endTime,
      status: "upcoming",
      proctoringEnabled,
      proctoringAudioEnabled: proctoringAudio,
      proctoringVideoEnabled: proctoringVideo,
      showResults,
      strictSectionTiming,
      sectionalNavigation,
      sebConfigId,
      positiveMarks: positiveMarks !== "" ? parseInt(positiveMarks) : 1,
      negativeMarks: negativeMarks || "0",
      maxViolations: parseInt(maxViolations),
      generatedQuestions: null,
      sectionsConfig: sectionsConfig.length > 0 ? sectionsConfig : undefined,
      questions: [],
    };
    try {
      const success = await addExam(exam);
      if (success) {
        toast.success("Exam created! Now add questions.");
        router.push(`/admin/add-questions/${id}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create exam");
    }
  };

  const detailsComplete = !!(title && duration && totalMarks && startTime);
  const sectionsComplete = sectionsConfig.length > 0;
  // Settings is "complete" only once visited AND no longer the active tab
  const settingsComplete =
    visitedTabs.has("settings") && activeTab !== "settings";

  return (
    <div className="w-full min-h-screen animate-fade-in pb-16 px-4 sm:px-6">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-8 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <FilePlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-none">
              Create Exam
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure a new examination
            </p>
          </div>
        </div>
        {/* <Button
          variant="ghost"
          size="sm"
          asChild
          className="font-semibold h-9 px-4 rounded-xl shrink-0"
        >
          <Link href="/admin/dashboard">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Dashboard
          </Link>
        </Button> */}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main card ──────────────────────── */}
          <div className="lg:col-span-2 space-y-0">
            <Card className="rounded-2xl border border-border bg-card overflow-hidden">
              {/* Tab bar */}
              <div className="flex items-center gap-1.5 p-3 border-b border-border bg-muted/30">
                {TABS.map((tab) => (
                  <TabPill
                    key={tab.id}
                    tab={tab}
                    active={activeTab === tab.id}
                    onClick={() => goToTab(tab.id)}
                    complete={
                      tab.id === "details"
                        ? detailsComplete
                        : tab.id === "sections"
                          ? sectionsComplete
                          : false
                    }
                  />
                ))}
              </div>

              <div className="p-6 space-y-6">
                {/* ── Details tab ──────────────── */}
                {activeTab === "details" && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <Field label="Exam Title" htmlFor="title">
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Mid-Term Physics Assessment"
                        className="h-11"
                      />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Duration (minutes)" htmlFor="duration">
                        <IconInput
                          icon={Clock}
                          id="duration"
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          placeholder="60"
                        />
                      </Field>
                      <Field label="Total Marks" htmlFor="marks">
                        <IconInput
                          icon={BarChart2}
                          id="marks"
                          type="number"
                          value={totalMarks}
                          onChange={(e) => setTotalMarks(e.target.value)}
                          placeholder="100"
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Start Time" htmlFor="start">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Input
                            id="start"
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="pl-9 h-11"
                          />
                        </div>
                      </Field>
                      <Field
                        label="End Time"
                        htmlFor="end"
                        hint="Auto-calculated from start + duration"
                      >
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Input
                            id="end"
                            type="datetime-local"
                            value={endTime}
                            readOnly
                            className="pl-9 h-11 bg-muted/40 text-muted-foreground cursor-not-allowed"
                          />
                        </div>
                      </Field>
                    </div>

                    {/* Marking scheme */}
                    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Marking Scheme
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label="Positive Marks (per question)"
                          htmlFor="pos-marks"
                        >
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-500">
                              +
                            </span>
                            <Input
                              id="pos-marks"
                              type="number"
                              value={positiveMarks}
                              onChange={(e) => setPositiveMarks(e.target.value)}
                              placeholder="1"
                              className="pl-7 h-11 border-emerald-200 focus-visible:ring-emerald-500/30 dark:border-emerald-900"
                            />
                          </div>
                        </Field>
                        <Field
                          label="Negative Marks (e.g. 0.25)"
                          htmlFor="neg-marks"
                          hint="Enter as positive value — deducted on wrong answers"
                        >
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-red-500">
                              −
                            </span>
                            <Input
                              id="neg-marks"
                              type="number"
                              step="0.01"
                              value={negativeMarks}
                              onChange={(e) => setNegativeMarks(e.target.value)}
                              placeholder="0"
                              className="pl-7 h-11 border-red-200 focus-visible:ring-red-500/30 dark:border-red-900"
                            />
                          </div>
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Sections tab ─────────────── */}
                {activeTab === "sections" && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 flex gap-3">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          Section Control
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Define logical sections with individual question pools
                          and time limits.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {sectionsConfig.map((sec, idx) => (
                        <div
                          key={idx}
                          className="group grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1fr_88px_88px_36px] items-end gap-2 p-3 bg-muted/20 rounded-xl border border-border animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                              Section
                            </Label>
                            <Select
                              value={sec.name}
                              onValueChange={(val) => {
                                const next = [...sectionsConfig];
                                next[idx].name = val;
                                setSectionsConfig(next);
                              }}
                            >
                              <SelectTrigger className="h-9 bg-background text-sm">
                                <SelectValue placeholder="Select template…" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableSections.map((s) => (
                                  <SelectItem key={s.id} value={s.name}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                              Pick
                            </Label>
                            <Input
                              type="number"
                              value={sec.pickCount}
                              onChange={(e) => {
                                const next = [...sectionsConfig];
                                next[idx].pickCount =
                                  parseInt(e.target.value) || 0;
                                setSectionsConfig(next);
                              }}
                              className="h-9 bg-background text-center text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                              Min
                            </Label>
                            <Input
                              type="number"
                              value={sec.duration}
                              onChange={(e) => {
                                const next = [...sectionsConfig];
                                next[idx].duration =
                                  parseInt(e.target.value) || 0;
                                setSectionsConfig(next);
                              }}
                              className="h-9 bg-background text-center text-sm"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-9 w-9 mt-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            onClick={() =>
                              setSectionsConfig(
                                sectionsConfig.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          setSectionsConfig([
                            ...sectionsConfig,
                            { name: "", pickCount: 10, duration: 5 },
                          ])
                        }
                        className="w-full h-11 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Section
                      </button>
                    </div>

                    <ToggleRow
                      icon={Clock}
                      iconColor="orange"
                      label="Strict Section Timings"
                      description="Force students to wait for the timer before advancing to the next section."
                      checked={strictSectionTiming}
                      onCheckedChange={setStrictSectionTiming}
                    />
                  </div>
                )}

                {/* ── Settings tab ─────────────── */}
                {activeTab === "settings" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <ToggleRow
                      icon={ShieldCheck}
                      iconColor="emerald"
                      label="Proctoring"
                      description="Enable AI-based monitoring during the exam."
                      checked={proctoringEnabled}
                      onCheckedChange={setProctoringEnabled}
                    />

                    {proctoringEnabled && (
                      <div className="ml-4 pl-4 border-l-2 border-primary/20 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        {[
                          {
                            label: "Require Camera",
                            checked: proctoringVideo,
                            onChange: setProctoringVideo,
                          },
                          {
                            label: "Require Microphone",
                            checked: proctoringAudio,
                            onChange: setProctoringAudio,
                          },
                        ].map(({ label, checked, onChange }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20"
                          >
                            <Label className="text-sm font-medium text-muted-foreground">
                              {label}
                            </Label>
                            <Switch
                              checked={checked}
                              onCheckedChange={onChange}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <ToggleRow
                      icon={BarChart2}
                      iconColor="blue"
                      label="Show Results Immediately"
                      description="Allow students to see their score right after submission."
                      checked={showResults}
                      onCheckedChange={setShowResults}
                    />

                    <ToggleRow
                      icon={Clock}
                      iconColor="orange"
                      label="Strict Section Timings"
                      description="Force students to wait for the timer before moving sections."
                      checked={strictSectionTiming}
                      onCheckedChange={(checked) => {
                        setStrictSectionTiming(checked);
                        if (checked) setSectionalNavigation("forward-only");
                      }}
                    />

                    {!strictSectionTiming && (
                      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="mt-0.5 p-1.5 rounded-lg bg-blue-500/10 shrink-0">
                            <ChevronRight className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Section Navigation
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Control how students move between sections.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center bg-muted rounded-xl p-1 shrink-0">
                          {(["free", "forward-only"] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setSectionalNavigation(mode)}
                              className={cn(
                                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 capitalize whitespace-nowrap",
                                sectionalNavigation === mode
                                  ? "bg-background shadow-sm text-primary"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {mode === "free" ? "Free" : "Forward only"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Violation limit */}
                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5 p-1.5 rounded-lg bg-red-500/10 shrink-0">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Violation Limit
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Max violations before auto-submission.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min="1"
                          value={maxViolations}
                          onChange={(e) => setMaxViolations(e.target.value)}
                          className="w-16 h-10 px-3 rounded-xl bg-background border border-border text-center font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                        <span className="text-xs font-semibold text-muted-foreground">
                          alerts
                        </span>
                      </div>
                    </div>

                    {/* SEB */}
                    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <p className="text-sm font-semibold text-foreground">
                          Safe Exam Browser (SEB)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={sebConfigId || ""}
                          onChange={(e) =>
                            setSebConfigId(e.target.value || null)
                          }
                          className="flex-1 h-11 px-3 rounded-xl bg-muted border border-border text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer min-w-0"
                        >
                          <option value="">No SEB — Standard browser</option>
                          {configs.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <div className="relative shrink-0">
                          <input
                            type="file"
                            accept=".seb"
                            id="seb-upload"
                            className="hidden"
                            onChange={handleSebUpload}
                            disabled={uploadingSeb}
                          />
                          <Button
                            asChild
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 rounded-xl border-dashed"
                            disabled={uploadingSeb}
                          >
                            <label
                              htmlFor="seb-upload"
                              className="cursor-pointer"
                            >
                              {uploadingSeb ? (
                                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                            </label>
                          </Button>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Requires students to use the Safe Exam Browser with the
                        selected configuration.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Footer actions ─────────────── */}
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  {TABS.map((tab, i) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => goToTab(tab.id)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-200",
                        activeTab === tab.id
                          ? "bg-primary w-5"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {activeTab !== "details" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 px-4 rounded-xl font-semibold"
                      onClick={() => {
                        const idx = TABS.findIndex((t) => t.id === activeTab);
                        if (idx > 0) goToTab(TABS[idx - 1].id);
                      }}
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                      Back
                    </Button>
                  )}
                  {activeTab !== "settings" ? (
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 px-5 rounded-xl font-bold shadow-sm shadow-primary/20"
                      onClick={() => {
                        const idx = TABS.findIndex((t) => t.id === activeTab);
                        goToTab(TABS[idx + 1].id);
                      }}
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 px-6 rounded-xl font-bold shadow-md shadow-primary/25"
                    >
                      Create & Add Questions
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* ── Side panel ─────────────────────── */}
          <div className="space-y-4">
            {/* Progress checklist */}
            {/* <Card className="p-5 rounded-2xl border border-border bg-card">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Setup Progress
              </p>
              <div className="space-y-3">
                {[
                  {
                    label: "Exam details",
                    done: detailsComplete,
                    tab: "details",
                  },
                  {
                    label: "Sections configured",
                    done: sectionsComplete,
                    tab: "sections",
                  },
                  {
                    label: "Settings reviewed",
                    done: settingsComplete,
                    tab: "settings",
                  },
                ].map(({ label, done, tab }) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => goToTab(tab)}
                      className="w-full flex items-center gap-3 text-left group"
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                          isActive
                            ? "border-primary bg-primary/10"
                            : done
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-muted-foreground/30 group-hover:border-primary/50",
                        )}
                      >
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}

                        {!isActive && done && (
                          <svg
                            className="w-3 h-3 text-white"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm transition-colors",
                          isActive
                            ? "text-primary font-semibold"
                            : done
                              ? "text-muted-foreground font-medium line-through decoration-muted-foreground/40"
                              : "text-muted-foreground group-hover:text-foreground",
                        )}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card> */}

            {/* Instructions */}
            <Card className="p-5 rounded-2xl border border-border bg-card">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                How it works
              </p>
              <ol className="space-y-3">
                {[
                  "Fill in title, duration, marks, and schedule.",
                  "Optionally add sections with individual question pools.",
                  "Configure proctoring, results, and SEB in Settings.",
                  "Submit to proceed to the question pool manager.",
                ].map((text, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-xs text-muted-foreground"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-px">
                      {i + 1}
                    </span>
                    {text}
                  </li>
                ))}
              </ol>
            </Card>

            {/* AI hint */}
            <Card className="p-5 rounded-2xl border border-border bg-gradient-to-br from-primary/[0.07] to-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary/5 -translate-y-6 translate-x-6 pointer-events-none" />
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">
                  AI Question Generation
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  After creating this exam, our AI can auto-generate questions
                  based on your title and subject.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
