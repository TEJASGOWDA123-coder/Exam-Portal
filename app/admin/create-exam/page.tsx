"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger  } from "@/components/ui/tabs";
import { Exam, useExam } from "@/hooks/contexts/ExamContext";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { 
  Plus, 
  Trash2, 
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Clock,
  ShieldCheck 
} from "lucide-react";
import Link from "next/link";

export default function CreateExam() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [proctoringEnabled, setProctoringEnabled] = useState(false);
  const [sectionsConfig, setSectionsConfig] = useState<{ name: string; pickCount: number }[]>([]);
  const { addExam } = useExam();
  const router = useRouter();
  const { data: session } = useSession();

  // Auto-calculate end time based on start time and duration
  useEffect(() => {
    if (startTime && duration) {
      const start = new Date(startTime);
      const durationMinutes = parseInt(duration);
      if (!isNaN(durationMinutes) && durationMinutes > 0) {
        const end = new Date(start.getTime() + durationMinutes * 60000);
        const year = end.getFullYear();
        const month = String(end.getMonth() + 1).padStart(2, '0');
        const day = String(end.getDate()).padStart(2, '0');
        const hours = String(end.getHours()).padStart(2, '0');
        const minutes = String(end.getMinutes()).padStart(2, '0');
        const endTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
        setEndTime(endTimeString);
      }
    }
  }, [startTime, duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !duration || !totalMarks || !startTime) {
      toast.error("Please fill all required fields");
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
      sectionsConfig: sectionsConfig.length > 0 ? sectionsConfig : undefined,
      questions: [],
    };
    const success = await addExam(exam);
    if (success) {
      toast.success("Exam Created! Now add questions.");
      router.push(`/admin/add-questions/${id}`);
    } else {
      toast.error("Failed to create exam");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 animate-fade-in">
      <div className="mb-12">
         <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/dashboard" className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-slate-200 dark:border-slate-800">
               <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Creation Terminal</span>
                <div className="flex items-center gap-2 mt-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Architect New Assessment Matrix</p>
                </div>
            </div>
         </div>
         <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-4">Create <span className="text-emerald-500">Evaluation</span></h1>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-xs opacity-60">Define the parameters for your next evaluation session.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs defaultValue="basic" className="space-y-8">
          <TabsList className="flex w-full overflow-x-auto h-auto bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none p-0 gap-8 justify-start no-scrollbar">
            <TabsTrigger value="basic" className="rounded-none border-b-2 border-transparent px-0 pb-4 text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-500 data-[state=active]:bg-transparent transition-all">
              01. Identity
            </TabsTrigger>
            <TabsTrigger value="timing" className="rounded-none border-b-2 border-transparent px-0 pb-4 text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-500 data-[state=active]:bg-transparent transition-all">
              02. Chronology
            </TabsTrigger>
            <TabsTrigger value="sections" className="rounded-none border-b-2 border-transparent px-0 pb-4 text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-500 data-[state=active]:bg-transparent transition-all">
              03. Dimensions
            </TabsTrigger>
            <TabsTrigger value="proctoring" className="rounded-none border-b-2 border-transparent px-0 pb-4 text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-500 data-[state=active]:bg-transparent transition-all">
              04. Integrity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-0 focus-visible:outline-none">
            <div className="space-y-4">
               <div className="space-y-3">
                  <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Assessment Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Advanced Cryptographic Protocols"
                    className="h-16 rounded-[1.5rem] border-slate-200 text-xl font-black bg-white focus:ring-8 focus:ring-emerald-500/5 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
                  />
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] opacity-60 ml-1">Establish a unique identifier for the evaluators and students.</p>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="timing" className="mt-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <Label htmlFor="duration" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Duration (Min)</Label>
                  <div className="relative group">
                     <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                     <Input
                        id="duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="60"
                        className="h-16 pl-16 rounded-[1.5rem] border-slate-200 text-xl font-black bg-white focus:ring-8 focus:ring-emerald-500/5 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
                     />
                  </div>
               </div>
               <div className="space-y-4">
                  <Label htmlFor="marks" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Terminal Score</Label>
                  <div className="relative group">
                     <Plus className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                     <Input
                        id="marks"
                        type="number"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)}
                        placeholder="100"
                        className="h-16 pl-16 rounded-[1.5rem] border-slate-200 text-xl font-black bg-white focus:ring-8 focus:ring-emerald-500/5 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
                     />
                  </div>
               </div>
               <div className="space-y-4">
                  <Label htmlFor="start" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Start Threshold</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-16 rounded-[1.5rem] border-slate-200 font-black text-sm bg-white focus:ring-8 focus:ring-emerald-500/5 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
                  />
               </div>
               <div className="space-y-4">
                  <Label htmlFor="end" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Expiry Threshold (Auto)</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={endTime}
                    readOnly
                    className="h-16 rounded-[1.5rem] border-slate-200 bg-slate-50 border-dashed text-slate-400 cursor-not-allowed font-black text-sm opacity-60"
                  />
               </div>
            </div>
          </TabsContent>

          <TabsContent value="sections" className="mt-0 focus-visible:outline-none">
            <div className="space-y-6">
               <div className="rounded-[2rem] bg-emerald-500/5 p-8 border border-emerald-500/10 dark:bg-emerald-500/5 dark:border-emerald-500/20 shadow-sm">
                  <div className="flex items-center gap-4 mb-4 text-emerald-600">
                     <Sparkles className="h-6 w-6" />
                     <h4 className="font-black text-lg tracking-tight uppercase tracking-widest">Dimension Control</h4>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic">
                     Define the architectural boundaries of your assessment sections. AI will use these constraints to curate dynamic matrix for each student.
                  </p>
               </div>

                <div className="space-y-4">
                  {sectionsConfig.map((sec, idx) => (
                    <div key={idx} className="group relative flex flex-col md:flex-row items-end gap-6 p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-2xl dark:bg-slate-900/40 dark:border-slate-800">
                      <div className="flex-1 space-y-3 w-full">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Dimension Identifier</Label>
                        <Input 
                          value={sec.name} 
                          onChange={(e) => {
                            const next = [...sectionsConfig];
                            next[idx].name = e.target.value;
                            setSectionsConfig(next);
                          }}
                          placeholder="e.g. Numerical Aptitude"
                          className="h-14 rounded-2xl border-slate-100 font-black text-emerald-600 focus:ring-4 focus:ring-emerald-500/5 bg-slate-50/30"
                        />
                      </div>
                      <div className="w-full md:w-36 space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Pick Count</Label>
                        <Input 
                          type="number"
                          value={sec.pickCount} 
                          onChange={(e) => {
                            const next = [...sectionsConfig];
                            next[idx].pickCount = parseInt(e.target.value) || 0;
                            setSectionsConfig(next);
                          }}
                          className="h-14 rounded-2xl border-slate-100 font-black text-center focus:ring-4 focus:ring-emerald-500/5 bg-slate-50/30"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-14 w-14 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                        onClick={() => setSectionsConfig(sectionsConfig.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 hover:border-emerald-200 hover:text-emerald-500 dark:border-slate-800 dark:hover:bg-slate-800/10 transition-all group"
                    onClick={() => setSectionsConfig([...sectionsConfig, { name: "", pickCount: 10 }])}
                  >
                    <Plus className="w-5 h-5 mr-4 group-hover:rotate-90 transition-transform" />
                    Extend Matrix Configuration
                  </Button>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="proctoring" className="mt-0 focus-visible:outline-none">
             <div className="space-y-6">
               <div className="flex items-center justify-between p-10 rounded-[3rem] bg-slate-950 text-white shadow-2xl shadow-slate-200 dark:shadow-none border border-white/5 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-40 w-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-emerald-500/20 transition-all" />
                  <div className="space-y-3 relative z-10">
                     <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                           <ShieldCheck className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h4 className="font-black text-2xl tracking-tighter">AI Integrity Guard</h4>
                     </div>
                     <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-bold">
                        Active evaluation monitoring with gaze tracking and biometric verification.
                     </p>
                  </div>
                  <Switch
                    checked={proctoringEnabled}
                    onCheckedChange={setProctoringEnabled}
                    className="scale-150 data-[state=checked]:bg-emerald-500 transition-all"
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2rem] border border-slate-200 bg-white dark:bg-slate-900/40 dark:border-slate-800 shadow-sm">
                     <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 border-b border-slate-100 pb-4">Digital Surveillance</h5>
                     <ul className="space-y-5">
                        {["Facial Identity Verification", "Gaze Vector tracking", "Neural Speech analysis", "Peripheral monitoring"].map((item) => (
                           <li key={item} className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                              {item}
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div className="p-8 rounded-[2rem] border border-slate-200 bg-white dark:bg-slate-900/40 dark:border-slate-800 shadow-sm">
                     <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 border-b border-slate-100 pb-4">Compliance Protocol</h5>
                     <ul className="space-y-5">
                        {["Matrix Escape (3 strikes)", "Browser Sandbox isolation", "Full-session telemetry", "Instant termination"].map((item) => (
                            <li key={item} className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                               <div className="w-2 h-2 rounded-full bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.3)]" />
                               {item}
                            </li>
                        ))}
                     </ul>
                  </div>
               </div>
             </div>
          </TabsContent>
        </Tabs>

        <div className="pt-12 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-10 pb-20">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-sm leading-relaxed italic border-l-2 border-emerald-500/20 pl-6">
             By provisioning this matrix, you authorize the deployment of evaluation instances to the student pool.
           </p>
           <div className="flex items-center gap-6 w-full md:w-auto">
              <Button variant="ghost" type="button" onClick={() => router.back()} className="h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
                Abort
              </Button>
              <Button type="submit" className="h-16 px-14 rounded-2xl bg-emerald-500 font-black text-slate-950 shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:bg-emerald-400 hover:shadow-[0_15px_35px_rgba(34,197,94,0.4)] transition-all active:scale-95 flex-1 md:flex-none">
                Provision & Architect Pool
                <ChevronRight className="ml-3 h-5 w-5" />
              </Button>
           </div>
        </div>
      </form>
    </div>
  );
}
