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
  X
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

  const [questions, setQuestions] = useState<Question[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [componentLoading,setComponentLoading] = useState(false);

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
  const [aiGenerating, setAiGenerating] = useState(false);

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
    try {
      const response = await fetch("/api/ai/extract-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Generate ${aiCount} ${aiDifficulty === 'mixed' ? 'varied' : aiDifficulty} multiple choice questions about: ${aiTopic}.`,
          count: parseInt(aiCount),
          difficulty: aiDifficulty,
          sections: exam?.sectionsConfig?.map(s => s.name) || ["General"]
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
        section: q.section || "General",
        marks: parseInt(qMarks) || 1,
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
    setUploading(true);
    const toastId = toast.loading("Analyzing...");
    setComponentLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const parseResp = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      if (!parseResp.ok) throw new Error("Parse failed");
      const { text } = await parseResp.json();
      const sectionNames = exam?.sectionsConfig?.map(s => s.name) || ["General"];

      const extractResp = await fetch("/api/ai/extract-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text,
          count: parseInt(aiCount),
          sections: sectionNames,
          difficulty: aiDifficulty
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
      }));
      setQuestions((prev) => [...prev, ...newQuestions]);
      toast.success(`Extracted ${newQuestions.length} questions`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setUploading(false);
      setComponentLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

                   <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {localSectionsConfig.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic text-center py-4 border-2 border-dashed rounded-lg">No automated section rules defined.</p>
                      ) : localSectionsConfig.map((sec, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          <Input 
                            value={sec.name}
                            onChange={(e) => {
                              const next = [...localSectionsConfig];
                              next[idx].name = e.target.value;
                              setLocalSectionsConfig(next);
                            }}
                            placeholder="Section Name"
                            className="h-8 bg-white text-[10px] font-bold rounded-lg"
                          />
                          <Input 
                            type="number"
                            value={sec.pickCount}
                            onChange={(e) => {
                              const next = [...localSectionsConfig];
                              next[idx].pickCount = parseInt(e.target.value) || 0;
                              setLocalSectionsConfig(next);
                            }}
                            placeholder="Pick"
                            className="w-fit text-center text-[10px] font-bold bg-white rounded-lg"
                          />
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
                  <Input placeholder="Section name..." className="h-10 border-emerald-200 bg-emerald-50/30 text-emerald-600 font-bold" autoFocus onBlur={(e) => setQSection(e.target.value.trim() || "General")} />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-600 p-6 rounded-xl text-white shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-12 h-12" />
                </div>
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4" /> AI Generator
                </h3>
                <div className="space-y-3">
                  <Input placeholder="Topic..." value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} className="h-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm font-medium" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase tracking-widest opacity-60">Count</Label>
                      <Input type="number" value={aiCount} onChange={(e) => setAiCount(e.target.value)} className="h-8 bg-white/10 border-white/20 text-center text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase tracking-widest opacity-60">Level</Label>
                      <select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)} className="h-8 w-full bg-white/10 border-white/20 rounded-md text-[10px] font-bold px-2 outline-none">
                        <option value="easy" className="bg-emerald-600">Easy</option><option value="medium" className="bg-emerald-600">Medium</option><option value="hard" className="bg-emerald-600">Hard</option><option value="mixed" className="bg-emerald-600 ">Mixed</option>
                      </select>
                    </div>    
                  </div>
                  <Button className="w-full h-9 bg-white text-emerald-600 font-bold text-xs uppercase hover:bg-slate-100" onClick={handleAiGenerate} disabled={aiGenerating}>
                    {aiGenerating ? "Generating..." : "Generate AI Questions"}
                  </Button>
                </div>        
              </div>
              
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-xl shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> RAG Agent
                </h3>
                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/20 hover:border-emerald-300 transition-colors cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                   <Upload className="w-6 h-6 text-slate-300 mb-2 group-hover:text-emerald-500" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     {uploading ? "Parsing..." : "Drop PDF Source"}
                   </span>
                   <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={handlePdfUpload} />
                </div>
                <p className="text-[9px] text-slate-400 text-center font-medium italic opacity-60">AI will automatically categorize extracted questions into sections.</p>
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
    </div>
  );
}
