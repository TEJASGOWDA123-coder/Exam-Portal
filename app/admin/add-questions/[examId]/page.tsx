"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Trash2,
  Plus,
  ArrowLeft,
  Save,
  Sparkles,
  Image as ImageIcon,
  ListOrdered,
  FileText,
  Upload,
  SquarePen,
  ChevronRight,
  Zap,
  LayoutGrid,
  X,
  Settings2,
  Brain,
  FilePlus,
  Settings,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import { Question, updateExamThunk } from "@/store/slices/examSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

const indexToLetter = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ── Q-type pill ───────────────────────────────────────────────────────────────
const Q_TYPES = [
  { id: "mcq", label: "MCQ" },
  { id: "msq", label: "MSQ" },
  { id: "text", label: "Text" },
] as const;

function QTypePill({
  type,
  active,
  onClick,
}: {
  type: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150",
        active
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
      )}
    >
      {type}
    </button>
  );
}

// ── Section badge ─────────────────────────────────────────────────────────────
function SectionBadge({
  label,
  color = "default",
}: {
  label: string;
  color?: string;
}) {
  return (
    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
      {label}
    </span>
  );
}

export default function AddQuestions() {
  const params = useParams();
  const examId = params.examId as string;
  const exams = useAppSelector((state) => state.exam.exams);
  const loading = useAppSelector((state) => state.exam.loading);
  const dispatch = useAppDispatch();
  const updateExam = async (exam: any) => {
    try {
      await dispatch(updateExamThunk(exam)).unwrap();
      return true;
    } catch {
      return false;
    }
  };
  const exam = exams.find((e) => e.id === examId);
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [componentLoading, setComponentLoading] = useState(false);
  const [availableSections, setAvailableSections] = useState<any[]>([]);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const resp = await fetch("/api/sections");
      if (resp.ok) setAvailableSections(await resp.json());
    } catch (err) {
      console.error("Failed to fetch sections:", err);
    }
  };

  const [configSectionId, setConfigSectionId] = useState<string | null>(null);
  const [configData, setConfigData] = useState({
    name: "",
    identityPrompt: "",
    transformationPrompt: "",
    validationRules: "",
  });

  const openConfig = (sectionId: string) => {
    const sec = availableSections.find((s) => s.id === sectionId);
    if (!sec) return;
    let rules = sec.validationRules || "{}";
    try {
      let parsed = JSON.parse(rules);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      rules = JSON.stringify(parsed, null, 2);
    } catch {}
    setConfigSectionId(sec.id);
    setConfigData({
      name: sec.name,
      identityPrompt: sec.identityPrompt || "",
      transformationPrompt: sec.transformationPrompt || "",
      validationRules: rules,
    });
  };

  const handleSaveConfig = async () => {
    if (!configSectionId || !configData.name) return;
    setSaving(true);
    try {
      try {
        JSON.parse(configData.validationRules);
      } catch {
        toast.error("Invalid JSON in validation rules");
        return;
      }
      const resp = await fetch("/api/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: configSectionId, ...configData }),
      });
      if (resp.ok) {
        toast.success("Section updated!");
        fetchSections();
        setConfigSectionId(null);
      } else throw new Error("Update failed");
    } catch {
      toast.error("Failed to update section");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (exam && !initialized) {
      setQuestions(exam.questions || []);
      setLocalSectionsConfig(exam.sectionsConfig || []);
      setLocalTotalMarks(String(exam.totalMarks || 100));
      setInitialized(true);
    }
  }, [exam, initialized]);

  const [questionText, setQuestionText] = useState("");
  const [questionImage, setQuestionImage] = useState("");
  const [qType, setQType] = useState<"mcq" | "msq" | "text">("mcq");
  const [options, setOptions] = useState<{ text: string; image?: string }[]>([
    { text: "" },
    { text: "" },
    { text: "" },
    { text: "" },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState("0");
  const [qSection, setQSection] = useState("General");
  const [qMarks, setQMarks] = useState("1");
  const [localSectionsConfig, setLocalSectionsConfig] = useState<
    { name: string; pickCount: number; duration?: number }[]
  >([]);
  const [localTotalMarks, setLocalTotalMarks] = useState<string>("100");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [requiresJustification, setRequiresJustification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState("5");
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [aiSection, setAiSection] = useState("Smart Auto-Classify");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [pdfText, setPdfText] = useState("");
  const [pdfAnalyzing, setPdfAnalyzing] = useState(false);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleImagePick = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setter(base64);
      toast.success("Image added!");
    } catch {
      toast.error("Failed to process image");
    }
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    setAiGenerating(true);
    setComponentLoading(true);
    const toastId = toast.loading("AI generating…");
    const isAuto = aiSection === "Smart Auto-Classify";
    const section = availableSections.find((s) => s.name === aiSection);
    try {
      const response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          count: parseInt(aiCount),
          difficulty: aiDifficulty,
          sectionId: isAuto ? "AUTO" : section?.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");
      const generated = data.questions.map((q: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        type: "mcq",
        question: q.question,
        options: [
          { text: q.optionA },
          { text: q.optionB },
          { text: q.optionC },
          { text: q.optionD },
        ],
        correctAnswer: String(
          indexToLetter.indexOf(q.correctAnswer.toUpperCase()),
        ),
        section: q.section || qSection || "General",
        marks: parseInt(qMarks) || 1,
        solution: q.solution,
      }));
      setQuestions((prev) => [...prev, ...generated]);
      toast.success(`Added ${generated.length} questions`, { id: toastId });
    } catch (err: any) {
      toast.error("Generation failed", { id: toastId });
    } finally {
      setAiGenerating(false);
      setComponentLoading(false);
    }
  };

  const addOrUpdateQuestion = () => {
    if (!questionText.trim()) {
      toast.error("Question text required");
      return;
    }
    const newQ: Question = {
      id: editingId || `q-${Date.now()}`,
      type: qType,
      question: questionText.trim(),
      questionImage: questionImage || undefined,
      options: qType !== "text" ? options : undefined,
      correctAnswer,
      section: qSection,
      marks: parseInt(qMarks) || 1,
      requiresJustification,
    };
    if (
      qSection &&
      qSection !== "General" &&
      qSection !== "NEW" &&
      !localSectionsConfig.find((s) => s.name === qSection)
    ) {
      setLocalSectionsConfig((prev) => [
        ...prev,
        { name: qSection, pickCount: 5 },
      ]);
      toast.info(`Added "${qSection}" to exam architecture`);
    }
    if (editingId) {
      setQuestions((prev) => prev.map((q) => (q.id === editingId ? newQ : q)));
      setEditingId(null);
    } else setQuestions((prev) => [...prev, newQ]);
    resetForm();
    toast.success(editingId ? "Updated" : "Added to pool");
  };

  const resetForm = () => {
    setQuestionText("");
    setQuestionImage("");
    setQType("mcq");
    setOptions([{ text: "" }, { text: "" }, { text: "" }, { text: "" }]);
    setCorrectAnswer("0");
    setQSection("General");
    setQMarks("1");
    setRequiresJustification(false);
    setEditingId(null);
  };

  const editQuestion = (id: string) => {
    const q = questions.find((item) => item.id === id);
    if (!q) return;
    setEditingId(q.id);
    setQuestionText(q.question);
    setQuestionImage(q.questionImage || "");
    setQType(q.type);
    setOptions(
      q.options || [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
    );
    setCorrectAnswer(q.correctAnswer);
    setQSection(q.section || "General");
    setQMarks(String(q.marks || 1));
    setRequiresJustification(q.requiresJustification || false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfAnalyzing(true);
    setComponentLoading(true);
    const toastId = toast.loading("Analyzing PDF…");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const parseResp = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });
      if (!parseResp.ok) throw new Error("Parse failed");
      const { text } = await parseResp.json();
      setPdfText(text);
      const extractResp = await fetch("/api/ai/extract-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          count: parseInt(aiCount),
          difficulty: aiDifficulty,
          mode: "extract",
        }),
      });
      if (!extractResp.ok) throw new Error("Extraction failed");
      const { questions: extracted } = await extractResp.json();
      const newQuestions = extracted.map((q: any, index: number) => ({
        id: `pdf-${Date.now()}-${index}`,
        type: "mcq",
        question: q.question,
        options: [
          { text: q.optionA },
          { text: q.optionB },
          { text: q.optionC },
          { text: q.optionD },
        ],
        correctAnswer: String(
          indexToLetter.indexOf(q.correctAnswer.toUpperCase()),
        ),
        section: q.section || "General",
        marks: parseInt(qMarks) || 1,
        solution: q.solution,
      }));
      setQuestions((prev) => [...prev, ...newQuestions]);
      toast.success(`Extracted ${newQuestions.length} questions`, {
        id: toastId,
      });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setPdfAnalyzing(false);
      setComponentLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePdfGenerate = async (useArchitecture = false) => {
    if (!pdfText) {
      toast.error("Upload a PDF first");
      return;
    }
    setAiGenerating(true);
    setComponentLoading(true);
    const targetCount = useArchitecture
      ? localSectionsConfig.reduce((sum, s) => sum + (s.pickCount || 0), 0)
      : parseInt(aiCount);
    const toastId = toast.loading(
      useArchitecture
        ? "Filling architecture sections…"
        : "Synthesizing questions…",
    );
    try {
      const resp = await fetch("/api/ai/extract-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: pdfText,
          count: targetCount,
          difficulty: aiDifficulty,
          mode: "generate",
          blueprint: useArchitecture ? localSectionsConfig : undefined,
        }),
      });
      if (!resp.ok) throw new Error("Generation failed");
      const { questions: generatedQuestions } = await resp.json();
      const newQuestions = generatedQuestions.map((q: any, index: number) => ({
        id: `pdf-gen-${Date.now()}-${index}`,
        type: "mcq",
        question: q.question,
        options: [
          { text: q.optionA },
          { text: q.optionB },
          { text: q.optionC },
          { text: q.optionD },
        ],
        correctAnswer: String(
          indexToLetter.indexOf(q.correctAnswer.toUpperCase()),
        ),
        section: q.section || "General",
        marks: parseInt(qMarks) || 1,
        solution: q.solution,
      }));
      setQuestions((prev) => [...prev, ...newQuestions]);
      toast.success(`${newQuestions.length} questions added`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setAiGenerating(false);
      setComponentLoading(false);
    }
  };

  const handleBulkDelete = (section?: string) => {
    if (confirm(`Delete ${section ?? "all"} questions?`)) {
      setQuestions((prev) =>
        section ? prev.filter((q) => q.section !== section) : [],
      );
      toast.success("Deleted");
    }
  };

  const saveAll = async () => {
    if (!exam) {
      toast.error("Exam not found");
      return;
    }
    setSaving(true);
    const success = await updateExam({
      ...exam,
      questions,
      sectionsConfig:
        localSectionsConfig.length > 0
          ? localSectionsConfig.map((s) => ({
              name: s.name,
              pickCount: s.pickCount,
              duration: s.duration || 5,
            }))
          : undefined,
      totalMarks: parseInt(localTotalMarks) || 100,
    });
    setSaving(false);
    if (success) toast.success("Saved!");
    else toast.error("Failed to save");
  };

  const currentSections = Array.from(
    new Set([
      "General",
      ...availableSections.map((s) => s.name),
      ...(Array.isArray(exam?.sectionsConfig)
        ? exam!.sectionsConfig.map((s) => s.name)
        : []),
      ...(questions.map((q) => q.section).filter(Boolean) as string[]),
    ]),
  );

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-primary font-bold animate-pulse text-sm">
        Loading…
      </div>
    );
  if (!exam)
    return (
      <div className="p-20 text-center text-destructive font-bold">
        Exam not found
      </div>
    );

  // Group questions by section for the list
  const sectionGroups = currentSections.filter((s) =>
    questions.some((q) => q.section === s),
  );

  return (
    <>
      <div className="w-full min-h-screen animate-fade-in pb-16 px-4 sm:px-6">
        {/* ── Header ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 mb-10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <FilePlus className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-none truncate">
                {exam.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {questions.length} question{questions.length !== 1 ? "s" : ""}{" "}
                in pool
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-sm font-semibold text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40 text-xs"
              onClick={() => handleBulkDelete()}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear Pool
            </Button>
            <Button
              size="sm"
              className="h-9 px-5 rounded-sm font-bold text-xs shadow-md shadow-primary/20"
              onClick={saveAll}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1.5" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save & Exit
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left: Editor + List ───────────── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Question Editor Card */}
            <Card
              className={cn(
                "rounded-2xl border bg-card overflow-hidden transition-all duration-300",
                editingId
                  ? "border-amber-500/30 shadow-lg shadow-amber-500/5"
                  : "border-border",
              )}
            >
              {/* Card header bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center",
                      editingId
                        ? "bg-amber-500/15 text-amber-500"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {editingId ? (
                      <Zap className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {editingId ? "Editing Question" : "New Question"}
                  </span>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="ml-1 text-[10px] font-bold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 px-2 py-0.5 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {/* Q-type pills */}
                <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
                  {Q_TYPES.map((t) => (
                    <QTypePill
                      key={t.id}
                      type={t.label}
                      active={qType === t.id}
                      onClick={() => setQType(t.id as any)}
                    />
                  ))}
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Section + Marks row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Target Section
                    </Label>
                    <Select value={qSection} onValueChange={setQSection}>
                      <SelectTrigger className="h-10 rounded-xl text-sm font-medium">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentSections.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Points
                    </Label>
                    <Input
                      type="number"
                      value={qMarks}
                      onChange={(e) => setQMarks(e.target.value)}
                      min="1"
                      className="h-10 rounded-xl font-bold text-center"
                    />
                  </div>
                </div>

                {/* AI Validation toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-dashed border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        AI Validation
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Require student justification
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setRequiresJustification(!requiresJustification)
                    }
                    className={cn(
                      "w-10 h-6 rounded-full relative transition-all duration-200 border-2 shrink-0",
                      requiresJustification
                        ? "bg-primary border-primary"
                        : "bg-muted border-transparent",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-background shadow-sm transition-all duration-200",
                        requiresJustification ? "left-5" : "left-0.5",
                      )}
                    />
                  </button>
                </div>

                {/* Question textarea */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Question Statement
                  </Label>
                  <div className="relative border border-input rounded-xl overflow-hidden bg-muted/10 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all">
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Type your question here…"
                      className="w-full min-h-[110px] p-4 bg-transparent outline-none resize-none text-sm font-medium leading-relaxed placeholder:text-muted-foreground/40"
                    />
                    <div className="absolute right-3 bottom-3 flex gap-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        id="q-img"
                        className="hidden"
                        onChange={(e) => handleImagePick(e, setQuestionImage)}
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-lg border border-border hover:bg-background"
                        onClick={() =>
                          document.getElementById("q-img")?.click()
                        }
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      {questionImage && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => setQuestionImage("")}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {questionImage && (
                    <div className="mt-2 border border-border rounded-xl overflow-hidden inline-block">
                      <img
                        src={questionImage}
                        alt="Question"
                        className="max-h-40 object-contain bg-muted/30"
                      />
                    </div>
                  )}
                </div>

                {/* Options editor */}
                {qType !== "text" && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Answer Options
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs font-bold text-primary hover:bg-primary/10 px-2.5 rounded-lg"
                        onClick={() => setOptions([...options, { text: "" }])}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {options.map((opt, idx) => {
                        const isCorrect = correctAnswer
                          .split(",")
                          .includes(String(idx));
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "flex gap-3 items-start p-3 rounded-xl border transition-all duration-150 group",
                              isCorrect
                                ? "bg-primary/5 border-primary/25 shadow-sm"
                                : "bg-card border-border hover:border-border/80",
                            )}
                          >
                            <button
                              onClick={() => {
                                if (qType === "msq") {
                                  let current = correctAnswer
                                    .split(",")
                                    .filter(Boolean);
                                  current = current.includes(String(idx))
                                    ? current.filter((v) => v !== String(idx))
                                    : [...current, String(idx)];
                                  setCorrectAnswer(current.sort().join(","));
                                } else setCorrectAnswer(String(idx));
                              }}
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-150",
                                isCorrect
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-muted text-muted-foreground hover:bg-muted/70",
                              )}
                            >
                              {indexToLetter[idx]}
                            </button>
                            <div className="flex-1 min-w-0">
                              <input
                                value={opt.text}
                                onChange={(e) => {
                                  const next = [...options];
                                  next[idx].text = e.target.value;
                                  setOptions(next);
                                }}
                                placeholder={`Option ${indexToLetter[idx]}…`}
                                className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 outline-none placeholder:text-muted-foreground/40 h-8"
                              />
                              {opt.image && (
                                <img
                                  src={opt.image}
                                  alt="Opt"
                                  className="h-16 rounded-lg border border-border bg-muted/30 object-contain mt-1"
                                />
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <input
                                type="file"
                                accept="image/*"
                                id={`opt-img-${idx}`}
                                className="hidden"
                                onChange={(e) =>
                                  handleImagePick(e, (url) => {
                                    const next = [...options];
                                    next[idx].image = url;
                                    setOptions(next);
                                  })
                                }
                              />
                              <button
                                onClick={() =>
                                  document
                                    .getElementById(`opt-img-${idx}`)
                                    ?.click()
                                }
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setOptions(
                                    options.filter((_, i) => i !== idx),
                                  )
                                }
                                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Text answer */}
                {qType === "text" && (
                  <div className="space-y-1.5 pt-4 border-t border-border">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Expected Answer
                    </Label>
                    <Input
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      placeholder="Type the exact expected answer…"
                      className="h-11 rounded-xl font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                )}

                {/* Submit row */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    className="flex-1 h-10 rounded-xl font-bold text-sm shadow-sm shadow-primary/20"
                    onClick={addOrUpdateQuestion}
                  >
                    {editingId ? "Update Question" : "Add to Pool"}
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* ── Questions List ────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-primary" />
                  Question Pool
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {questions.length}
                  </span>
                </h3>
              </div>

              {questions.length === 0 ? (
                <div className="p-14 text-center border-2 border-dashed border-border rounded-2xl bg-muted/10">
                  <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="font-bold text-muted-foreground text-sm">
                    No questions yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Use the editor above or AI generator to add questions.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <div
                      key={q.id}
                      className="group flex gap-3 p-4 bg-card border border-border rounded-xl
                                 hover:border-border/80 hover:shadow-sm hover:-translate-y-px
                                 transition-all duration-150 relative"
                    >
                      {/* Number */}
                      <span className="w-7 h-7 rounded-lg bg-muted text-muted-foreground font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                            {q.type}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                            {q.section}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                            {q.marks} pts
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground leading-relaxed line-clamp-2">
                          {q.question}
                        </p>
                        {q.questionImage && (
                          <img
                            src={q.questionImage}
                            alt="Q"
                            className="h-16 rounded-lg border border-border object-contain bg-muted/20 mt-2"
                          />
                        )}
                      </div>

                      {/* Hover actions */}
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 rounded-lg border border-border"
                          onClick={() => editQuestion(q.id)}
                        >
                          <SquarePen className="w-3.5 h-3.5 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm("Delete this question?")) {
                              setQuestions((prev) =>
                                prev.filter((x) => x.id !== q.id),
                              );
                              toast.success("Deleted");
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar Tools ──────────── */}
          <div className="lg:col-span-4 space-y-4">
            {/* AI Generator */}
            <Card className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm shadow-primary/20">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-foreground">
                  AI Generator
                </span>
              </div>
              <div className="p-5 space-y-3">
                <Input
                  placeholder="Topic (e.g. Thermodynamics)…"
                  className="h-10 rounded-xl text-sm"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Target Context
                  </Label>
                  <Select value={aiSection} onValueChange={setAiSection}>
                    <SelectTrigger className="h-10 rounded-xl text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Smart Auto-Classify">
                        Smart Auto-Classify
                      </SelectItem>
                      {currentSections.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={aiCount} onValueChange={setAiCount}>
                    <SelectTrigger className="h-9 rounded-xl text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Qs</SelectItem>
                      <SelectItem value="10">10 Qs</SelectItem>
                      <SelectItem value="20">20 Qs</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={aiDifficulty} onValueChange={setAiDifficulty}>
                    <SelectTrigger className="h-9 rounded-xl text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full h-9 rounded-xl font-bold text-xs shadow-sm shadow-primary/20"
                  onClick={handleAiGenerate}
                  disabled={aiGenerating}
                >
                  {aiGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1.5" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* PDF Extraction */}
            <Card className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-foreground">
                  PDF Extraction
                </span>
                {pdfText && (
                  <span className="ml-auto text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Loaded
                  </span>
                )}
              </div>
              <div className="p-5 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Upload a question paper PDF to extract questions
                  automatically.
                </p>
                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handlePdfUpload}
                    disabled={pdfAnalyzing}
                    ref={fileInputRef}
                  />
                  <div className="border-2 border-dashed border-border rounded-xl p-5 text-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-150">
                    {pdfAnalyzing ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <span className="text-xs font-bold text-primary">
                          Analyzing…
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5 group-hover:text-primary transition-colors" />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                          {pdfText
                            ? "PDF ready — click to replace"
                            : "Click to upload PDF"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {pdfText && (
                  <div className="space-y-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 rounded-xl text-xs font-bold justify-start border-primary/20 text-primary hover:bg-primary/5"
                      onClick={() => handlePdfGenerate(true)}
                      disabled={
                        aiGenerating || localSectionsConfig.length === 0
                      }
                    >
                      <LayoutGrid className="w-3.5 h-3.5 mr-2" />
                      Smart Fill Architecture
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-9 rounded-xl text-xs font-bold justify-start text-muted-foreground hover:text-foreground"
                      onClick={() => handlePdfGenerate(false)}
                      disabled={aiGenerating}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-2" />
                      Generate Mixed Questions
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Exam Config */}
            <Card className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                  <Settings2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-foreground">
                  Exam Config
                </span>
              </div>
              <div className="p-5 space-y-4">
                {/* Stat rows */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Duration
                    </p>
                    <p className="font-bold text-sm">
                      {exam.duration}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        min
                      </span>
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Total Marks
                    </p>
                    <Input
                      type="number"
                      value={localTotalMarks}
                      onChange={(e) => setLocalTotalMarks(e.target.value)}
                      className="h-7 text-center font-bold text-sm bg-background border-border px-1 rounded-lg"
                    />
                  </div>
                </div>

                {/* Section Architecture */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Sections
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] font-bold text-primary hover:bg-primary/10 px-2 rounded-lg"
                        >
                          <Plus className="w-3 h-3 mr-0.5" /> Add
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {availableSections.map((s) => (
                          <DropdownMenuItem
                            key={s.id}
                            disabled={
                              !!localSectionsConfig.find(
                                (ls) => ls.name === s.name,
                              )
                            }
                            onClick={() =>
                              setLocalSectionsConfig([
                                ...localSectionsConfig,
                                { name: s.name, pickCount: 5, duration: 15 },
                              ])
                            }
                          >
                            <LayoutGrid className="w-3.5 h-3.5 mr-2 text-primary" />
                            {s.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {localSectionsConfig.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic p-3 border border-dashed border-border rounded-xl text-center">
                      No sections defined — all questions shown randomly.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {localSectionsConfig.map((config, idx) => (
                        <div
                          key={idx}
                          className="group flex items-center gap-2 p-2.5 rounded-xl bg-muted/20 border border-border hover:border-border/80 transition-colors"
                        >
                          <span className="flex-1 text-xs font-bold truncate min-w-0">
                            {config.name}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {availableSections.find(
                              (s) => s.name === config.name,
                            ) && (
                              <button
                                onClick={() =>
                                  openConfig(
                                    availableSections.find(
                                      (s) => s.name === config.name,
                                    )!.id,
                                  )
                                }
                                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                title="Configure section"
                              >
                                <Settings className="w-3 h-3" />
                              </button>
                            )}
                            <div className="flex items-center bg-background border border-border rounded-lg px-1.5 gap-0.5">
                              <span className="text-[9px] font-bold text-muted-foreground">
                                MIN
                              </span>
                              <input
                                type="number"
                                value={config.duration || 0}
                                onChange={(e) => {
                                  const next = [...localSectionsConfig];
                                  next[idx].duration =
                                    parseInt(e.target.value) || 0;
                                  setLocalSectionsConfig(next);
                                }}
                                className="w-7 h-5 bg-transparent text-[11px] font-bold text-center focus:outline-none"
                              />
                            </div>
                            <div className="flex items-center bg-primary/5 border border-primary/20 rounded-lg px-1.5 gap-0.5">
                              <span className="text-[9px] font-bold text-primary">
                                PICK
                              </span>
                              <input
                                type="number"
                                value={config.pickCount}
                                onChange={(e) => {
                                  const next = [...localSectionsConfig];
                                  next[idx].pickCount =
                                    parseInt(e.target.value) || 0;
                                  setLocalSectionsConfig(next);
                                }}
                                className="w-7 h-5 bg-transparent text-[11px] font-bold text-center text-primary focus:outline-none"
                              />
                            </div>
                            <button
                              onClick={() =>
                                setLocalSectionsConfig(
                                  localSectionsConfig.filter(
                                    (_, i) => i !== idx,
                                  ),
                                )
                              }
                              className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Section Config Dialog ─────────────── */}
      <Dialog
        open={configSectionId !== null}
        onOpenChange={(open) => !open && setConfigSectionId(null)}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Configure: {configData.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[
              {
                key: "identityPrompt",
                label: "Identity Prompt",
                placeholder: "Who is the AI for this section?",
              },
              {
                key: "transformationPrompt",
                label: "Transformation Prompt",
                placeholder: "How should the AI process student responses?",
              },
              {
                key: "validationRules",
                label: "Validation Rules (JSON)",
                placeholder: '{ "key": "value" }',
                mono: true,
              },
            ].map(({ key, label, placeholder, mono }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {label}
                </Label>
                <Textarea
                  className={cn(
                    "min-h-[100px] text-sm rounded-xl resize-none",
                    mono && "font-mono text-xs",
                  )}
                  value={(configData as any)[key]}
                  onChange={(e) =>
                    setConfigData({ ...configData, [key]: e.target.value })
                  }
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => setConfigSectionId(null)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl font-bold"
              onClick={handleSaveConfig}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
