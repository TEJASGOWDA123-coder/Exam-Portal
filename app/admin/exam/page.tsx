"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";


import { useExam } from "@/hooks/contexts/ExamContext";
import {
    FilePlus,
    Link as LinkIcon,
    ExternalLink,
    Clock,
    CheckCircle2,
    Calendar,
    AlertCircle,
    BarChart2,
    Trash2
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

const ExamPage = () => {
    const { exams, deleteExam } = useExam();
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [examToDelete, setExamToDelete] = React.useState<{ id: string, title: string } | null>(null);

    const copyLink = (id: string) => {
        const link = `${window.location.origin}/exam/${id}`;
        navigator.clipboard.writeText(link);
        toast.success("Exam link copied to clipboard!");
    };

    const handleDelete = async () => {
        if (!examToDelete) return;

        setIsDeleting(true);
        const success = await deleteExam(examToDelete.id);
        setIsDeleting(false);

        if (success) {
            toast.success("Exam deleted successfully");
            setExamToDelete(null);
        } else {
            toast.error("Failed to delete exam");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            case "completed": return "text-slate-500 bg-slate-500/10 border-slate-500/20";
            default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
        }
    };

    return (
        <div className="max-w-6xl animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Exams</h1>
                    <p className="text-muted-foreground mt-1">Manage and monitor all your examinations</p>
                </div>
                <Link href="/admin/create-exam">
                    <Button className="font-semibold">
                        <FilePlus className="w-4 h-4 mr-2" />
                        Create New Exam
                    </Button>
                </Link>
            </div>

            {exams.length === 0 ? (
                <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No exams found</h3>
                    <p className="text-muted-foreground mb-6">Start by creating your first examination.</p>
                    <Link href="/admin/create-exam">
                        <Button variant="outline">Create Exam</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map((exam) => (
                        <div key={exam.id} className="bg-card rounded-2xl border border-border shadow-card hover:shadow-elevated p-6 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${getStatusColor(exam.status)}`}>
                                    {exam.status}
                                </span>
                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {exam.totalMarks} Marks
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                {exam.title}
                            </h3>

                            <div className="space-y-2.5 mb-6">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {exam.duration} Minutes
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {exam.startTime && !isNaN(new Date(exam.startTime).getTime())
                                        ? format(new Date(exam.startTime), "MMM d, h:mm a")
                                        : "No date set"}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => copyLink(exam.id)}
                                    >
                                        <LinkIcon className="w-3.5 h-3.5 mr-2" />
                                        Share
                                    </Button>
                                    <Link href={`/admin/add-questions/${exam.id}`} className="flex-1">
                                        <Button size="sm" className="w-full">
                                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                            Manage
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => setExamToDelete({ id: exam.id, title: exam.title })}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AlertDialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the exam <strong>{examToDelete?.title}</strong>,
                            including all its questions and student submissions. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Exam"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ExamPage;