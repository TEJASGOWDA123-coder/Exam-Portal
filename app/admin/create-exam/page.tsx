"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Exam, useExam } from "@/hooks/contexts/ExamContext";
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
   Lock,
   Copy,
   Check,
   ClipboardPaste,
   FilePlus,
   Calendar,
   Save
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function CreateExam() {
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
   const [sectionalNavigation, setSectionalNavigation] = useState<"free" | "forward-only">("free");
   const [sebConfigId, setSebConfigId] = useState<string | null>(null);
   const [positiveMarks, setPositiveMarks] = useState("1");
   const [negativeMarks, setNegativeMarks] = useState("0");
   const [maxViolations, setMaxViolations] = useState("3");
   const [configs, setConfigs] = useState<{ id: string, name: string }[]>([]);
   const [availableSections, setAvailableSections] = useState<{ id: string, name: string }[]>([]);
   const [uploadingSeb, setUploadingSeb] = useState(false);
   const [sectionsConfig, setSectionsConfig] = useState<{ name: string; pickCount: number; duration: number }[]>([]);
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

   useEffect(() => {
      const fetchConfigs = async () => {
         try {
            const resp = await fetch("/api/admin/seb");
            if (resp.ok) setConfigs(await resp.json());
            
            const secResp = await fetch("/api/sections");
            if (secResp.ok) setAvailableSections(await secResp.json());
         } catch (err) {
            console.error("Failed to fetch initial data", err);
         }
      };
      fetchConfigs();
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
            toast.success("SEB configuration uploaded and linked!");
            // Refresh list and select the new one
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
            toast.success("Exam Created! Now add questions.");
            router.push(`/admin/add-questions/${id}`);
         }
      } catch (error: any) {
         toast.error(error.message || "Failed to create exam");
      }
   };

   return (
      <div className="w-full animate-fade-in pb-10 px-4">
         {/* Header */}
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold">
                  <FilePlus className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h1 className="text-3xl font-bold text-foreground font-title">Create Exam</h1>
                  <p className="text-muted-foreground mt-1 text-sm font-medium">Configure a new examination</p>
               </div>
            </div>
            <Button variant="ghost" asChild className="font-bold">
               <Link href="/admin/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
               </Link>
            </Button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
               <form onSubmit={handleSubmit}>
                  <Card className="p-6 rounded-2xl shadow-card border border-border bg-card">
                     <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-muted/50 p-1 rounded-xl">
                           <TabsTrigger value="details" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Exam Details</TabsTrigger>
                           <TabsTrigger value="sections" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Sections</TabsTrigger>
                           <TabsTrigger value="settings" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-6">
                           <div className="space-y-2">
                              <Label htmlFor="title">Exam Title</Label>
                              <Input
                                 id="title"
                                 value={title}
                                 onChange={(e) => setTitle(e.target.value)}
                                 placeholder="e.g. Mid-Term Physics Assessment"
                                 className="h-11"
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <Label htmlFor="duration">Duration (Minutes)</Label>
                                 <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                       id="duration"
                                       type="number"
                                       value={duration}
                                       onChange={(e) => setDuration(e.target.value)}
                                       placeholder="60"
                                       className="pl-10 h-11"
                                    />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <Label htmlFor="marks">Total Marks</Label>
                                 <div className="relative">
                                    <BarChart2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                       id="marks"
                                       type="number"
                                       value={totalMarks}
                                       onChange={(e) => setTotalMarks(e.target.value)}
                                       placeholder="100"
                                       className="pl-10 h-11"
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <Label htmlFor="start">Start Time</Label>
                                 <Input
                                    id="start"
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="h-11"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <Label htmlFor="end">End Time (Auto-calculated)</Label>
                                 <Input
                                    id="end"
                                    type="datetime-local"
                                    value={endTime}
                                    readOnly
                                    className="h-11 bg-muted/50 text-muted-foreground"
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-primary/10 bg-primary/5 mt-4">
                              <div className="space-y-2">
                                 <Label htmlFor="pos-marks" className="text-emerald-600 font-bold">Positive Marking (per question)</Label>
                                 <Input
                                    id="pos-marks"
                                    type="number"
                                    value={positiveMarks}
                                    onChange={(e) => setPositiveMarks(e.target.value)}
                                    placeholder="1"
                                    className="h-11 border-emerald-200 focus:border-emerald-500"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <Label htmlFor="neg-marks" className="text-destructive font-bold">Negative Marking (e.g. 0.25)</Label>
                                 <Input
                                    id="neg-marks"
                                    type="number"
                                    step="0.01"
                                    value={negativeMarks}
                                    onChange={(e) => setNegativeMarks(e.target.value)}
                                    placeholder="0"
                                    className="h-11 border-destructive/20 focus:border-destructive"
                                 />
                              </div>
                              <p className="col-span-2 text-[10px] text-muted-foreground italic">
                                 * Negative marks should be entered as a positive number (e.g., 0.25 will deduct 0.25 points for wrong answers).
                              </p>
                           </div>
                        </TabsContent>

                        <TabsContent value="sections" className="space-y-6">
                           <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                              <div className="flex items-center gap-2 mb-2 text-primary">
                                 <Sparkles className="h-4 w-4" />
                                 <h4 className="font-bold text-sm">Section Control</h4>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                 Define the logical sections of your exam.
                              </p>
                           </div>

                           <div className="space-y-3">
                              {sectionsConfig.map((sec, idx) => (
                                 <div key={idx} className="flex items-end gap-3 p-4 bg-muted/20 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
                                     <div className="flex-1 space-y-2">
                                        <Label className="text-xs">Section Name</Label>
                                        <Select
                                           value={sec.name}
                                           onValueChange={(val) => {
                                              const next = [...sectionsConfig];
                                              next[idx].name = val;
                                              setSectionsConfig(next);
                                           }}
                                        >
                                           <SelectTrigger className="h-9 bg-background">
                                              <SelectValue placeholder="Select Template" />
                                           </SelectTrigger>
                                           <SelectContent>
                                              {availableSections.map(s => (
                                                 <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                              ))}
                                           </SelectContent>
                                        </Select>
                                     </div>
                                    <div className="w-24 space-y-2">
                                       <Label className="text-xs">Pick Count</Label>
                                       <Input
                                          type="number"
                                          value={sec.pickCount}
                                          onChange={(e) => {
                                             const next = [...sectionsConfig];
                                             next[idx].pickCount = parseInt(e.target.value) || 0;
                                             setSectionsConfig(next);
                                          }}
                                          className="h-9 bg-background text-center"
                                       />
                                    </div>
                                    <div className="w-24 space-y-2">
                                       <Label className="text-xs">Time (Min)</Label>
                                       <Input
                                          type="number"
                                          value={sec.duration}
                                          onChange={(e) => {
                                             const next = [...sectionsConfig];
                                             next[idx].duration = parseInt(e.target.value) || 0;
                                             setSectionsConfig(next);
                                          }}
                                          className="h-9 bg-background text-center"
                                       />
                                    </div>
                                    <Button
                                       variant="ghost"
                                       size="icon"
                                       type="button"
                                       className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                       onClick={() => setSectionsConfig(sectionsConfig.filter((_, i) => i !== idx))}
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </Button>
                                 </div>
                              ))}

                              <Button
                                 type="button"
                                 variant="outline"
                                 className="w-full h-12 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/50"
                                 onClick={() => setSectionsConfig([...sectionsConfig, { name: "", pickCount: 10, duration: 5 }])}
                              >
                                 <Plus className="w-4 h-4 mr-2" />
                                 Add Section Configuration
                               </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                               <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                     <Clock className="w-4 h-4 text-orange-500" />
                                     <Label className="text-base font-bold">Strict Section Timings</Label>
                                  </div>
                                  <p className="text-xs text-muted-foreground">Force students to wait for the timer to elapse before moving to the next section.</p>
                               </div>
                               <Switch checked={strictSectionTiming} onCheckedChange={setStrictSectionTiming} />
                            </div>

                            <p className="text-[10px] text-muted-foreground mt-2 italic">* Sectional durations enforce strict time limits per section. Total exam time should consider these individual limits.</p>
                         </TabsContent>

                        <TabsContent value="settings" className="space-y-6">
                           <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                              <div className="space-y-0.5">
                                 <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    <Label className="text-base font-bold">Proctoring</Label>
                                 </div>
                                 <p className="text-xs text-muted-foreground">Enable AI-based monitoring during the exam</p>
                              </div>
                              <Switch checked={proctoringEnabled} onCheckedChange={setProctoringEnabled} />
                           </div>

                           {proctoringEnabled && (
                              <div className="grid grid-cols-2 gap-4 ml-6 pl-4 border-l-2 border-primary/20 animate-in slide-in-from-top-2">
                                 <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/10">
                                    <Label className="text-sm font-bold text-muted-foreground mr-4">Require Camera</Label>
                                    <Switch checked={proctoringVideo} onCheckedChange={setProctoringVideo} />
                                 </div>
                                 <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/10">
                                    <Label className="text-sm font-bold text-muted-foreground mr-4">Require Microphone</Label>
                                    <Switch checked={proctoringAudio} onCheckedChange={setProctoringAudio} />
                                 </div>
                              </div>
                           )}

                           <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                              <div className="space-y-0.5">
                                 <div className="flex items-center gap-2">
                                    <BarChart2 className="w-4 h-4 text-blue-500" />
                                    <Label className="text-base font-bold">Show Results</Label>
                                 </div>
                                 <p className="text-xs text-muted-foreground">Allow students to see results immediately</p>
                              </div>
                               <Switch checked={showResults} onCheckedChange={setShowResults} />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                               <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                     <Clock className="w-4 h-4 text-orange-500" />
                                     <Label className="text-base font-bold">Strict Section Timings</Label>
                                  </div>
                                  <p className="text-xs text-muted-foreground">Force students to wait for the timer to elapse before moving to the next section.</p>
                               </div>
                               <Switch 
                                 checked={strictSectionTiming} 
                                 onCheckedChange={(checked) => {
                                   setStrictSectionTiming(checked);
                                   if (checked) setSectionalNavigation("forward-only");
                                 }} 
                               />
                            </div>

                            {!strictSectionTiming && (
                              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30 animate-in slide-in-from-top-2">
                                 <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                       <ChevronRight className="w-4 h-4 text-blue-500" />
                                       <Label className="text-base font-bold">Section Navigation</Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Control how students move between sections</p>
                                 </div>
                                 <div className="flex items-center bg-muted rounded-lg p-1">
                                    <button
                                      type="button"
                                      onClick={() => setSectionalNavigation("free")}
                                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${sectionalNavigation === "free" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
                                    >
                                      Free
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSectionalNavigation("forward-only")}
                                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${sectionalNavigation === "forward-only" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
                                    >
                                      Forward Only
                                    </button>
                                 </div>
                              </div>
                            )}

                           <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                              <div className="space-y-0.5">
                                 <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    <Label className="text-base font-bold">Violation Limit</Label>
                                 </div>
                                 <p className="text-xs text-muted-foreground">Max violations allowed before auto-submission</p>
                              </div>
                              <div className="flex items-center gap-3">
                                 <input
                                    type="number"
                                    min="1"
                                    value={maxViolations}
                                    onChange={(e) => setMaxViolations(e.target.value)}
                                    className="w-16 h-10 px-3 rounded-lg bg-background border border-border text-center font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                 />
                                 <span className="text-xs font-bold text-muted-foreground">Alerts</span>
                              </div>
                           </div>

                           <div className="space-y-2 pt-2 border-t border-border mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                 <ShieldCheck className="w-4 h-4 text-primary" />
                                 <Label className="text-base font-bold">Safe Exam Browser (SEB)</Label>
                              </div>
                              <div className="flex gap-2">
                                 <select
                                    value={sebConfigId || ""}
                                    onChange={(e) => setSebConfigId(e.target.value || null)}
                                    className="flex-1 h-11 px-4 rounded-xl bg-muted border border-border text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                                 >
                                    <option value="">No SEB Required (Standard Browser)</option>
                                    {configs.map(c => (
                                       <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                 </select>
                                 <div className="relative">
                                    <input
                                       type="file"
                                       accept=".seb"
                                       id="create-seb-upload"
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
                                       <label htmlFor="create-seb-upload" className="cursor-pointer">
                                          {uploadingSeb ? (
                                             <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                          ) : (
                                             <Upload className="w-4 h-4" />
                                          )}
                                       </label>
                                    </Button>
                                 </div>
                              </div>
                              <p className="text-[10px] text-muted-foreground ml-1">
                                 Requires students to use the Safe Exam Browser with the selected configuration.
                              </p>
                           </div>
                        </TabsContent>
                     </Tabs>

                     <div className="mt-8 pt-6 border-t border-border flex justify-end">
                        <Button type="submit" className="font-bold px-8 h-11 shadow-lg shadow-primary/20">
                           Create & Add Questions
                           <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                     </div>
                  </Card>
               </form>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
               <Card className="p-6 rounded-2xl shadow-card border border-border bg-card">
                  <h3 className="font-bold text-foreground mb-4">Instructions</h3>
                  <ul className="space-y-3">
                     <li className="flex gap-3 text-sm text-muted-foreground">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">1</span>
                        Enter basic exam details like title, duration, and total marks.
                     </li>
                     <li className="flex gap-3 text-sm text-muted-foreground">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">2</span>
                        Configure proctoring settings if security is required.
                     </li>
                     <li className="flex gap-3 text-sm text-muted-foreground">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">3</span>
                        Once created, you will be redirected to the question pool manager.
                     </li>
                  </ul>
               </Card>

               <Card className="p-6 rounded-2xl shadow-card border border-border bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-center gap-3 mb-3">
                     <Sparkles className="w-5 h-5 text-primary" />
                     <h3 className="font-bold text-primary">AI Assistance</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                     Our AI can help you generate relevant questions based on your exam title and description in the next step.
                  </p>
               </Card>
            </div>
         </div>
      </div>
   );
}
