"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Exam, useExam } from "@/hooks/contexts/ExamContext";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function CreateExam() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
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
        // Format to datetime-local format (YYYY-MM-DDTHH:mm) in local timezone
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
    const id = `exam-${Date.now()}`;
    const exam: Exam = {
      id,
      title: title.trim(),
      duration: parseInt(duration),
      totalMarks: parseInt(totalMarks),
      startTime,
      endTime,
      status: "upcoming",
      questions: [],
    };
    const success = await addExam(exam);
    if (success) {
      toast.success("Exam Created! Now add questions.");
      router.push(`/admin/add-questions/${id}`);
    } else {
      toast.error("Failed to create exam. Please try again.");
    }
  };


  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-3xl font-bold text-foreground mb-2">Create Exam</h1>
      <p className="text-muted-foreground mb-8">Set up a new examination</p>
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
          Create & Add Questions
        </Button>
      </form>
    </div>
  );
}
