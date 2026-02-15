"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loading from "@/components/Loading"
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
  ChevronDown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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

  const [questions, setQuestions] = useState<Question[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [componentLoading,setComponentLoading] = useState(false);
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
        // Handle double-stringification if it exists
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

  const handleUpdateSection = async () => {
    const toastId = toast.loading("Updating intelligence...");
    try {
      const resp = await fetch("/api/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: configSectionId,
          ...configData
        }),
      });
      if (resp.ok) {
        toast.success("Intelligence updated", { id: toastId });
        fetchSections();
        setConfigSectionId(null);
      }
    } catch (err) {
      toast.error("Update failed", { id: toastId });
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
  const [uploading, setUploading] = useState(false);
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

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-emerald-600 animate-pulse">Loading...</div>;
  if (!exam) return <div className="p-20 text-center text-destructive font-black">Exam not found</div>;

  const currentSections = Array.from(new Set([
    "General", 
    ...availableSections.map(s => s.name),
    ...(Array.isArray(exam.sectionsConfig) ? exam.sectionsConfig.map(s => s.name) : []),
    ...questions.map(q => q.section).filter(Boolean) as string[]
  ]));

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans ">
      <header className="sticky top-0 z-50 w-full border-b bg-white/70 backdrop-blur-md dark:bg-slate-950/70 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors border shadow-sm">
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[300px] leading-tight">{exam.title}</h1>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider tabular-nums">
                {questions.length} Questions Pool
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 px-3 text-red-500 hover:bg-red-50 border-red-100 dark:border-red-900/30" onClick={() => handleBulkDelete()}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Clear Pool
            </Button>
            <Button size="sm" className="h-9 px-6 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg" onClick={saveAll} disabled={saving}>
              {saving ? "Saving..." : <><Save className="w-3.5 h-3.5 mr-2" /> Submit</>}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-7 space-y-6">
             {/* Unified Section & Marks Control */}
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-xl shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-emerald-600" /> Exam Architecture
                  </h3>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Total Marks</Label>
                    <Input 
                      type="number" 
                      value={localTotalMarks} 
                      onChange={(e) => setLocalTotalMarks(e.target.value)}
                      className="h-8 w-16 text-center text-xs font-bold bg-slate-50 border-emerald-100"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section Control</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-emerald-600 text-[10px] font-bold"
                        onClick={() => setLocalSectionsConfig([...localSectionsConfig, { name: "", pickCount: 5 }])}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Section
                      </Button>
                   </div>

                   <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {localSectionsConfig.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic text-center py-4 border-2 border-dashed rounded-lg">No automated section rules defined.</p>
                      ) : localSectionsConfig.map((sec, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          <div className="flex-1 flex items-center gap-1">
                            <select 
                              value={sec.name}
                              onChange={(e) => {
                                const next = [...localSectionsConfig];
                                next[idx].name = e.target.value;
                                setLocalSectionsConfig(next);
                              }}
                              className="h-8 flex-1 bg-white text-[10px] font-bold rounded-lg border px-2 outline-none"
                            >
                              <option value="">Select Section</option>
                              {currentSections.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {sec.name && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  const found = availableSections.find(s => s.name === sec.name);
                                  if (found) openConfig(found.id);
                                }}
                                className="h-8 w-8 text-slate-400 hover:text-emerald-500"
                              >
                                <Settings2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-1 bg-white border rounded-lg px-2 h-8 w-fit">
                            <Label className="text-[8px] font-black text-slate-400 uppercase">Qty</Label>
                            <Input 
                              type="number"
                              value={sec.pickCount}
                              onChange={(e) => {
                                const next = [...localSectionsConfig];
                                next[idx].pickCount = parseInt(e.target.value) || 0;
                                setLocalSectionsConfig(next);
                              }}
                              className=" border-none text-center text-[10px] font-bold h-7 focus-visible:ring-0"
                            />
                          </div>
                          <button 
                            onClick={() => setLocalSectionsConfig(localSectionsConfig.filter((_, i) => i !== idx))}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden transition-all">
              <div className="border-b p-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", editingId ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600")}>
                    {editingId ? <Zap className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    {editingId ? "Edit Question" : "New Question"}
                  </h2>
                </div>
                <Tabs value={qType} onValueChange={(v: any) => setQType(v)} className="bg-slate-200/50 p-1 rounded-lg dark:bg-slate-800">
                  <TabsList className="bg-transparent h-7 p-0 space-x-1">
                    {["mcq", "msq", "text"].map(t => (
                      <TabsTrigger key={t} value={t} className="rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-slate-700">
                        {t}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Target Section</Label>
                    <select value={qSection} onChange={(e) => setQSection(e.target.value)} className="w-full h-10 bg-white border rounded-lg px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/10 dark:bg-slate-800 dark:border-slate-700">
                      {currentSections.map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="NEW">+ New Section</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Points</Label>
                    <Input type="number" value={qMarks} onChange={(e) => setQMarks(e.target.value)} min="1" className="h-10 text-sm font-bold bg-white dark:bg-slate-800" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-500/5">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                         <Sparkles className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">AI Validation</span>
                         <span className="text-[9px] font-bold text-emerald-600/60 leading-none">Require Student Justification</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400">{requiresJustification ? "ENABLED" : "DISABLED"}</span>
                      <button 
                        onClick={() => setRequiresJustification(!requiresJustification)}
                        className={cn("w-10 h-5 rounded-full relative transition-all", requiresJustification ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700")}
                      >
                        <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all", requiresJustification ? "left-5.5" : "left-0.5")} />
                      </button>
                   </div>
                </div>

                {qSection === "NEW" && (
                  <Input 
                    placeholder="Section name..." 
                    className="h-10 border-emerald-200 bg-emerald-50/30 text-emerald-600 font-bold" 
                    autoFocus 
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const name = (e.currentTarget as HTMLInputElement).value.trim();
                        if (!name) return;
                        
                        setComponentLoading(true);
                        try {
                          const resp = await fetch("/api/sections", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              name,
                              identityPrompt: `You are an expert in ${name}.`,
                              transformationPrompt: `Focus on ${name} concepts.`,
                              description: `Custom section for ${name}`
                            })
                          });
                          if (resp.ok) {
                            const newSec = await resp.json();
                            setAvailableSections(prev => [...prev, newSec]);
                            setQSection(name);
                            toast.success(`Created section: ${name}`);
                          }
                        } catch (err) {
                          toast.error("Failed to create section");
                        } finally {
                          setComponentLoading(false);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      if (!e.target.value.trim()) setQSection("General");
                    }} 
                  />
                )}

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Question Content</Label>
                  <div className="relative border rounded-xl overflow-hidden bg-slate-50/30 dark:bg-slate-800/20 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                    <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Type question statement..." className="w-full min-h-[120px] p-4 bg-transparent outline-none resize-none text-base font-medium leading-relaxed" />
                    <div className="absolute right-3 bottom-3 flex gap-2">
                      <input type="file" accept="image/*" id="q-img" className="hidden" onChange={(e) => handleImagePick(e, setQuestionImage)} />
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-white shadow-sm border" onClick={() => document.getElementById('q-img')?.click()}>
                        <ImageIcon className="w-4 h-4 text-slate-500" />
                      </Button>
                      {questionImage && (
                        <Button variant="destructive" size="icon" className="h-8 w-8 rounded-lg shadow-sm" onClick={() => setQuestionImage("")}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {questionImage && (
                    <div className="mt-2 border rounded-xl overflow-hidden inline-block shadow-sm">
                      <img src={questionImage} alt="Q" className="max-h-32" />
                    </div>
                  )}
                </div>

                {qType !== "text" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Responses</Label>
                      <Button variant="ghost" size="sm" className="h-7 text-emerald-600 text-[10px] font-bold" onClick={() => setOptions([...options, { text: "" }])}>
                        <Plus className="w-3 h-3 mr-1" /> Add Option
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {options.map((opt, idx) => {
                        const isCorrect = correctAnswer.split(",").includes(String(idx));
                        return (
                          <div key={idx} className={cn("p-4 border rounded-xl transition-all space-y-3", isCorrect ? "bg-emerald-50/50 border-emerald-500/30 dark:bg-emerald-500/5 dark:border-emerald-500/30" : "bg-white dark:bg-slate-800")}>
                            <div className="flex items-start gap-3">
                              <span className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0", isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-700")}>
                                {indexToLetter[idx]}
                              </span>
                              <textarea value={opt.text} onChange={(e) => {
                                const next = [...options];
                                next[idx].text = e.target.value;
                                setOptions(next);
                              }} placeholder="Option text..." className="flex-1 bg-transparent border-none p-0 text-sm font-medium focus:ring-0 outline-none resize-none min-h-[40px]" />
                              <button onClick={() => setOptions(options.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <Button size="sm" variant="ghost" className={cn("h-7 rounded-lg px-3 text-[10px] font-bold", isCorrect ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-slate-50 text-slate-500 dark:bg-slate-700")} onClick={() => {
                                if (qType === 'msq') {
                                  let current = correctAnswer.split(",").filter(Boolean);
                                  if (current.includes(String(idx))) current = current.filter(v => v !== String(idx));
                                  else current.push(String(idx));
                                  setCorrectAnswer(current.sort().join(","));
                                } else setCorrectAnswer(String(idx));
                              }}>
                                {isCorrect ? "CORRECT" : "SET CORRECT"}
                              </Button>
                              <div className="flex gap-2">
                                <input type="file" accept="image/*" id={`opt-img-${idx}`} className="hidden" onChange={(e) => handleImagePick(e, (url) => {
                                  const next = [...options]; next[idx].image = url; setOptions(next);
                                })} />
                                <button onClick={() => document.getElementById(`opt-img-${idx}`)?.click()} className={cn("p-1.5 rounded-md", opt.image ? "text-emerald-500 bg-emerald-50" : "text-slate-300 hover:text-emerald-500")}>
                                  <ImageIcon className="w-3.5 h-3.5" />
                                </button>
                                {opt.image && (
                                  <button onClick={() => { const next = [...options]; delete next[idx].image; setOptions(next); }} className="p-1.5 text-slate-300 hover:text-red-500">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            {opt.image && <img src={opt.image} alt="Opt" className="h-16 rounded-lg border" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {qType === "text" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Exact Answer Match</Label>
                    <Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="Type answer..." className="h-10 text-sm font-bold text-emerald-600" />
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-slate-50/50 dark:bg-slate-800/10 flex gap-3">
                {editingId && (
                  <Button variant="ghost" className="h-10 px-6 font-bold text-xs uppercase text-slate-500" onClick={resetForm}>Cancel</Button>
                )}
                <Button className="flex-1 h-10 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-600 transition-all rounded-lg" onClick={addOrUpdateQuestion}>
                  {editingId ? "Update Question" : "Save to Pool"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Generator - Premium Glassmorphism */}
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-600 p-5 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group border border-white/10">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
                  <Sparkles className="w-16 h-16" />
                </div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2.5 opacity-80">
                      <div className="p-1.5 rounded-lg">
                        <Sparkles className="w-4.5 h-4.5" />
                      </div>
                      AI Generator
                    </h3>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`w-1 h-1 rounded-full bg-white/30 ${aiGenerating ? "animate-bounce" : ""}`} style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative group/input">
                      <Input 
                        placeholder="Core Intelligence Topic..." 
                        value={aiTopic} 
                        onChange={(e) => setAiTopic(e.target.value)} 
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm font-bold pl-4 rounded-2xl focus:bg-white/20 transition-all border-none ring-1 ring-white/20 focus:ring-white/40 shadow-inner" 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover/input:opacity-50 transition-opacity">
                        <Brain className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <Label className="text-[9px] font-black uppercase tracking-widest opacity-70">Context</Label>
                          {aiSection !== "Smart Auto-Classify" && (
                            <button 
                              onClick={() => {
                                const found = availableSections.find(s => s.name === aiSection);
                                if (found) openConfig(found.id);
                              }}
                              className="text-white/40 hover:text-white transition-colors"
                            >
                              <Settings2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <select 
                            value={aiSection} 
                            onChange={(e) => setAiSection(e.target.value)} 
                            className="h-10 w-full bg-white/10 border-white/20 rounded-xl text-[10px] font-black px-4 outline-none text-white appearance-none cursor-pointer hover:bg-white/20 transition-all ring-1 ring-white/10 border-none"
                          >
                            <option value="Smart Auto-Classify" className="bg-emerald-800 text-white">Smart Auto-Classify</option>
                             {currentSections.map(s => <option key={s} value={s} className="bg-emerald-800 text-white">{s}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40 pointer-events-none" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest opacity-70 px-1">Complexity</Label>
                        <div className="relative">
                          <select 
                            value={aiDifficulty} 
                            onChange={(e) => setAiDifficulty(e.target.value)} 
                            className="h-10 w-full bg-white/10 border-white/20 rounded-xl text-[10px] font-black px-4 outline-none text-white appearance-none cursor-pointer hover:bg-white/20 transition-all ring-1 ring-white/10 border-none"
                          >
                            <option value="easy" className="bg-emerald-800">Easy</option>
                            <option value="medium" className="bg-emerald-800">Medium</option>
                            <option value="hard" className="bg-emerald-800">Hard</option>
                            <option value="mixed" className="bg-emerald-800">Mixed</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start w-full flex-col gap-4 pt-2">
                      <div className="w-full space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest opacity-70 px-1">Quantity</Label>
                        <Input 
                          type="number" 
                          value={aiCount} 
                          onChange={(e) => setAiCount(e.target.value)} 
                          className="h-10 bg-white/10 border-none ring-1 ring-white/10 text-center text-xs font-black text-white rounded-xl focus:bg-white/20 transition-all" 
                        />
                      </div>
                      <Button 
                        className="py-5 flex-1 h-12 w-full bg-white text-emerald-700 font-black text-[11px] uppercase tracking-widest hover:bg-teal-50 border-none shadow-[0_10px_30px_rgba(0,0,0,0.1)] transform active:scale-95 transition-all rounded-2xl relative overflow-hidden group/btn" 
                        onClick={handleAiGenerate} 
                        disabled={aiGenerating}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {aiGenerating ? (
                            <>
                              <div className="w-3 h-3 border-2 border-emerald-700/20 border-t-emerald-700 rounded-full animate-spin" />
                              Synthesizing...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 fill-current" />
                              Ignite AI Generation
                            </>
                          )}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* RAG Agent - Minimal Slate Premium */}
              <div className="bg-white dark:bg-slate-900 border-none shadow-[0_15px_50px_rgba(0,0,0,0.05)] p-8 rounded-[2rem] flex flex-col justify-between group/rag relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-3xl group-hover/rag:bg-emerald-50 dark:group-hover/rag:bg-emerald-900/10 transition-all duration-700" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200 flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 group-hover/rag:text-emerald-500 transition-colors">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      Knowledge Vault
                    </h3>
                  </div>

                  <div 
                    className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/30 dark:bg-slate-800/10 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/20 transition-all cursor-pointer group/upload min-h-[140px]" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-4 transform group-hover/upload:-translate-y-1 transition-transform">
                      <Upload className="w-6 h-6 text-slate-400 group-hover/upload:text-emerald-500 transition-colors" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-loose">
                      {pdfAnalyzing ? (
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                          Extracting Neural Patterns...
                        </span>
                      ) : (
                        <>Inhale PDF Source<br/><span className="text-[8px] opacity-40 font-bold lowercase italic tracking-normal">(auto-classification active)</span></>
                      )}
                    </span>
                    <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={handlePdfUpload} />
                  </div>

                  {pdfText && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="grid grid-cols-1 gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          className="h-11 border-emerald-500 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.15em] rounded-xl hover:bg-emerald-500 border-none transition-all shadow-md group/gen"
                          onClick={() => handlePdfGenerate(true)}
                          disabled={aiGenerating}
                        >
                          {aiGenerating ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              Filling Architecture...
                            </div>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 fill-current" />
                              Smart Fill Architecture ({localSectionsConfig.reduce((s, c) => s + (c.pickCount || 0), 0)} Qs)
                            </span>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-11 border-emerald-100 bg-emerald-50 content-center text-emerald-700 font-black text-[10px] uppercase tracking-[0.15em] rounded-xl hover:bg-emerald-100 transition-all group/gen"
                          onClick={() => handlePdfGenerate(false)}
                          disabled={aiGenerating}
                        >
                          <span className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5" />
                            Mixed Extra Generation
                          </span>
                        </Button>
                      </div>
                      <p className="text-[8px] text-center text-slate-400 font-bold mt-2 uppercase tracking-widest opacity-60 italic">
                        Reference context loaded: {pdfText.length} characters
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">
                  <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <p className="text-[9px] text-emerald-800/60 dark:text-emerald-500/60 font-black uppercase tracking-widest leading-relaxed">
                    Identity-Preserving RAG Logic Active
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Pool */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-20 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-600" />
                  <h2 className="font-bold text-slate-900 dark:text-white">Question Pool</h2>
                </div>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-slate-800 whitespace-nowrap">
                  {questions.length} Items Total
                </span>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar pb-10">
                {questions.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-dashed rounded-xl dark:bg-slate-900">
                    <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Pool is empty</p>
                  </div>
                ) : (
                  Object.entries(
                    questions.reduce((acc, q) => {
                      const sec = q.section || "General";
                      if (!acc[sec]) acc[sec] = [];
                      acc[sec].push(q);
                      return acc;
                    }, {} as Record<string, Question[]>)
                  ).map(([sectionName, sectionQuestions]) => (
                    <div key={sectionName} className="space-y-2">
                      <div className="flex items-center justify-between py-1 border-b mb-2 px-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{sectionName}</span>
                        <button onClick={() => handleBulkDelete(sectionName)} className="text-[9px] font-bold text-red-400 hover:text-red-500">Delete Group</button>
                      </div>

                      <div className="space-y-2">
                        {sectionQuestions.map((q, i) => (
                          <div key={q.id} className={cn("group p-4 bg-white dark:bg-slate-900 border rounded-xl transition-all hover:shadow-md", editingId === q.id && "ring-2 ring-emerald-500 border-transparent shadow-lg")}>
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                                <span className="text-[9px] font-bold text-slate-400 tabular-nums leading-none">#{questions.indexOf(q) + 1}</span>
                                <div className={cn("w-1 flex-1 min-h-[40px] rounded-full", q.type === 'text' ? 'bg-amber-400' : 'bg-emerald-500')} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border dark:bg-slate-800">{q.type}</span>
                                    <span className="text-[8px] font-bold text-emerald-600">{q.marks} Pts</span>
                                    {q.requiresJustification && (
                                      <span className="flex items-center gap-1 text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                        <Sparkles className="w-2 h-2" /> JUSTIFIED
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => editQuestion(q.id)} className="p-1.5 hover:text-emerald-600 text-slate-300 transition-colors"><SquarePen className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => setQuestions(prev => prev.filter(it => it.id !== q.id))} className="p-1.5 hover:text-red-500 text-slate-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 group-hover:line-clamp-none transition-all">{q.question}</h4>
                                
                                {q.type !== 'text' && (
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {q.options?.map((opt, idx) => {
                                      const isCorrect = q.correctAnswer.split(",").includes(String(idx));
                                      if (!opt.text) return null;
                                      return (
                                        <div key={idx} className={cn("text-[9px] px-2 py-1 rounded-md border flex items-center gap-1.5", isCorrect ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold" : "bg-slate-50/50 text-slate-400 dark:bg-slate-800/50")}>
                                          <span className="opacity-40">{indexToLetter[idx]}</span>
                                          <span className="truncate max-w-[100px]">{opt.text}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
        {componentLoading && <Loading/>}
            </div>
          </div>
        </div>
      </main>
      <Dialog open={!!configSectionId} onOpenChange={(open) => !open && setConfigSectionId(null)}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-8 border-none shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Settings2 className="w-6 h-6" />
              </div>
              Intelligent Persona Config
            </DialogTitle>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure AI Identity for {configData.name}</p>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Prompt</Label>
                </div>
                <Textarea 
                  value={configData.identityPrompt} 
                  onChange={(e) => setConfigData({...configData, identityPrompt: e.target.value})}
                  className="h-32 text-xs pt-3 leading-relaxed border-slate-100 bg-slate-50/50"
                  placeholder="You are an expert..."
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validation Rules (JSON)</Label>
                </div>
                <Textarea 
                  value={configData.validationRules} 
                  onChange={(e) => setConfigData({...configData, validationRules: e.target.value})}
                  className="h-24 font-mono text-[10px] pt-3 bg-slate-50/50 border-slate-100"
                  placeholder='{"rule": true}'
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Workflow className="w-3.5 h-3.5 text-purple-500" />
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transformation Logic</Label>
                </div>
                <Textarea 
                  value={configData.transformationPrompt} 
                  onChange={(e) => setConfigData({...configData, transformationPrompt: e.target.value})}
                  className="h-64 text-xs pt-3 leading-relaxed border-slate-100 bg-slate-50/50"
                  placeholder="Convert topic into..."
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 flex gap-3">
             <Button variant="ghost" onClick={() => setConfigSectionId(null)} className="font-bold text-slate-400">Cancel</Button>
             <Button onClick={handleUpdateSection} className="bg-slate-900 hover:bg-black text-white px-8 font-black uppercase tracking-widest h-12 rounded-xl shadow-xl transform active:scale-95 transition-all">
                Save Identity
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
