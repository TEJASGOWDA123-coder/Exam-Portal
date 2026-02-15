"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Link as LinkIcon,
  ChevronRight,
  Zap,
  LayoutGrid
} from "lucide-react";
import { toast } from "sonner";
import { Question, useExam } from "@/hooks/contexts/ExamContext";
import Link from "next/link";

const indexToLetter = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function AddQuestions() {
  const params = useParams();
  const examId = params.examId as string;
  const { exams, updateExam, loading } = useExam();
  const exam = exams.find((e) => e.id === examId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (exam && !initialized) {
      setQuestions(exam.questions || []);
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
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [autoDetectSections, setAutoDetectSections] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI generation state
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState("5");
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
    const toastId = toast.loading("AI is thinking (generating pool)...");
    try {
      const response = await fetch("/api/ai/extract-questions", { // Reuse extraction for topic generation too or create dedicated
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Generate ${aiCount} multiple choice questions about: ${aiTopic}. Ensure high quality.`,
          count: parseInt(aiCount),
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
      toast.success(`Generated ${generated.length} questions into your pool!`, { id: toastId });
    } catch (err: any) {
      toast.error("Failed to generate questions", { id: toastId });
    } finally {
      setAiGenerating(false);
    }
  };

  const addOrUpdateQuestion = () => {
    if (!questionText.trim()) {
      toast.error("Please enter question text");
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
    };
    if (editingId) {
      setQuestions((prev) => prev.map((q) => (q.id === editingId ? newQ : q)));
      setEditingId(null);
    } else {
      setQuestions((prev) => [...prev, newQ]);
    }
    resetForm();
    toast.success(editingId ? "Updated" : "Added to Pool");
  };

  const resetForm = () => {
    setQuestionText("");
    setQuestionImage("");
    setQType("mcq");
    setOptions([{ text: "" }, { text: "" }, { text: "" }, { text: "" }]);
    setCorrectAnswer("0");
    setQSection("General");
    setQMarks("1");
    setEditingId(null);
  };

  const editQuestion = (id: string) => {
    const q = questions.find((item) => item.id === id);
    if (!q) return;
    
    setEditingId(q.id);
    setQuestionText(q.question);
    setQuestionImage(q.questionImage || "");
    setQType(q.type);
    if (q.options) {
      setOptions(q.options);
    } else {
      setOptions([{ text: "" }, { text: "" }, { text: "" }, { text: "" }]);
    }
    setCorrectAnswer(q.correctAnswer);
    setQSection(q.section || "General");
    setQMarks(String(q.marks || 1));
    
    // Smooth scroll to the editor form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading("RAG Agent: Analyzing document...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const parseResp = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!parseResp.ok) throw new Error("Failed to parse PDF");
      const { text } = await parseResp.json();

      toast.loading("RAG Agent: Categorizing and Framing pool (2x)...", { id: toastId });

      const extractResp = await fetch("/api/ai/extract-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text,
          count: parseInt(aiCount),
          sections: exam?.sectionsConfig?.map(s => s.name) || ["General"]
        }),
      });

      if (!extractResp.ok) throw new Error("AI extraction failed");
      const { questions: extracted } = await extractResp.json();

      const newQuestions = extracted.map((q: any, index: number) => ({
        id: `pdf-${Date.now()}-${index}`,
        type: "mcq",
        question: q.question,
        options: [
          { text: q.optionA }, { text: q.optionB }, { text: q.optionC }, { text: q.optionD },
        ],
        correctAnswer: String(indexToLetter.indexOf(q.correctAnswer.toUpperCase())),
        section: q.section || "General",
        marks: parseInt(qMarks) || 1,
      }));

      setQuestions((prev) => [...prev, ...newQuestions]);
      toast.success(`Successfully added ${newQuestions.length} questions to your pool!`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to process PDF", { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleBulkDelete = (section?: string) => {
    if (confirm(`Are you sure you want to delete ${section ? `all questions in "${section}"` : "ALL questions"}?`)) {
      if (section) {
        setQuestions(prev => prev.filter(q => q.section !== section));
      } else {
        setQuestions([]);
      }
      toast.success("Deleted successfully");
    }
  };

  const saveAll = async () => {
    if (!exam) return;
    setSaving(true);
    const success = await updateExam({ ...exam, questions });
    setSaving(false);
    if (success) toast.success("Saved!");
    else toast.error("Failed to save");
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-black animate-pulse">Initializing...</div>;
  if (!exam) return <div className="p-20 text-center text-destructive font-black">EXAM_NOT_FOUND</div>;

  const currentSections = Array.from(new Set([
    "General", 
    ...(Array.isArray(exam.sectionsConfig) ? exam.sectionsConfig.map(s => s.name) : []),
    ...questions.map(q => q.section).filter(Boolean) as string[]
  ]));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-fade-in pb-20">
      {/* Header Sticky */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="max-w-[1500px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
             <Link href="/admin/dashboard" className="p-3.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl transition-all border border-slate-100 dark:border-slate-800">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
             </Link>
             <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white truncate max-w-[400px] tracking-tight">{exam.title}</h1>
                <div className="flex items-center gap-2.5 mt-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                      Curation Terminal • {questions.length} Matrix Items
                   </p>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" className="hidden lg:flex h-12 rounded-2xl px-6 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" onClick={() => handleBulkDelete()}>
                <Trash2 className="w-4 h-4 mr-2" />
                Purge Matrix
             </Button>
             <Button className="h-12 rounded-2xl px-10 font-black text-xs uppercase tracking-[0.1em] bg-emerald-500 text-slate-950 shadow-[0_10px_30px_rgba(34,197,94,0.2)] hover:bg-emerald-400 hover:shadow-[0_15px_35px_rgba(34,197,94,0.3)] transition-all active:scale-95" onClick={saveAll} disabled={saving}>
               {saving ? "COMMITING..." : <><Save className="w-4 h-4 mr-2" /> Commit Matrix</>}
             </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto p-6 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Input Controls */}
          <div className="lg:col-span-7 space-y-12">
             
             {/* Question Creator */}
             <div className="group relative overflow-hidden rounded-[3rem] bg-white border border-slate-200 p-10 shadow-sm transition-all hover:shadow-2xl dark:bg-slate-900/50 dark:border-slate-800">
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight flex items-center gap-4 text-slate-900 dark:text-white">
                        {editingId ? "Modify Entry" : "Matrix Entry"}
                        {editingId && <Zap className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />}
                      </h2>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Construct evaluation logic.</p>
                   </div>
                   <Tabs value={qType} onValueChange={(v: any) => setQType(v)} className="bg-slate-100 p-1.5 rounded-2xl dark:bg-slate-800/80">
                      <TabsList className="bg-transparent h-10 p-0 gap-1.5">
                         {["mcq", "msq", "text"].map(t => (
                            <TabsTrigger key={t} value={t} className="rounded-xl px-6 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 transition-all">
                               {t}
                            </TabsTrigger>
                         ))}
                      </TabsList>
                   </Tabs>
                </div>

                <div className="space-y-10">
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target Dimension</Label>
                         <select 
                           value={qSection} 
                           onChange={(e) => setQSection(e.target.value)}
                           className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-black text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:bg-slate-800 dark:border-slate-700"
                         >
                           {currentSections.map(s => <option key={s} value={s}>{s}</option>)}
                           <option value="NEW">+ PROVISION NEW</option>
                         </select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Weight (PTS)</Label>
                        <Input type="number" value={qMarks} onChange={(e) => setQMarks(e.target.value)} min="1" className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black text-lg focus:ring-4 focus:ring-emerald-500/10 dark:bg-slate-800" />
                      </div>
                   </div>

                   {qSection === "NEW" && (
                      <div className="animate-in slide-in-from-top-4 duration-300">
                        <Input 
                          placeholder="IDENTIFIER NAME..." 
                          className="h-14 rounded-2xl bg-emerald-50/30 border-emerald-200/50 font-black text-emerald-600 placeholder:text-emerald-300 focus:ring-4 focus:ring-emerald-100"
                          autoFocus
                          onBlur={(e) => {
                             if(e.target.value.trim()) setQSection(e.target.value.trim());
                             else setQSection("General");
                          }}
                        />
                      </div>
                   )}

                   <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Statement Content</Label>
                      <div className="relative group/text">
                         <textarea
                           value={questionText}
                           onChange={(e) => setQuestionText(e.target.value)}
                           placeholder="Type the evaluation statement..."
                           className="w-full min-h-[180px] p-8 rounded-[2rem] bg-slate-50 border border-slate-100 font-bold text-xl leading-relaxed focus:ring-8 focus:ring-emerald-500/5 transition-all outline-none resize-none dark:bg-slate-800 dark:border-slate-700"
                         />
                         <div className="absolute right-6 bottom-6 flex gap-3">
                            <input type="file" accept="image/*" id="q-upload" className="hidden" onChange={(e) => handleImagePick(e, setQuestionImage)} />
                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white shadow-lg border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-700 transition-all group/img" onClick={() => document.getElementById('q-upload')?.click()}>
                               <ImageIcon className="w-6 h-6 text-slate-400 group-hover/img:text-emerald-500 transition-colors" />
                            </Button>
                            {questionImage && (
                               <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-all shadow-lg shadow-red-500/10" onClick={() => setQuestionImage("")}>
                                  <Trash2 className="w-6 h-6" />
                               </Button>
                            )}
                         </div>
                      </div>
                      {questionImage && (
                         <div className="relative inline-block mt-4 rounded-3xl overflow-hidden border-4 border-white shadow-2xl dark:border-slate-800 scale-in-center">
                            <img src={questionImage} alt="Preview" className="max-h-56 object-contain" />
                         </div>
                      )}
                   </div>

                   {/* Options for MCQ/MSQ */}
                   {qType !== "text" && (
                      <div className="space-y-6 pt-4">
                         <div className="flex items-center justify-between px-1">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Choice Pool</Label>
                            <Button variant="ghost" className="h-9 px-4 rounded-xl text-emerald-600 bg-emerald-50 font-black text-[10px] uppercase tracking-[0.1em] hover:bg-emerald-100 transition-all" onClick={() => setOptions([...options, { text: "" }])}>
                               <Plus className="w-3.5 h-3.5 mr-2" /> Extend Matrix
                            </Button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {options.map((opt, idx) => {
                               const selected = correctAnswer.split(",").includes(String(idx));
                               return (
                                  <div key={idx} className={`relative flex flex-col gap-5 p-6 rounded-[2rem] border-2 transition-all group/opt ${selected ? "border-emerald-500 bg-emerald-50/30 shadow-[0_10px_30px_rgba(34,197,94,0.05)] dark:bg-emerald-500/5" : "border-slate-50 bg-slate-50/50 hover:border-emerald-200 dark:bg-slate-800 dark:border-slate-800"}`}>
                                     <div className="flex items-start gap-5">
                                        <span className={`h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all shadow-sm ${selected ? "bg-emerald-500 text-slate-950" : "bg-white text-slate-300 dark:bg-slate-700"}`}>
                                           {indexToLetter[idx]}
                                        </span>
                                        <textarea 
                                          value={opt.text} 
                                          onChange={(e) => {
                                            const next = [...options];
                                            next[idx].text = e.target.value;
                                            setOptions(next);
                                          }}
                                          placeholder="Define choice..."
                                          className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-slate-700 dark:text-slate-300 placeholder:text-slate-300 focus:ring-0 outline-none resize-none min-h-[60px] leading-relaxed"
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover/opt:opacity-100 transition-opacity text-slate-300 hover:text-red-500" onClick={() => setOptions(options.filter((_, i) => i !== idx))}>
                                           <Trash2 className="w-4 h-4" />
                                        </Button>
                                     </div>
                                     <div className="flex items-center justify-between">
                                        <Button variant="ghost" className={`h-11 rounded-2xl px-5 text-[10px] font-black uppercase tracking-[0.1em] transition-all ${selected ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400" : "bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-700 shadow-sm"}`} onClick={() => {
                                           if (qType === 'msq') {
                                              const current = correctAnswer.split(",").filter(v => v !== "");
                                              if (current.includes(String(idx))) setCorrectAnswer(current.filter(v => v !== String(idx)).join(","));
                                              else setCorrectAnswer([...current, String(idx)].sort().join(","));
                                           } else setCorrectAnswer(String(idx));
                                        }}>
                                           {selected ? <CheckCircle2 className="w-4 h-4 mr-2" /> : null}
                                           {selected ? "VALID ENTRY" : "SET AS VALID"}
                                        </Button>
                                     </div>
                                  </div>
                               );
                            })}
                         </div>
                      </div>
                   )}

                   {/* Text Validation */}
                   {qType === "text" && (
                      <div className="space-y-4 pt-4">
                         <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Canonical Matrix Key</Label>
                         <Input 
                           value={correctAnswer} 
                           onChange={(e) => setCorrectAnswer(e.target.value)} 
                           placeholder="Enter precise evaluation string..."
                           className="h-16 rounded-2xl border-slate-100 bg-slate-50 font-black text-emerald-600 px-8 text-lg placeholder:text-slate-300 dark:bg-slate-800"
                         />
                         <div className="p-5 rounded-[1.5rem] bg-amber-500/5 border border-amber-500/10 flex items-center gap-4">
                            <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                            <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest leading-none">Note: Evaluation uses case-insensitive string comparison logic.</p>
                         </div>
                      </div>
                   )}

                   <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex gap-6">
                      {editingId && (
                         <Button variant="ghost" className="flex-1 h-16 rounded-[2rem] font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all" onClick={resetForm}>Abort Modification</Button>
                      )}
                      <Button className="flex-1 h-20 rounded-[2.5rem] bg-slate-950 text-white font-black text-xl hover:bg-emerald-500 hover:text-slate-950 shadow-2xl transition-all group active:scale-[0.98]" onClick={addOrUpdateQuestion}>
                         {editingId ? "COMMIT UPDATE" : "PUBLISH TO MATRIX"}
                         <ChevronRight className="ml-3 h-6 w-6 transform group-hover:translate-x-1 transition-transform" />
                      </Button>
                   </div>
                </div>
             </div>

             {/* Import / AI Tools */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* AI Generator */}
                <div className="p-10 rounded-[3rem] bg-emerald-500 text-slate-950 shadow-2xl shadow-emerald-500/20 group relative overflow-hidden">
                   <div className="absolute right-0 top-0 h-40 w-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                   <div className="flex items-center gap-4 mb-8">
                      <div className="h-12 w-12 rounded-2xl bg-slate-950 flex items-center justify-center">
                         <Sparkles className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tighter">AI Logic Hub</h3>
                   </div>
                   <div className="space-y-5">
                      <Input 
                        placeholder="Context ID (e.g. Neural Networks)" 
                        value={aiTopic} 
                        onChange={(e) => setAiTopic(e.target.value)}
                        className="h-14 bg-slate-950/5 border-slate-950/10 text-slate-950 placeholder:text-slate-950/40 rounded-2xl font-black focus:ring-slate-950/10"
                      />
                      <div className="flex gap-3">
                         <Input type="number" placeholder="QTY" value={aiCount} onChange={(e) => setAiCount(e.target.value)} className="h-14 w-28 bg-slate-950/5 border-slate-950/10 text-slate-950 rounded-2xl font-black text-center" />
                         <Button className="flex-1 h-14 bg-slate-950 text-white font-black rounded-2xl hover:bg-slate-800 shadow-lg transition-all active:scale-95" onClick={handleAiGenerate} disabled={aiGenerating}>
                            {aiGenerating ? "COMPUTING..." : "PROVISION"}
                         </Button>
                      </div>
                   </div>
                </div>

                {/* RAG Agent */}
                <div className="p-10 rounded-[3rem] bg-white border border-slate-200 shadow-sm transition-all hover:shadow-xl dark:bg-slate-900/50 dark:border-slate-800">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                         <FileText className="w-6 h-6 text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">Doc Processor</h3>
                   </div>
                   <div className="space-y-5">
                      <div className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 group/upload cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all dark:bg-slate-800/20 dark:border-slate-800" onClick={() => fileInputRef.current?.click()}>
                         <Upload className="w-8 h-8 text-slate-300 mb-3 group-hover/upload:text-emerald-500 transition-colors" />
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {uploading ? "PARSING CONTEXT..." : "SOURCE PDF UPLOAD"}
                         </p>
                         <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={handlePdfUpload} />
                      </div>
                      <div className="px-2">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] opacity-40 leading-relaxed italic text-center">AI will extract context and generate dual-weightage matrix.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right: Pool Preview */}
          <div className="lg:col-span-5 space-y-10">
             <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-4">
                   <LayoutGrid className="w-6 h-6 text-emerald-500" />
                   <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Active Matrix</h2>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-[10px] text-slate-400 dark:bg-slate-900">
                   {questions.length}
                </div>
             </div>

             <div className="space-y-8 max-h-[1600px] overflow-y-auto pr-4 no-scrollbar pb-20">
                {questions.length === 0 ? (
                  <div className="p-32 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm dark:bg-slate-900/50 dark:border-slate-800">
                      <div className="h-20 w-20 rounded-3xl bg-slate-50 mx-auto flex items-center justify-center mb-10 dark:bg-slate-800">
                         <FileText className="w-10 h-10 text-slate-200" />
                      </div>
                      <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Matrix Void</p>
                  </div>
                ) : (
                  Object.entries(
                    questions.reduce((acc, q) => {
                      if (!acc[q.section || "General"]) acc[q.section || "General"] = [];
                      acc[q.section || "General"].push(q);
                      return acc;
                    }, {} as Record<string, Question[]>)
                  ).map(([sectionName, sectionQuestions]) => (
                    <div key={sectionName} className="space-y-5">
                       <div className="flex items-center justify-between bg-slate-950 p-5 rounded-[2.2rem] shadow-xl shadow-slate-200 dark:shadow-none transition-all hover:scale-[1.01]">
                          <div className="flex items-center gap-4">
                            <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">{sectionName}</span>
                            <span className="text-[10px] bg-white/10 text-white/60 px-3 py-1.5 rounded-xl font-black tracking-widest leading-none">
                               {sectionQuestions.length} ITEMS
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-red-500 hover:bg-white/5 transition-all" onClick={() => handleBulkDelete(sectionName)}>
                             <Trash2 className="w-4 h-4" />
                          </Button>
                       </div>

                       <div className="grid grid-cols-1 gap-5 pl-2">
                          {sectionQuestions.map((q, i) => (
                             <div key={q.id} className={`group relative p-8 bg-white rounded-[2.5rem] border transition-all hover:shadow-2xl dark:bg-slate-900/80 ${editingId === q.id ? "border-emerald-500 shadow-2xl scale-[1.03]" : "border-slate-100 dark:border-slate-800"}`}>
                                <div className="flex items-start gap-6">
                                   <div className="flex flex-col items-center gap-3 pt-1">
                                      <span className="text-[10px] font-black text-slate-300 tabular-nums leading-none">#{questions.indexOf(q) + 1}</span>
                                      <div className={`w-1.5 h-16 rounded-full transition-all ${q.type === 'text' ? 'bg-amber-400' : q.type === 'msq' ? 'bg-blue-400' : 'bg-emerald-500'}`} />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-5">
                                         <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">{q.type}</span>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">{q.marks} PTS</span>
                                         </div>
                                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 origin-right">
                                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-100" onClick={() => editQuestion(q.id)}>
                                               <SquarePen className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-all" onClick={() => setQuestions(prev => prev.filter(item => item.id !== q.id))}>
                                               <Trash2 className="w-4 h-4" />
                                            </Button>
                                         </div>
                                      </div>
                                      <p className="text-base font-black text-slate-900 dark:text-white leading-[1.6] mb-6 line-clamp-3 group-hover:line-clamp-none transition-all">{q.question}</p>
                                      
                                      {q.type !== 'text' ? (
                                         <div className="flex flex-wrap gap-2.5">
                                            {q.options?.map((opt, idx) => {
                                               const isCorrect = q.correctAnswer.split(",").includes(String(idx));
                                               if (!opt.text) return null;
                                               return (
                                                  <div key={idx} className={`text-[9px] px-3.5 py-2 rounded-xl flex items-center gap-2.5 transition-all ${isCorrect ? "bg-emerald-500/10 text-emerald-600 font-black border border-emerald-500/20" : "bg-slate-50 text-slate-400 border border-slate-100 dark:bg-slate-800 dark:border-slate-700"}`}>
                                                     <span className="font-black opacity-30 text-[10px]">{indexToLetter[idx]}</span>
                                                     <span className="truncate max-w-[140px] tracking-tight">{opt.text}</span>
                                                  </div>
                                               );
                                            })}
                                         </div>
                                      ) : (
                                         <div className="mt-2 p-5 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10 dark:bg-slate-800/80">
                                            <div className="flex items-center justify-between">
                                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">VALIDATION_KEY</span>
                                               <span className="text-[10px] font-black text-emerald-600 leading-none">{q.correctAnswer}</span>
                                            </div>
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
          </div>

        </div>
      </div>
    </div>
  );
}
