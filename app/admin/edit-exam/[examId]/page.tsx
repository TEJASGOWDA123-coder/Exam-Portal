"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Exam, useExam } from "@/hooks/contexts/ExamContext";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditExam() {
    const { examId } = useParams();
    const { exams, updateExam } = useExam();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [loading, setLoading] = useState(true);

    const exam = exams.find((e) => e.id === examId);

    useEffect(() => {
        if (exam) {
            setTitle(exam.title);
            setDuration(exam.duration.toString());
            setTotalMarks(exam.totalMarks.toString());
            setStartTime(exam.startTime);
            setEndTime(exam.endTime);
            setLoading(false);
        } else {
            // Fallback for direct page load if exams not yet fetched or not found
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
            status: exam?.status || "upcoming",
            questions: exam?.questions || [],
        };

        const success = await updateExam(updatedExam);
        if (success) {
            toast.success("Exam updated successfully!");
            router.push("/admin/dashboard");
        } else {
            toast.error("Failed to update exam. Please try again.");
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
        <div className="max-w-2xl animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/dashboard">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Edit Exam</h1>
                    <p className="text-muted-foreground">Modify examination details</p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-card rounded-xl p-6 shadow-card border border-border"
            >
                <div>
                    <Label htmlFor="title">Exam Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Data Structures Final"
                        className="mt-1.5"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="60"
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <Label htmlFor="marks">Total Marks</Label>
                        <Input
                            id="marks"
                            type="number"
                            value={totalMarks}
                            onChange={(e) => setTotalMarks(e.target.value)}
                            placeholder="100"
                            className="mt-1.5"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="start">Start Time</Label>
                        <Input
                            id="start"
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <Label htmlFor="end">End Time (Auto-calculated)</Label>
                        <Input
                            id="end"
                            type="datetime-local"
                            value={endTime}
                            readOnly
                            className="mt-1.5 bg-muted cursor-not-allowed"
                            title="Auto-calculated based on start time and duration"
                        />
                    </div>
                </div>
                <Button type="submit" className="w-full font-semibold">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </form>
        </div>
    );
}
