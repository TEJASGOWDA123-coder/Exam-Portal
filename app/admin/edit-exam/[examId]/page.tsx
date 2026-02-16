"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Exam, useExam } from "@/hooks/contexts/ExamContext";
import { toast } from "sonner";
import {
    ArrowLeft,
    Save,
    Clock,
    Plus,
    Upload,
    Trash2,
    Sparkles,
    ShieldCheck,
    BarChart2,
    FileEdit,
    AlignLeft,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function EditExam() {
    const { examId } = useParams();
    const { exams, updateExam } = useExam();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [proctoringEnabled, setProctoringEnabled] = useState(false);
    const [showResults, setShowResults] = useState(true);
    const [sebConfigId, setSebConfigId] = useState<string | null>(null);
    const [configs, setConfigs] = useState<{ id: string, name: string }[]>([]);
    const [uploadingSeb, setUploadingSeb] = useState(false);
    const [sectionsConfig, setSectionsConfig] = useState<{ name: string; pickCount: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const exam = exams.find((e) => e.id === examId);

    useEffect(() => {
        if (exam) {
            setTitle(exam.title);
            setDuration(exam.duration.toString());
            setTotalMarks(exam.totalMarks.toString());
            setStartTime(exam.startTime);
            setEndTime(exam.endTime);
            setProctoringEnabled(!!exam.proctoringEnabled);
            setShowResults(exam.showResults !== undefined ? !!exam.showResults : true);
            setSebConfigId(exam.sebConfigId || null);
            setSectionsConfig(exam.sectionsConfig || []);
            setLoading(false);
        } else {
            const fetchExam = async () => {
                try {
                    const resp = await fetch(`/api/exams/${examId}`);
                    if (resp.ok) {
                        const data = await resp.json();
                        setTitle(data.title);
                        setDuration(data.duration.toString());
                        setTotalMarks(data.totalMarks.toString());
                        setStartTime(data.startTime);
                        setEndTime(data.endTime);
                        setProctoringEnabled(!!data.proctoringEnabled);
                        setShowResults(data.showResults !== undefined ? !!data.showResults : true);
                        setSebConfigId(data.sebConfigId || null);
                        setSectionsConfig(data.sectionsConfig || []);
                        setLoading(false);
                    } else {
                        toast.error("Exam not found");
                        router.push("/admin/dashboard");
                    }
                } catch (err) {
                    console.error("Failed to fetch exam:", err);
                    toast.error("Failed to load exam details");
                }
            };
            fetchExam();
        }
    }, [exam, examId, router]);

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const resp = await fetch("/api/admin/seb");
                if (resp.ok) setConfigs(await resp.json());
            } catch (err) {
                console.error("Failed to fetch SEB configs", err);
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
            toast.error("Please fill all fields");
            return;
        }

        if (!examId) return;

        const updatedExam: Exam = {
            ...(exam || {} as Exam),
            id: examId as string,
            title: title.trim(),
            duration: parseInt(duration),
            totalMarks: parseInt(totalMarks),
            startTime,
            endTime,
            proctoringEnabled,
            showResults,
            sebConfigId,
            sectionsConfig: sectionsConfig.length > 0 ? sectionsConfig : undefined,
            status: exam?.status || "upcoming",
            questions: exam?.questions || [],
        };

        try {
            const success = await updateExam(updatedExam);
            if (success) {
                toast.success("Exam updated successfully!");
                router.push("/admin/dashboard");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update exam");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="w-full animate-fade-in pb-10 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold">
                        <FileEdit className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground font-title">Edit Exam</h1>
                        <p className="text-muted-foreground mt-1 text-sm font-medium">Update exam details and settings</p>
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
                                    <TabsTrigger value="details" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Details</TabsTrigger>
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
                                            <div key={idx} className="flex items-end gap-3 p-4 bg-muted/20 rounded-xl border border-border">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-xs">Section Name</Label>
                                                    <Input
                                                        value={sec.name}
                                                        onChange={(e) => {
                                                            const next = [...sectionsConfig];
                                                            next[idx].name = e.target.value;
                                                            setSectionsConfig(next);
                                                        }}
                                                        className="h-9 bg-background"
                                                    />
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
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
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
                                            onClick={() => setSectionsConfig([...sectionsConfig, { name: "", pickCount: 10 }])}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Section Configuration
                                        </Button>
                                    </div>
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
                                                    id="quick-seb-upload" 
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
                                                    <label htmlFor="quick-seb-upload" className="cursor-pointer">
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
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </Card>
                    </form>
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                    <Card className="p-6 rounded-2xl shadow-card border border-border bg-card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                                <AlignLeft className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-foreground">Quick Tips</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            You can dynamically adjust the section configurations. Changes to section pick counts will affect how many questions are randomly selected for each student.
                        </p>
                        <Button variant="outline" className="w-full text-xs font-bold" onClick={() => router.push(`/admin/add-questions/${examId}`)}>
                            Manage Questions
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
