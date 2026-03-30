// "use client";
// import * as React from "react";
// import { Button } from "@/components/ui/button";

// import { useExam } from "@/hooks/contexts/ExamContext";
// import {
//     FilePlus,
//     Link as LinkIcon,
//     ExternalLink,
//     Clock,
//     CheckCircle2,
//     Calendar,
//     AlertCircle,
//     BarChart2,
//     Trash2,
//     ShieldCheck
// } from "lucide-react";
// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogDescription,
//     DialogFooter
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import Link from "next/link";
// import { toast } from "sonner";
// import { format } from "date-fns";

// const ExamPage = () => {
//     const { exams, deleteExam, updateExam } = useExam();
//     const [isDeleting, setIsDeleting] = React.useState(false);
//     const [examToDelete, setExamToDelete] = React.useState<{ id: string, title: string } | null>(null);

//     const [rescheduleData, setRescheduleData] = React.useState<{ id: string, title: string, startTime: string, duration: number } | null>(null);
//     const [isRescheduling, setIsRescheduling] = React.useState(false);

//     const copyLink = (id: string) => {
//         const link = `${window.location.origin}/exam/${id}`;
//         navigator.clipboard.writeText(link);
//         toast.success("Exam link copied to clipboard!");
//     };

//     const copySebLink = (id: string) => {
//         // sebs:// link triggers SEB browser directly
//         const host = window.location.host;
//         const link = `sebs://${host}/api/seb/config/${id}`;
//         navigator.clipboard.writeText(link);
//         toast.success("SEB Launch link copied!", {
//             description: "Students can click this to open the exam directly in SEB."
//         });
//     };

//     const handleDelete = async () => {
//         if (!examToDelete) return;

//         setIsDeleting(true);
//         const success = await deleteExam(examToDelete.id);
//         setIsDeleting(false);

//         if (success) {
//             toast.success("Exam deleted successfully");
//             setExamToDelete(null);
//         } else {
//             toast.error("Failed to delete exam");
//         }
//     };

//     const handleReschedule = async () => {
//         if (!rescheduleData) return;

//         setIsRescheduling(true);
//         const examObj = exams.find(e => e.id === rescheduleData.id);
//         if(!examObj) return;

//         const start = new Date(rescheduleData.startTime);
//         const end = new Date(start.getTime() + rescheduleData.duration * 60000);

//         const pad = (n: number) => String(n).padStart(2, '0');
//         const endTimeString = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;

//         const updatedExam = {
//             ...examObj,
//             startTime: rescheduleData.startTime,
//             duration: rescheduleData.duration,
//             endTime: endTimeString,
//             status: "upcoming" as const
//         };

//         const success = await updateExam(updatedExam);
//         setIsRescheduling(false);

//         if (success) {
//             toast.success(`Exam rescheduled to ${new Date(rescheduleData.startTime).toLocaleString()}`);
//             setRescheduleData(null);
//         } else {
//             toast.error("Failed to reschedule exam");
//         }
//     };

//     const getStatusColor = (status: string) => {
//         switch (status) {
//             case "active": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
//             case "completed": return "text-slate-500 bg-slate-500/10 border-slate-500/20";
//             default: return "text-emerald-600 bg-emerald-600/10 border-emerald-600/20";
//         }
//     };

//     return (
//         <div className="w-full animate-fade-in pb-10 px-4">
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//                 <div>
//                     <h1 className="text-3xl font-bold text-foreground">Exams</h1>
//                     <p className="text-muted-foreground mt-1">Manage and monitor all your examinations</p>
//                 </div>
//                 <Link href="/admin/create-exam">
//                     <Button className="h-12 px-8 rounded-xl font-black bg-emerald-500 text-slate-950 shadow-[0_5px_15px_rgba(16,185,129,0.2)] hover:bg-emerald-400 transition-all">
//                         <FilePlus className="w-4 h-4 mr-2" />
//                         Create New Exam
//                     </Button>
//                 </Link>
//             </div>

//             {exams.length === 0 ? (
//                 <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
//                     <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//                     <h3 className="text-lg font-semibold">No exams found</h3>
//                     <p className="text-muted-foreground mb-6">Start by creating your first examination.</p>
//                     <Link href="/admin/create-exam">
//                         <Button variant="outline">Create Exam</Button>
//                     </Link>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {exams.map((exam) => (
//                         <div key={exam.id} className="bg-card rounded-2xl border border-border shadow-card hover:shadow-elevated p-6 transition-all group">
//                             <div className="flex justify-between items-start mb-4">
//                                 <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${getStatusColor(exam.status)}`}>
//                                     {exam.status}
//                                 </span>
//                                 <div className="flex items-center gap-2">
//                                     <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
//                                         <CheckCircle2 className="w-3.5 h-3.5" />
//                                         {exam.totalMarks} Marks
//                                     </div>
//                                     <Button
//                                             variant="ghost"
//                                             size="icon"
//                                             className="text-destructive hover:bg-destructive/10"
//                                             onClick={() => setExamToDelete({ id: exam.id, title: exam.title })}
//                                         >
//                                             <Trash2 className="w-4 h-4" />
//                                         </Button>
//                                 </div>
//                             </div>

//                             <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
//                                 {exam.title}
//                             </h3>

//                             <div className="space-y-2.5 mb-6">
//                                 <div className="flex items-center text-sm text-muted-foreground">
//                                     <Clock className="w-4 h-4 mr-2" />
//                                     {exam.duration} Minutes
//                                 </div>
//                                 <div className="flex items-center text-sm text-muted-foreground">
//                                     <Calendar className="w-4 h-4 mr-2" />
//                                     {exam.startTime && !isNaN(new Date(exam.startTime).getTime())
//                                         ? format(new Date(exam.startTime), "MMM d, h:mm a")
//                                         : "No date set"}
//                                 </div>
//                             </div>

//                             <div className="flex flex-col gap-2">
//                                 <div className="flex gap-2">
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             className="flex-1"
//                                             onClick={() => copyLink(exam.id)}
//                                         >
//                                             <LinkIcon className="w-3.5 h-3.5 mr-2" />
//                                             Share Link
//                                         </Button>
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             className="flex-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
//                                             onClick={() => setRescheduleData({ id: exam.id, title: exam.title, startTime: exam.startTime, duration: exam.duration })}
//                                         >
//                                             <Calendar className="w-3.5 h-3.5 mr-2" />
//                                             Reschedule
//                                         </Button>
//                                 </div>
//                                 {exam.sebConfigId && (
//                                     <div className="flex gap-2">
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
//                                             onClick={() => copySebLink(exam.id)}
//                                         >
//                                             <ShieldCheck className="w-3.5 h-3.5 mr-2" />
//                                             SEB Link
//                                         </Button>
//                                     </div>
//                                 )}
//                                 <div className="flex gap-2">
//                                     <Link href={`/admin/add-questions/${exam.id}`} className="flex-1">
//                                         <Button size="sm" className="w-full">
//                                             <ExternalLink className="w-3.5 h-3.5 mr-2" />
//                                             Manage
//                                         </Button>
//                                     </Link>
//                                 </div>
//                                 <Link href={`/admin/edit-exam/${exam.id}`}>
//                                     <Button variant="outline" size="sm" className="w-full mt-2">
//                                         Edit Details
//                                     </Button>
//                                 </Link>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             <AlertDialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
//                 <AlertDialogContent>
//                     <AlertDialogHeader>
//                         <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//                         <AlertDialogDescription>
//                             This will permanently delete the exam <strong>{examToDelete?.title}</strong>,
//                             including all its questions and student submissions. This action cannot be undone.
//                         </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter>
//                         <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
//                         <AlertDialogAction
//                             onClick={(e) => {
//                                 e.preventDefault();
//                                 handleDelete();
//                             }}
//                             className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                             disabled={isDeleting}
//                         >
//                             {isDeleting ? "Deleting..." : "Delete Exam"}
//                         </AlertDialogAction>
//                     </AlertDialogFooter>
//                 </AlertDialogContent>
//             </AlertDialog>

//             <Dialog open={!!rescheduleData} onOpenChange={(open) => !open && setRescheduleData(null)}>
//                 <DialogContent className="sm:max-w-md">
//                     <DialogHeader>
//                         <DialogTitle>Reschedule Exam</DialogTitle>
//                         <DialogDescription>
//                             Change the operational window for <strong>{rescheduleData?.title}</strong>. This updates the validity period of the existing test link automatically.
//                         </DialogDescription>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="reschedule-start" className="text-right">
//                                 New Start Time
//                             </Label>
//                             <Input
//                                 id="reschedule-start"
//                                 type="datetime-local"
//                                 value={rescheduleData?.startTime || ""}
//                                 onChange={(e) => setRescheduleData(prev => prev ? { ...prev, startTime: e.target.value } : null)}
//                                 className="w-full"
//                             />
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="reschedule-duration" className="text-right">
//                                 Duration (Minutes)
//                             </Label>
//                             <div className="relative">
//                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                                <Input
//                                    id="reschedule-duration"
//                                    type="number"
//                                    value={rescheduleData?.duration || ""}
//                                    onChange={(e) => setRescheduleData(prev => prev ? { ...prev, duration: parseInt(e.target.value) || 0 } : null)}
//                                    className="pl-10 w-full"
//                                />
//                             </div>
//                         </div>
//                     </div>
//                     <DialogFooter>
//                         <Button variant="outline" onClick={() => setRescheduleData(null)} disabled={isRescheduling}>Cancel</Button>
//                         <Button onClick={handleReschedule} disabled={isRescheduling} className="bg-amber-600 hover:bg-amber-700 text-white">
//                             {isRescheduling ? "Updating..." : "Confirm Schedule"}
//                         </Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// };

// export default ExamPage;

"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { deleteExamThunk, updateExamThunk } from "@/store/slices/examSlice";
import {
  FilePlus,
  Link as LinkIcon,
  ExternalLink,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Trash2,
  ShieldCheck,
  MoreVertical,
  Pencil,
  Copy,
  RefreshCw,
  BookOpen,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// ── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<
  string,
  { dot: string; badge: string; label: string }
> = {
  active: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    label: "Active",
  },
  upcoming: {
    dot: "bg-amber-500",
    badge:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    label: "Upcoming",
  },
  completed: {
    dot: "bg-slate-400",
    badge:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    label: "Completed",
  },
};

// ── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
const ExamPage = () => {
  const exams = useAppSelector((state) => state.exam.exams);
  const dispatch = useAppDispatch();
  
  const deleteExam = async (id: string) => {
    try {
      await dispatch(deleteExamThunk(id)).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  const updateExam = async (exam: any) => {
    try {
      await dispatch(updateExamThunk(exam)).unwrap();
      return true;
    } catch {
      return false;
    }
  };
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [examToDelete, setExamToDelete] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const [rescheduleData, setRescheduleData] = React.useState<{
    id: string;
    title: string;
    startTime: string;
    duration: number;
  } | null>(null);
  const [isRescheduling, setIsRescheduling] = React.useState(false);

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/exam/${id}`);
    toast.success("Exam link copied!");
  };

  const copySebLink = (id: string) => {
    const link = `sebs://${window.location.host}/api/seb/config/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("SEB launch link copied!", {
      description: "Students can click this to open the exam directly in SEB.",
    });
  };

  const handleDelete = async () => {
    if (!examToDelete) return;
    setIsDeleting(true);
    const success = await deleteExam(examToDelete.id);
    setIsDeleting(false);
    if (success) {
      toast.success("Exam deleted");
      setExamToDelete(null);
    } else {
      toast.error("Failed to delete exam");
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData) return;
    setIsRescheduling(true);
    const examObj = exams.find((e) => e.id === rescheduleData.id);
    if (!examObj) return;

    const start = new Date(rescheduleData.startTime);
    const end = new Date(start.getTime() + rescheduleData.duration * 60000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const endTimeString = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;

    const success = await updateExam({
      ...examObj,
      startTime: rescheduleData.startTime,
      duration: rescheduleData.duration,
      endTime: endTimeString,
      status: "upcoming" as const,
    });
    setIsRescheduling(false);

    if (success) {
      toast.success(
        `Rescheduled to ${new Date(rescheduleData.startTime).toLocaleString()}`,
      );
      setRescheduleData(null);
    } else {
      toast.error("Failed to reschedule exam");
    }
  };

  return (
    <div className="w-full min-h-screen animate-fade-in pb-16 px-4 sm:px-6">
      {/* ── Header ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-none">
              Exams
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and monitor all your examinations
            </p>
          </div>
        </div>
        <Button
          asChild
          className="h-10 px-7 rounded-sm  font-bold text-sm shadow-md shadow-primary/20 shrink-0"
        >
          <Link href="/admin/create-exam">
            <FilePlus className="w-4 h-4 mr-1.5" />
            Create Exam
          </Link>
        </Button>
      </div>

      {/* ── Empty state ──────────────────────── */}
      {exams.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-muted/10">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-bold text-muted-foreground">No exams yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-5">
            Create your first examination to get started.
          </p>
          <Button
            asChild
            size="sm"
            className="rounded-sm h-9 px-5 font-bold text-xs"
          >
            <Link href="/admin/create-exam">
              <FilePlus className="w-3.5 h-3.5 mr-1.5" />
              Create Exam
            </Link>
          </Button>
        </div>
      ) : (
        /* ── Exam grid ───────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {exams.map((exam) => {
            const sc = statusConfig[exam.status] ?? statusConfig.upcoming;
            return (
              <Card
                key={exam.id}
                className="group relative flex flex-col p-5 rounded-2xl border border-border bg-card
                           hover:border-border/80 hover:shadow-lg hover:shadow-black/5
                           hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                {/* Live pulse for active */}
                {exam.status === "active" && (
                  <span className="absolute top-4 right-14 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}

                {/* ── Card header ────────────── */}
                <div className="flex items-start justify-between mb-4">
                  <span
                    className={cn(
                      "text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border tracking-wider",
                      sc.badge,
                    )}
                  >
                    {sc.label}
                  </span>

                  {/* Actions dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground -mr-1 -mt-0.5"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => copyLink(exam.id)}
                        className="cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      {exam.sebConfigId && (
                        <DropdownMenuItem
                          onClick={() => copySebLink(exam.id)}
                          className="cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                          Copy SEB Link
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                          setRescheduleData({
                            id: exam.id,
                            title: exam.title,
                            startTime: exam.startTime,
                            duration: exam.duration,
                          })
                        }
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-2" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() =>
                          setExamToDelete({ id: exam.id, title: exam.title })
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* ── Title ──────────────────── */}
                <h3 className="text-base font-bold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {exam.title}
                </h3>

                {/* ── Meta chips ─────────────── */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-5">
                  <StatChip icon={Clock} label={`${exam.duration} min`} />
                  <StatChip
                    icon={CheckCircle2}
                    label={`${exam.totalMarks} marks`}
                  />
                  <StatChip
                    icon={Calendar}
                    label={
                      exam.startTime &&
                      !isNaN(new Date(exam.startTime).getTime())
                        ? format(new Date(exam.startTime), "MMM d, h:mm a")
                        : "No date set"
                    }
                  />
                  {exam.sebConfigId && (
                    <StatChip icon={ShieldCheck} label="SEB" />
                  )}
                </div>

                {/* ── Actions ────────────────── */}
                <div className="mt-auto flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 h-9 rounded-xl font-bold text-xs shadow-sm shadow-primary/20"
                  >
                    <Link href={`/admin/add-questions/${exam.id}`}>
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Manage
                    </Link>
                  </Button>
                  {/* <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-xl text-xs font-semibold"
                  >
                    <Link href={`/admin/edit-exam/${exam.id}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                  </Button> */}
                  {/* <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-xl text-xs font-semibold"
                    onClick={() => copyLink(exam.id)}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </Button> */}
                  <Button
                    size="sm"
                    className="flex-1 h-9 rounded-xl font-bold text-xs shadow-sm shadow-primary/20 cursor-pointer"
                    onClick={() => copyLink(exam.id)}
                  >
                    <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                    Copy Link
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Delete dialog ─────────────────────── */}
      <AlertDialog
        open={!!examToDelete}
        onOpenChange={(open) => !open && setExamToDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this exam?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{examToDelete?.title}</strong> and all its questions and
              student submissions will be permanently removed. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reschedule dialog ─────────────────── */}
      <Dialog
        open={!!rescheduleData}
        onOpenChange={(open) => !open && setRescheduleData(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reschedule Exam</DialogTitle>
            <DialogDescription>
              Update the operational window for{" "}
              <strong>{rescheduleData?.title}</strong>. The existing exam link
              will continue to work with the new schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="reschedule-start"
                className="text-sm font-semibold"
              >
                New Start Time
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="reschedule-start"
                  type="datetime-local"
                  value={rescheduleData?.startTime || ""}
                  onChange={(e) =>
                    setRescheduleData((prev) =>
                      prev ? { ...prev, startTime: e.target.value } : null,
                    )
                  }
                  className="pl-9 h-11"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="reschedule-duration"
                className="text-sm font-semibold"
              >
                Duration (minutes)
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="reschedule-duration"
                  type="number"
                  value={rescheduleData?.duration || ""}
                  onChange={(e) =>
                    setRescheduleData((prev) =>
                      prev
                        ? { ...prev, duration: parseInt(e.target.value) || 0 }
                        : null,
                    )
                  }
                  className="pl-9 h-11"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRescheduleData(null)}
              disabled={isRescheduling}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={isRescheduling}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold shadow-sm shadow-amber-500/20"
            >
              {isRescheduling ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Confirm Schedule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamPage;
