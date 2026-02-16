"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Trash2,
  Plus,
  ArrowLeft,
  Save,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  ListOrdered,
  FileText,
  Upload,
  SquarePen,
  ChevronRight,
  Zap,
  LayoutGrid,
  X,
  Settings2,
  Workflow,
  MessageSquare,
  ShieldCheck,
  Brain,
  ChevronDown,
  FilePlus,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { Question, useExam } from "@/hooks/contexts/ExamContext";
import Link from "next/link";
import { cn } from "@/lib/utils";

const indexToLetter = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function AddQuestions() {
  const params = useParams();
  const examId = params.examId as string;
  const { exams, updateExam, loading } = useExam();
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
      if (resp.ok) {
        const data = await resp.json();
        setAvailableSections(data);
      }
    } catch (err) {
      console.error("Failed to fetch sections:", err);
    }
  };
  const [configSectionId, setConfigSectionId] = useState<string | null>(null);
  const [configData, setConfigData] = useState({
    name: "",
    identityPrompt: "",
    transformationPrompt: "",
    validationRules: ""
  });

  const openConfig = (sectionId: string) => {
    const sec = availableSections.find(s => s.id === sectionId);
    if (sec) {
      let rules = sec.validationRules || "{}";
      try {
        let parsed = JSON.parse(rules);
        if (typeof parsed === "string") parsed = JSON.parse(parsed);
        rules = JSON.stringify(parsed, null, 2);
      } catch (e) {
        console.warn("Could not parse validation rules as JSON", e);
      }

      setConfigSectionId(sec.id);
      setConfigData({
        name: sec.name,
        identityPrompt: sec.identityPrompt,
        transformationPrompt: sec.transformationPrompt,
        validationRules: rules
      });
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
    { text: "" }, { text: "" }, { text: "" }, { text: "" }
  ]);
  const [correctAnswer, setCorrectAnswer] = useState("0");
  const [qSection, setQSection] = useState("General");
  const [qMarks, setQMarks] = useState("1");
  const [localSectionsConfig, setLocalSectionsConfig] = useState<{ name: string; pickCount: number }[]>([]);
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setter(base64);
      toast.success("Image added!");
    } catch (err) {
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
    const toastId = toast.loading("AI generating...");
    const isAuto = aiSection === "Smart Auto-Classify";
    const section = availableSections.find(s => s.name === aiSection);

    try {
      const response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          count: parseInt(aiCount),
          difficulty: aiDifficulty,
          sectionId: isAuto ? "AUTO" : section?.id
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");

      const generated = data.questions.map((q: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        type: "mcq",
        question: q.question,
        options: [
          { text: q.optionA }, { text: q.optionB }, { text: q.optionC }, { text: q.optionD },
        ],
        correctAnswer: String(indexToLetter.indexOf(q.correctAnswer.toUpperCase())),
        section: q.section || qSection || "General",
        marks: parseInt(qMarks) || 1,
        solution: q.solution
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
      id: editingId || `q-${String(Date.now())}`,
      type: qType,
      question: questionText.trim(),
      questionImage: questionImage || undefined,
      options: qType !== "text" ? options : undefined,
      correctAnswer: correctAnswer,
      section: qSection,
      marks: parseInt(qMarks) || 1,
      requiresJustification: requiresJustification,
    };
    if (editingId) {
      setQuestions((prev) => prev.map((q) => (q.id === editingId ? newQ : q)));
      setEditingId(null);
    } else {
      setQuestions((prev) => [...prev, newQ]);
    }
    resetForm();
    toast.success(editingId ? "Updated" : "Added");
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
    setOptions(q.options || [{ text: "" }, { text: "" }, { text: "" }, { text: "" }]);
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
    const toastId = toast.loading("Analyzing PDF structure...");
    setComponentLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const parseResp = await fetch("/api/parse-pdf", { method: "POST", body: formData });
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
          mode: "extract"
        }),
      });
      if (!extractResp.ok) throw new Error("Extraction failed");
      const { questions: extracted } = await extractResp.json();
      const newQuestions = extracted.map((q: any, index: number) => ({
        id: `pdf-${Date.now()}-${index}`,
        type: "mcq",
        question: q.question,
        options: [{ text: q.optionA }, { text: q.optionB }, { text: q.optionC }, { text: q.optionD }],
        correctAnswer: String(indexToLetter.indexOf(q.correctAnswer.toUpperCase())),
        section: q.section || "General",
        marks: parseInt(qMarks) || 1,
        solution: q.solution
      }));
      setQuestions((prev) => [...prev, ...newQuestions]);
      toast.success(`Extracted ${newQuestions.length} questions`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setPdfAnalyzing(false);
      setComponentLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePdfGenerate = async (useArchitecture: boolean = false) => {
    if (!pdfText) {
      toast.error("Please upload a PDF first");
      return;
    }
    setAiGenerating(true);
    setComponentLoading(true);
    const targetCount = useArchitecture
      ? localSectionsConfig.reduce((sum, s) => sum + (s.pickCount || 0), 0)
      : parseInt(aiCount);

    const toastId = toast.loading(useArchitecture ? "Filling all architecture sections..." : "Synthesizing extra questions from PDF...");
    try {
      const resp = await fetch("/api/ai/extract-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: pdfText,
          count: targetCount,
          difficulty: aiDifficulty,
          mode: "generate",
          blueprint: useArchitecture ? localSectionsConfig : undefined
        }),
      });
      if (!resp.ok) throw new Error("Generation failed");
      const { questions: generatedQuestions } = await resp.json();
      const newQuestions = generatedQuestions.map((q: any, index: number) => ({
        id: `pdf-gen-${Date.now()}-${index}`,
        type: "mcq",
        question: q.question,
        options: [{ text: q.optionA }, { text: q.optionB }, { text: q.optionC }, { text: q.optionD }],
        correctAnswer: String(indexToLetter.indexOf(q.correctAnswer.toUpperCase())),
        section: q.section || "General",
        marks: parseInt(qMarks) || 1,
        solution: q.solution
      }));
      setQuestions((prev) => [...prev, ...newQuestions]);
      toast.success(useArchitecture ? `Architecture filled with ${newQuestions.length} questions` : `Generated ${newQuestions.length} unique questions`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setAiGenerating(false);
      setComponentLoading(false);
    }
  };

  const handleBulkDelete = (section?: string) => {
    if (confirm(`Delete ${section ? section : "all"}?`)) {
      setQuestions(prev => section ? prev.filter(q => q.section !== section) : []);
      toast.success("Deleted");
    }
  };

  const saveAll = async () => {
    if (!exam) {
      toast.error("Exam data not found");
      return;
    }
    setSaving(true);
    const success = await updateExam({
      ...exam,
      questions,
      sectionsConfig: localSectionsConfig.length > 0 ? localSectionsConfig : undefined,
      totalMarks: parseInt(localTotalMarks) || 100
    });
    setSaving(false);
    if (success) toast.success("Saved!");
    else toast.error("Failed");
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-primary animate-pulse">Loading...</div>;
  if (!exam) return <div className="p-20 text-center text-destructive font-bold">Exam not found</div>;

  const currentSections = Array.from(new Set([
    "General",
    ...availableSections.map(s => s.name),
    ...(Array.isArray(exam.sectionsConfig) ? exam.sectionsConfig.map(s => s.name) : []),
    ...questions.map(q => q.section).filter(Boolean) as string[]
  ]));

  return (
    <div className="w-full animate-fade-in pb-10 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold">
            <FilePlus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-title">{exam.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">{questions.length} Questions in Pool</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-bold text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => handleBulkDelete()}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Pool
          </Button>
          <Link href="/admin/dashboard">
            <Button className="font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20" onClick={saveAll} disabled={saving}>
              {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save & Exit</>}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 rounded-2xl shadow-card border border-border bg-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", editingId ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30" : "bg-primary/10 text-primary")}>
                  {editingId ? <Zap className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {editingId ? "Edit Question" : "New Question"}
                </h2>
              </div>
              <Tabs value={qType} onValueChange={(v: any) => setQType(v)} className="bg-muted p-1 rounded-xl">
                <TabsList className="bg-transparent h-9 p-0 gap-1">
                  {["mcq", "msq", "text"].map(t => (
                    <TabsTrigger key={t} value={t} className="rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Target Section</Label>
                  <div className="relative">
                    <select
                      value={qSection}
                      onChange={(e) => setQSection(e.target.value)}
                      className="w-full h-11 bg-background border border-input rounded-xl px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                    >
                      {currentSections.map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="NEW">+ New Section</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Points</Label>
                  <Input type="number" value={qMarks} onChange={(e) => setQMarks(e.target.value)} min="1" className="h-11 font-bold" />
                </div>
              </div>

              {/* AI Validation Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">AI Validation</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Require Student Justification</span>
                  </div>
                </div>
                <button
                  onClick={() => setRequiresJustification(!requiresJustification)}
                  className={cn("w-10 h-6 rounded-full relative transition-all border-2", requiresJustification ? "bg-primary border-primary" : "bg-muted border-transparent")}
                >
                  <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-background shadow-sm transition-all", requiresJustification ? "left-5" : "left-0.5")} />
                </button>
              </div>

              {qSection === "NEW" && (
                <Input
                  placeholder="Enter new section name..."
                  className="h-11 border-primary/30 bg-primary/5 text-primary font-bold placeholder:text-primary/40"
                  autoFocus
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const name = (e.currentTarget as HTMLInputElement).value.trim();
                      if (!name) return;
                      setComponentLoading(true);
                      // Simulated section creation for UI responsiveness
                      setAvailableSections(prev => [...prev, { name, id: `sec-${Date.now()}` }]);
                      setQSection(name);
                      toast.success(`Created section: ${name}`);
                      setComponentLoading(false);
                    }
                  }}
                  onBlur={(e) => {
                    if (!e.target.value.trim()) setQSection("General");
                  }}
                />
              )}

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Question Statement</Label>
                <div className="relative border border-input rounded-2xl overflow-hidden bg-muted/20 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Type your question here..."
                    className="w-full min-h-[120px] p-4 bg-transparent outline-none resize-none text-base font-medium leading-relaxed placeholder:text-muted-foreground/50"
                  />
                  <div className="absolute right-3 bottom-3 flex gap-2">
                    <input type="file" accept="image/*" id="q-img" className="hidden" onChange={(e) => handleImagePick(e, setQuestionImage)} />
                    <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl shadow-sm border border-border hover:bg-background" onClick={() => document.getElementById('q-img')?.click()}>
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    {questionImage && (
                      <Button variant="destructive" size="icon" className="h-9 w-9 rounded-xl shadow-sm" onClick={() => setQuestionImage("")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {questionImage && (
                  <div className="mt-4 border border-border rounded-2xl overflow-hidden inline-block shadow-sm">
                    <img src={questionImage} alt="Question" className="max-h-48 object-contain bg-muted/50" />
                  </div>
                )}
              </div>

              {/* Options Editor */}
              {qType !== "text" && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between user-select-none">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Answer Options</Label>
                    <Button variant="ghost" size="sm" className="h-8 text-primary fontsize-xs font-bold hover:bg-primary/10" onClick={() => setOptions([...options, { text: "" }])}>
                      <Plus className="w-3 h-3 mr-1" /> Add Option
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {options.map((opt, idx) => {
                      const isCorrect = correctAnswer.split(",").includes(String(idx));
                      return (
                        <div key={idx} className={cn("p-3 border rounded-xl transition-all flex gap-3 items-start group", isCorrect ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:border-primary/30")}>
                          <button
                            onClick={() => {
                              if (qType === 'msq') {
                                let current = correctAnswer.split(",").filter(Boolean);
                                if (current.includes(String(idx))) current = current.filter(v => v !== String(idx));
                                else current.push(String(idx));
                                setCorrectAnswer(current.sort().join(","));
                              } else setCorrectAnswer(String(idx));
                            }}
                            className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors mt-0.5", isCorrect ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80")}
                          >
                            {indexToLetter[idx]}
                          </button>

                          <div className="flex-1 space-y-2">
                            <input
                              value={opt.text}
                              onChange={(e) => {
                                const next = [...options];
                                next[idx].text = e.target.value;
                                setOptions(next);
                              }}
                              placeholder={`Option ${indexToLetter[idx]} text...`}
                              className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 outline-none placeholder:text-muted-foreground/40 h-9"
                            />
                            {opt.image && <img src={opt.image} alt="Opt" className="h-20 rounded-lg border border-border bg-muted/30 object-contain" />}
                          </div>

                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <input type="file" accept="image/*" id={`opt-img-${idx}`} className="hidden" onChange={(e) => handleImagePick(e, (url) => {
                              const next = [...options]; next[idx].image = url; setOptions(next);
                            })} />
                            <button onClick={() => document.getElementById(`opt-img-${idx}`)?.click()} className={cn("p-1.5 rounded-md hover:bg-muted transition-colors", opt.image ? "text-primary" : "text-muted-foreground")}>
                              <ImageIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setOptions(options.filter((_, i) => i !== idx))} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {qType === "text" && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Exact Match Answer</Label>
                  <Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="Type the exact expected answer..." className="h-11 font-bold text-emerald-600" />
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-border mt-6">
                {editingId && (
                  <Button variant="ghost" className="h-11 px-6 font-bold" onClick={resetForm}>Cancel Edit</Button>
                )}
                <Button className="flex-1 h-11 font-bold text-base shadow-lg shadow-primary/20" onClick={addOrUpdateQuestion}>
                  {editingId ? "Update Question" : "Add to Exam"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-primary" />
                Added Questions ({questions.length})
              </h3>
            </div>
            {questions.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl bg-muted/20">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h4 className="font-bold text-muted-foreground">No questions added yet</h4>
                <p className="text-sm text-muted-foreground/60 mt-1">Use the editor above or AI generator to add questions.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {questions.map((q, i) => (
                  <div key={q.id} className="group p-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all relative">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg" onClick={() => editQuestion(q.id)}>
                        <SquarePen className="w-4 h-4 text-primary" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
                        if (confirm("Delete this question?")) {
                          setQuestions(prev => prev.filter(x => x.id !== q.id));
                          toast.success("Deleted");
                        }
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted text-muted-foreground font-bold flex items-center justify-center text-sm">
                        {i + 1}
                      </span>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">{q.type}</span>
                          <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{q.section}</span>
                          <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{q.marks} Pts</span>
                        </div>
                        <p className="font-bold text-foreground leading-relaxed pr-8">{q.question}</p>
                        {q.questionImage && <img src={q.questionImage} alt="Q" className="h-24 rounded-lg border border-border object-contain bg-slate-50" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Tools */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Generator Card */}
          <Card className="p-6 rounded-2xl shadow-card border border-border bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="w-24 h-24 text-primary" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">AI Generator</h3>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Instant question generation based on your exam topic.
              </p>

              <div className="space-y-3">
                <Input
                  placeholder="Topic (e.g. Thermodynamics)..."
                  className="bg-background/80 backdrop-blur-sm border-primary/20 h-11 font-medium"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Target Context</Label>
                  <div className="relative">
                    <select
                      value={aiSection}
                      onChange={(e) => setAiSection(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background/80 px-3 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Smart Auto-Classify">Smart Auto-Classify</option>
                      {currentSections.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none opacity-50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(e.target.value)}
                    className="h-10 rounded-xl border border-input bg-background/80 px-3 text-xs font-bold"
                  >
                    <option value="5">5 Qs</option>
                    <option value="10">10 Qs</option>
                    <option value="20">20 Qs</option>
                  </select>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="h-10 rounded-xl border border-input bg-background/80 px-3 text-xs font-bold"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <Button className="w-full font-bold shadow-lg shadow-primary/10" onClick={handleAiGenerate} disabled={aiGenerating}>
                  {aiGenerating ? <Sparkles className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate Content
                </Button>
              </div>
            </div>
          </Card>

          {/* PDF Upload Card */}
          <Card className="p-6 rounded-2xl shadow-card border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/20">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">PDF Extraction</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4 font-medium">
              Upload a question paper or material PDF to extract questions automatically.
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
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                {pdfAnalyzing ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
                    <span className="text-xs font-bold text-primary">Analyzing PDF...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">
                      {pdfText ? "PDF Analyzed. Upload new to replace." : "Click to Upload PDF"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {pdfText && (
              <div className="space-y-3 pt-4 border-t border-border mt-4">
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold justify-start border-primary/20 text-primary hover:bg-primary/5"
                  onClick={() => handlePdfGenerate(true)}
                  disabled={aiGenerating || localSectionsConfig.length === 0}
                >
                  <LayoutGrid className="w-3.5 h-3.5 mr-2" />
                  Smart Fill Architecture
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-xs font-bold justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => handlePdfGenerate(false)}
                  disabled={aiGenerating}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Generate Extra Mixed Qs
                </Button>
              </div>
            )}
          </Card>

          {/* Exam Settings Summary */}
          <Card className="p-6 rounded-2xl shadow-card border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800">
                <Settings2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Exam Config</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-xs font-bold text-muted-foreground uppercase">Duration</span>
                <span className="font-bold text-sm">{exam.duration} Min</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-xs font-bold text-muted-foreground uppercase">Total Marks</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localTotalMarks}
                    onChange={(e) => setLocalTotalMarks(e.target.value)}
                    className="h-7 w-16 text-center font-bold text-xs bg-background"
                  />
                </div>
              </div>
              <div className="pt-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Sections ({localSectionsConfig.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {currentSections.map(s => (
                    <span key={s} className="px-2 py-1 rounded-md bg-muted text-[10px] font-bold uppercase">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
