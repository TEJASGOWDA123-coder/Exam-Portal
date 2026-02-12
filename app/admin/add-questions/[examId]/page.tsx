"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  Plus,
  Link as LinkIcon,
  Upload,
  FileText,
  SquarePen,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Question, useExam } from "@/hooks/contexts/ExamContext";
import Link from "next/link";

const indexToLetter = ["A", "B", "C", "D"];
const letterToIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };


export default function AddQuestions() {
  const params = useParams();
  const examId = params.examId as string;
  const { exams, updateExam, loading } = useExam();
  const exam = exams.find((e) => e.id === examId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize questions when exam is loaded
  if (exam && !initialized) {
    setQuestions(exam.questions || []);
    setInitialized(true);
  }

  const [questionText, setQuestionText] = useState("");
  const [questionImage, setQuestionImage] = useState("");
  const [qType, setQType] = useState<"mcq" | "msq" | "text">("mcq");
  const [options, setOptions] = useState<{ text: string; image?: string }[]>([
    { text: "" }, { text: "" }, { text: "" }, { text: "" }
  ]);
  const [correctAnswer, setCorrectAnswer] = useState("0");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setter(base64);
      toast.success("Image added!");
    } catch (err) {
      toast.error("Failed to process image");
    }
  };

  const handleOptionImagePick = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      const newOptions = [...options];
      newOptions[index].image = base64;
      setOptions(newOptions);
    } catch (err) {
      toast.error("Failed to process image");
    }
  };

  const addOption = () => {
    if (options.length >= 8) {
      toast.error("Maximum 8 options allowed");
      return;
    }
    setOptions([...options, { text: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("Minimum 2 options required");
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    // Adjust correct answers if indices shifted
    if (qType === "msq") {
      const currentArr = correctAnswer.split(",");
      const newArr = currentArr
        .map(ans => parseInt(ans))
        .filter(ans => ans !== index)
        .map(ans => ans > index ? ans - 1 : ans)
        .map(ans => String(ans));
      setCorrectAnswer(newArr.length > 0 ? newArr.join(",") : "0");
    } else if (qType === "mcq") {
      const current = parseInt(correctAnswer);
      if (current === index) setCorrectAnswer("0");
      else if (current > index) setCorrectAnswer(String(current - 1));
    }
  };

  const toggleAnswer = (index: number) => {
    if (qType === "msq") {
      const currentArr = correctAnswer.split(",");
      const idxStr = String(index);
      if (currentArr.includes(idxStr)) {
        setCorrectAnswer(currentArr.filter(a => a !== idxStr).join(","));
      } else {
        setCorrectAnswer([...currentArr, idxStr].sort().join(","));
      }
    } else {
      setCorrectAnswer(String(index));
    }
  };

  // AI generation state
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState("5");
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [aiGenerating, setAiGenerating] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Loading exam details...</span>
      </div>
    );
  }

  if (!exam)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Exam not found.</p>
      </div>
    );

  const parsePdfQuestions = (pdfText: string): Question[] => {
    const parsed: Question[] = [];
    const questionBlocks = pdfText
      .split(/(?=(?:\d+[\.\)]\s|Q\d+[\.\)]\s))/gi)
      .filter((b) => b.trim());

    for (const block of questionBlocks) {
      const lines = block.trim();
      const questionMatch = lines.match(/^(?:Q?\d+[\.\)]\s*)([\s\S]*?)(?=\n?\s*[Aa][\.\)]\s)/);
      if (!questionMatch) continue;

      const qText = questionMatch[1].trim();
      if (!qText) continue;

      const optA = lines.match(/[Aa][\.\)]\s*(.*?)(?=\n?\s*[Bb][\.\)])/s);
      const optB = lines.match(/[Bb][\.\)]\s*(.*?)(?=\n?\s*[Cc][\.\)])/s);
      const optC = lines.match(/[Cc][\.\)]\s*(.*?)(?=\n?\s*[Dd][\.\)])/s);
      const optD = lines.match(/[Dd][\.\)]\s*(.*?)(?=\n?\s*(?:Answer|Ans|Correct)\s*[:]\s*|$)/is);

      if (!optA || !optB || !optC || !optD) continue;

      const answerMatch = lines.match(/(?:Answer|Ans|Correct)\s*[:]\s*([A-Da-d])/i);
      const ansLetter = answerMatch ? answerMatch[1].toUpperCase() : "A";
      const ansIdx = indexToLetter.indexOf(ansLetter);

      parsed.push({
        id: `q-${Date.now()}-${parsed.length}`,
        type: "mcq",
        question: qText,
        options: [
          { text: optA[1].trim() },
          { text: optB[1].trim() },
          { text: optC[1].trim() },
          { text: optD[1].trim() },
        ],
        correctAnswer: String(ansIdx),
      });
    }
    return parsed;
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to parse PDF');

      const { text } = await response.json();
      const parsed = parsePdfQuestions(text);

      if (parsed.length === 0) {
        toast.error("No questions found in PDF. Please check the format.");
      } else {
        setQuestions((prev) => [...prev, ...parsed]);
        toast.success(`${parsed.length} questions imported.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to read PDF. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          count: parseInt(aiCount),
          difficulty: aiDifficulty,
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
        correctAnswer: String(indexToLetter.indexOf(q.correctAnswer)),
      }));

      setQuestions((prev) => [...prev, ...generated]);
      toast.success("Questions generated!");
    } catch (err: any) {
      toast.error("Failed to generate questions");
    } finally {
      setAiGenerating(false);
    }
  };


  const addOrUpdateQuestion = () => {
    if (!questionText.trim()) {
      toast.error("Please enter question text");
      return;
    }

    if (qType !== "text") {
      const emptyOpt = options.some(o => !o.text.trim() && !o.image);
      if (emptyOpt) {
        toast.error("Please fill all options");
        return;
      }
      if (!correctAnswer) {
        toast.error("Please select a correct answer");
        return;
      }
    } else {
      if (!correctAnswer.trim()) {
        toast.error("Please enter the correct answer for text validation");
        return;
      }
    }

    const newQ: Question = {
      id: editingId || `q-${String(Date.now())}`,
      type: qType,
      question: questionText.trim(),
      questionImage: questionImage || undefined,
      options: qType !== "text" ? options : undefined,
      correctAnswer: correctAnswer,
    };

    if (editingId) {
      setQuestions((prev) => prev.map((q) => (q.id === editingId ? newQ : q)));
      setEditingId(null);
    } else {
      setQuestions((prev) => [...prev, newQ]);
    }

    setQuestionText("");
    setQuestionImage("");
    setQType("mcq");
    setOptions([{ text: "" }, { text: "" }, { text: "" }, { text: "" }]);
    setCorrectAnswer("0");
    toast.success(editingId ? "Updated" : "Added");
  };

  const editQuestion = (id: string) => {
    const q = questions.find((q) => q.id === id);
    if (!q) return;
    setEditingId(id);
    setQuestionText(q.question);
    setQuestionImage(q.questionImage || "");
    setQType(q.type);
    setOptions(q.options || [{ text: "" }, { text: "" }, { text: "" }, { text: "" }]);
    setCorrectAnswer(q.correctAnswer);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveAll = async () => {
    setSaving(true);
    const success = await updateExam({ ...exam, questions });
    setSaving(false);
    if (success) toast.success("Saved");
    else toast.error("Failed");
  };

  return (
    <div className="max-w-4xl animate-fade-in pb-10">
      <Link href="/admin/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{exam.title}</h1>
          <p className="text-muted-foreground mt-1">Refactored dynamic question system ({questions.length} questions)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/exam/${exam.id}`);
            toast.success("Link copied!");
          }}>
            <LinkIcon className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button onClick={saveAll} disabled={saving}>{saving ? "Saving..." : "Save All"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate with AI
          </h2>
          <div className="space-y-4">
            <Input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="Topic (e.g. Next.js)" />
            <div className="flex gap-4">
              <Input type="number" value={aiCount} onChange={(e) => setAiCount(e.target.value)} className="w-24" />
              <select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)} className="flex-1 rounded-md border border-input bg-background px-3 h-10 text-sm">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <Button onClick={handleAiGenerate} disabled={aiGenerating} className="w-full">
              {aiGenerating ? "Generating..." : "Generate MCQ"}
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><FileText className="w-5 h-5" />Import from PDF</h2>
          <input type="file" accept=".pdf" ref={fileInputRef} onChange={handlePdfUpload} className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full h-[120px] flex-col gap-2 border-dashed border-2">
            <Upload className="w-8 h-8 opacity-50" />
            {uploading ? "Processing..." : "Drag and drop or click to upload PDF"}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card border border-border mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{editingId ? "Edit Question" : "Add New Question"}</h2>
          <div className="flex bg-muted p-1 rounded-lg">
            {(["mcq", "msq", "text"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setQType(t);
                  if (t === "text") setCorrectAnswer("");
                  else setCorrectAnswer("0");
                }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${qType === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-sm font-bold mb-2 block">Question Content</Label>
            <div className="flex gap-4 items-start">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter your question here..."
                className="flex-1 min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <div className="flex flex-col gap-2">
                <input type="file" accept="image/*" id="q-img" onChange={(e) => handleImagePick(e, setQuestionImage)} className="hidden" />
                <Button variant={questionImage ? "default" : "outline"} size="icon" onClick={() => document.getElementById('q-img')?.click()} className="w-12 h-12">
                  <Upload className="w-5 h-5" />
                </Button>
                {questionImage && (
                  <Button variant="destructive" size="icon" onClick={() => setQuestionImage("")} className="w-12 h-12">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
            {questionImage && <div className="mt-3"><img src={questionImage} alt="Preview" className="max-h-32 rounded border shadow-sm" /></div>}
          </div>

          {qType !== "text" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold">Options</Label>
                <Button variant="ghost" size="sm" onClick={addOption} className="text-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4 mr-1" /> Add Option
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, idx) => (
                  <div key={idx} className={`group p-4 rounded-xl border-2 transition-all ${correctAnswer.split(",").includes(String(idx)) ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                      <Input
                        value={opt.text}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[idx].text = e.target.value;
                          setOptions(newOptions);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="h-8 border-none bg-transparent focus-visible:ring-0 shadow-none px-0"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeOption(idx)} className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="file" accept="image/*" id={`opt-img-${idx}`} onChange={(e) => handleOptionImagePick(e, idx)} className="hidden" />
                      <button onClick={() => document.getElementById(`opt-img-${idx}`)?.click()} className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors">
                        <Upload className="w-3 h-3" /> {opt.image ? "Change Image" : "Add Image"}
                      </button>
                      {opt.image && (
                        <button onClick={() => {
                          const newOptions = [...options];
                          delete newOptions[idx].image;
                          setOptions(newOptions);
                        }} className="text-[10px] text-destructive hover:font-bold">Remove</button>
                      )}
                      <div className="flex-1 text-right">
                        <button onClick={() => toggleAnswer(idx)} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${correctAnswer.split(",").includes(String(idx)) ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                          {correctAnswer.split(",").includes(String(idx)) ? "Correct Answer" : "Mark Correct"}
                        </button>
                      </div>
                    </div>
                    {opt.image && <img src={opt.image} alt="" className="mt-3 h-16 rounded border" />}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Label className="text-sm font-bold mb-2 block">Fill-in-the-blank Answer</Label>
              <Input
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Enter exact correct answer text..."
                className="h-12 border-2 focus:border-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-2">Note: Student response will be compared against this text (case-insensitive).</p>
            </div>
          )}

          <Button onClick={addOrUpdateQuestion} className="w-full h-12 text-md font-bold shadow-lg shadow-primary/20">
            {editingId ? "Update Question" : "Add Question to Exam"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          Current Questions <span className="text-sm font-normal text-muted-foreground">({questions.length})</span>
        </h2>
        {questions.map((q, i) => (
          <div key={q.id} className="group bg-card rounded-xl p-5 shadow-sm border border-border flex gap-4 transition-all hover:shadow-md hover:border-primary/30">
            <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs shrink-0">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${q.type === 'text' ? 'bg-orange-500/10 text-orange-600' : q.type === 'msq' ? 'bg-blue-500/10 text-blue-600' : 'bg-green-500/10 text-green-600'}`}>
                  {q.type}
                </span>
              </div>
              <p className="font-semibold text-foreground truncate mb-2">{q.question}</p>
              {q.questionImage && <div className="mb-3"><img src={q.questionImage} alt="" className="h-12 rounded border" /></div>}

              {q.type !== 'text' ? (
                <div className="flex flex-wrap gap-2">
                  {q.options?.map((opt, idx) => (
                    <div key={idx} className={`text-[10px] px-2 py-1 rounded border flex items-center gap-1.5 ${q.correctAnswer.split(",").includes(String(idx)) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                      <span className="font-bold">{idx + 1}.</span> {opt.text || "Image only"}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-primary font-bold">Answer: {q.correctAnswer}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => editQuestion(q.id)} className="h-8 w-8 text-primary hover:bg-primary/10"><SquarePen className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setQuestions(prev => prev.filter(item => item.id !== q.id))} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
