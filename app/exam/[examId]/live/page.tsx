// "use client";

// import { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { ModeToggle } from "@/components/pageComponents/ModeToggle";
// import {
//   AlertTriangle,
//   ChevronLeft,
//   ChevronRight,
//   Send,
//   Lock,
//   ShieldAlert,
//   ShieldCheck,
//   Timer as TimerIcon,
//   HelpCircle,
//   ClipboardList,
// } from "lucide-react";
// import { toast } from "sonner";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useAppSelector, useAppDispatch } from "@/store/hooks";
// import {
//   addResultThunk,
//   setLastResult,
//   setExamSession,
//   updateExamSession,
//   clearExamSession,
//   logoutStudent,
// } from "@/store/slices/examSlice";
// import QuestionCard from "@/components/QuestionCard";
// import Timer from "@/components/Timer";
// import AIProctor from "@/components/proctoring/AIProctor";
// import PreExamCheck from "@/components/exam/PreExamCheck";
// import { useSession } from "next-auth/react";

// function shuffleArray<T>(arr: T[]): T[] {
//   const a = [...arr];
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// }

// export default function LiveExamPage() {
//   const { examId } = useParams();
//   const exams = useAppSelector((state) => state.exam.exams);
//   const student = useAppSelector((state) => state.exam.student);
//   const loading = useAppSelector((state) => state.exam.loading);
//   const examSession = useAppSelector((state) => state.exam.examSession);
//   const dispatch = useAppDispatch();
//   const addResult = async (data: any) => {
//     try {
//       await dispatch(addResultThunk(data)).unwrap();
//       return true;
//     } catch {
//       return false;
//     }
//   };
//   const router = useRouter();
//   const exam = exams.find((e) => e.id === examId);

//   const [preCheck, setPreCheck] = useState(true);
//   const [isSeb, setIsSeb] = useState(true);

//   // SEB Detection
//   useEffect(() => {
//     if (exam?.sebConfigId) {
//       const ua = navigator.userAgent;
//       const isSebBrowser =
//         ua.includes("SEB") || (window as any).SafeExamBrowser;
//       setIsSeb(!!isSebBrowser);
//     } else {
//       setIsSeb(true);
//     }
//   }, [exam]);

//   const isSubmittingRef = useRef(false);
//   const startTime = useMemo(() => Date.now(), []);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showFullscreenEnforcer, setShowFullscreenEnforcer] = useState(false);
//   const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
//   const lastViolationTimeRef = useRef<number>(0);
//   const VIOLATION_COOLDOWN = 30000; // 30 seconds cooldown

//   const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);
//   const [currentQ, setCurrentQ] = useState(0);
//   const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
//   const [answers, setAnswers] = useState<
//     Record<string, number | number[] | string>
//   >({});
//   const [justifications, setJustifications] = useState<Record<string, string>>(
//     {},
//   );
//   const [markedForReview, setMarkedForReview] = useState<Set<string>>(
//     new Set(),
//   );
//   const [visited, setVisited] = useState<Set<string>>(new Set());
//   const [violations, setViolations] = useState(0);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [isDataLoaded, setIsDataLoaded] = useState(false);

//   const sectionGroups = useMemo(() => {
//     const groups: Record<
//       string,
//       { startIndex: number; count: number; questions: any[] }
//     > = {};
//     shuffledQuestions.forEach((q, idx) => {
//       const s = q.section || "General";
//       if (!groups[s]) {
//         groups[s] = { startIndex: idx, count: 0, questions: [] };
//       }
//       groups[s].count++;
//       groups[s].questions.push({ ...q, globalIndex: idx });
//     });
//     return groups;
//   }, [shuffledQuestions]);

//   const orderedSectionNames = useMemo(
//     () => Object.keys(sectionGroups),
//     [sectionGroups],
//   );
//   const activeSection = orderedSectionNames[currentSectionIndex] || "General";

//   // Load / Initialize exam state
//   useEffect(() => {
//     if (!exam || !student || isDataLoaded) return;

//     // Try to restore from Redux examSession
//     if (
//       examSession &&
//       examSession.storageKey === `exam_prog_${examId}_${student.usn}`
//     ) {
//       // Reconstruct shuffledQuestions from IDs
//       const restored = examSession.shuffledQuestionIds
//         .map((id: string) => exam.questions.find((q) => q.id === id))
//         .filter(Boolean);

//       if (restored.length > 0) {
//         setShuffledQuestions(restored);
//         setAnswers(examSession.answers || {});
//         setVisited(new Set(examSession.visited || []));
//         setMarkedForReview(new Set(examSession.markedForReview || []));
//         setViolations(examSession.violations || 0);
//         setCurrentQ(examSession.currentQ || 0);
//         setCurrentSectionIndex(examSession.currentSectionIndex || 0);
//         setPreCheck(false);
//         setIsDataLoaded(true);
//         return;
//       }
//     }

//     // Default Initialization (Shuffle)
//     const pools: Record<string, typeof exam.questions> = {};
//     exam.questions.forEach((q) => {
//       const s = (q.section || "General").toLowerCase().trim();
//       if (!pools[s]) pools[s] = [];
//       pools[s].push(q);
//     });

//     let selected: typeof exam.questions = [];
//     const usedIds = new Set<string>();

//     if (exam.sectionsConfig && exam.sectionsConfig.length > 0) {
//       // 1. Pick based on config
//       exam.sectionsConfig.forEach((config: any) => {
//         const configName = config.name.toLowerCase().trim();
//         const pool = pools[configName] || [];
//         const count = Math.min(config.pickCount, pool.length);
//         const shuffledPool = shuffleArray(pool);
//         const subset = shuffledPool.slice(0, count);
//         subset.forEach((q) => usedIds.add(q.id));
//         selected = [
//           ...selected,
//           ...subset.map((q) => ({ ...q, section: config.name })),
//         ];
//       });

//       // 2. Include all leftover questions (ensures total questions match admin)
//       const leftovers = exam.questions.filter((q) => !usedIds.has(q.id));
//       if (leftovers.length > 0) {
//         selected = [...selected, ...shuffleArray(leftovers)];
//       }
//     } else {
//       selected = shuffleArray(exam.questions);
//     }

//     setShuffledQuestions(selected);
//     setIsDataLoaded(true);
//   }, [exam, student, examSession, isDataLoaded]);

//   // Auto-Save Effect
//   useEffect(() => {
//     if (
//       !isDataLoaded ||
//       !student ||
//       !examId ||
//       submitted ||
//       !shuffledQuestions.length
//     )
//       return;

//     const sessionData = {
//       storageKey: `exam_prog_${examId}_${student.usn}`,
//       shuffledQuestionIds: shuffledQuestions.map((q) => q.id),
//       answers,
//       visited: Array.from(visited),
//       markedForReview: Array.from(markedForReview),
//       violations,
//       currentQ,
//       currentSectionIndex,
//     };

//     dispatch(updateExamSession(sessionData));
//   }, [
//     shuffledQuestions,
//     answers,
//     visited,
//     markedForReview,
//     violations,
//     currentQ,
//     currentSectionIndex,
//     isDataLoaded,
//     submitted,
//     dispatch,
//     student,
//     examId,
//   ]);

//   // Initial fullscreen check
//   useEffect(() => {
//     const check = () => {
//       const isCurrentlyFullscreen = !!(
//         document.fullscreenElement ||
//         (document as any).webkitFullscreenElement ||
//         (document as any).mozFullScreenElement ||
//         (document as any).msFullscreenElement
//       );
//       setIsFullscreen(isCurrentlyFullscreen);
//     };
//     check();
//   }, []);

//   // Fullscreen detection and violation
//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       const isCurrentlyFullscreen = !!(
//         document.fullscreenElement ||
//         (document as any).webkitFullscreenElement ||
//         (document as any).mozFullScreenElement ||
//         (document as any).msFullscreenElement
//       );

//       setIsFullscreen(isCurrentlyFullscreen);
//       if (isCurrentlyFullscreen) {
//         setShowFullscreenEnforcer(false);
//       }

//       // Fullscreen enforcement is MANDATORY even if AI proctoring is disabled
//       if (
//         !isCurrentlyFullscreen &&
//         !submitted &&
//         !preCheck &&
//         !isSubmittingRef.current
//       ) {
//         setShowFullscreenEnforcer(true);

//         const now = Date.now();
//         const isProctored = !!exam?.proctoringEnabled;
//         const cooldownActive =
//           isProctored &&
//           now - lastViolationTimeRef.current < VIOLATION_COOLDOWN;

//         if (!cooldownActive) {
//           lastViolationTimeRef.current = now;
//           setViolations((v) => {
//             const next = v + 1;
//             const maxV = exam?.maxViolations || 3;
//             toast.error(
//               `⚠️ Security breach: Fullscreen exited! Violation ${next}/${maxV}`,
//               {
//                 description:
//                   "Please return to fullscreen immediately to avoid disqualification.",
//               },
//             );
//             return next;
//           });
//         } else {
//           toast.warning("Please return to fullscreen immediately!", {
//             description:
//               "You have exited fullscreen mode. This is a rule violation.",
//           });
//         }
//       }
//     };

//     const events = [
//       "fullscreenchange",
//       "webkitfullscreenchange",
//       "mozfullscreenchange",
//       "MSFullscreenChange",
//     ];
//     events.forEach((event) =>
//       document.addEventListener(event, handleFullscreenChange),
//     );

//     return () => {
//       events.forEach((event) =>
//         document.removeEventListener(event, handleFullscreenChange),
//       );
//     };
//   }, [submitted, preCheck, exam?.proctoringEnabled]);

//   // Proactive fullscreen check for session resume
//   useEffect(() => {
//     if (!preCheck && !submitted && !isFullscreen && !isSubmittingRef.current) {
//       setShowFullscreenEnforcer(true);
//     }
//   }, [preCheck, submitted, isFullscreen]);

//   const enterFullscreen = useCallback(() => {
//     const el = document.documentElement as any;
//     const requestMethod =
//       el.requestFullscreen ||
//       el.webkitRequestFullScreen ||
//       el.mozRequestFullScreen ||
//       el.msRequestFullscreen;

//     if (requestMethod) {
//       requestMethod
//         .call(el)
//         .then(() => {
//           setShowFullscreenEnforcer(false);
//         })
//         .catch((err: any) => {
//           console.error("Fullscreen error:", err);
//           toast.error(
//             "Failed to enter fullscreen. Please enable it in browser settings.",
//           );
//         });
//     }
//   }, []);

//   const submitExam = useCallback(
//     async (isTimeout = false, finalViolations?: number) => {
//       if (submitted || isSubmittingRef.current || !exam) return;

//       if (!student) {
//         toast.error(
//           "Session Error: Student identity missing. Please refresh the page.",
//         );
//         return;
//       }

//       isSubmittingRef.current = true;
//       setIsSubmitting(true);
//       setSubmitted(true);

//       console.log("Exam submission triggered", {
//         isTimeout,
//         finalViolations,
//         currentViolations: violations,
//       });

//       const actualViolations =
//         finalViolations !== undefined ? finalViolations : violations;
//       const isProctored = !!exam.proctoringEnabled;

//       if (isTimeout) {
//         toast.info("Time is up! Your exam is being submitted automatically.", {
//           duration: 5000,
//         });
//       }

//       let correctCount = 0;
//       let wrongCount = 0;
//       let totalObtained = 0;
//       const sectionalResults: Record<string, number> = {};

//       const posMarks = exam.positiveMarks ?? 1;
//       const negMarks = parseFloat(exam.negativeMarks ?? "0");

//       shuffledQuestions.forEach((q) => {
//         const ans = answers[q.id];
//         const section = q.section || "General";
//         if (!sectionalResults[section]) sectionalResults[section] = 0;

//         let isCorrect = false;
//         if (q.type === "msq") {
//           const correctIndices = q.correctAnswer
//             .split(",")
//             .map((i: string) => parseInt(i))
//             .sort();
//           if (
//             Array.isArray(ans) &&
//             ans.length === correctIndices.length &&
//             [...ans]
//               .sort((a, b) => a - b)
//               .every((val, idx) => val === correctIndices[idx])
//           ) {
//             isCorrect = true;
//           }
//         } else if (q.type === "text") {
//           if (
//             typeof ans === "string" &&
//             ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
//           ) {
//             isCorrect = true;
//           }
//         } else {
//           if (String(ans) === q.correctAnswer) {
//             isCorrect = true;
//           }
//         }

//         if (isCorrect) {
//           correctCount++;
//           const marksEarned = posMarks;
//           totalObtained += marksEarned;
//           sectionalResults[section] =
//             (sectionalResults[section] || 0) + marksEarned;
//         } else if (ans !== undefined) {
//           // Only deduct if an answer was provided (not for skipped)
//           wrongCount++;
//           totalObtained -= negMarks;
//           sectionalResults[section] =
//             (sectionalResults[section] || 0) - negMarks;
//         }
//       });

//       const score = totalObtained; // Negative marks are now allowed to reflect below 0

//       const success = await addResult({
//         id: `r-${Date.now()}`,
//         examId: exam.id,
//         studentName: student.name,
//         usn: student.usn,
//         email: student.email,
//         class: student.class,
//         year: student.year,
//         section: student.section,
//         score,
//         violations: actualViolations,
//         sectionScores: sectionalResults,
//         answers,
//         justifications,
//         totalMarks: exam.totalMarks,
//         submittedAt: new Date(),
//       } as any);

//       if (!success) {
//         isSubmittingRef.current = false;
//         setIsSubmitting(false);
//         setSubmitted(false);
//         return;
//       }

//       dispatch(
//         setLastResult({
//           score,
//           totalMarks: exam.totalMarks,
//           correct: correctCount,
//           wrong: wrongCount,
//           violations: actualViolations,
//           sectionScores: sectionalResults,
//           answers,
//           justifications,
//           questions: shuffledQuestions,
//         }),
//       );

//       // Clear persistent session
//       dispatch(clearExamSession());

//       // Immediate redirect to avoid proctoring staying active
//       router.replace(`/exam/${examId}/result`);
//     },
//     [
//       submitted,
//       isSubmitting, // Added dependency
//       exam,
//       student,
//       answers,
//       shuffledQuestions,
//       violations,
//       addResult,
//       router,
//       examId,
//       dispatch,
//     ],
//   );

//   const handleAIViolation = useCallback(
//     (reason: string, points: number) => {
//       if (submitted || isSubmittingRef.current) return;

//       const now = Date.now();
//       if (now - lastViolationTimeRef.current > VIOLATION_COOLDOWN) {
//         lastViolationTimeRef.current = now;
//         setViolations((v) => {
//           const next = v + 1;
//           const maxV = exam?.maxViolations || 3;
//           toast.error(`⚠️ AI Detection: ${reason}! Violation ${next}/${maxV}`, {
//             description: "Please maintain proper exam conduct.",
//           });
//           return next;
//         });
//       } else {
//         console.log(
//           "AI Violation detected but suppressed due to cooldown:",
//           reason,
//         );
//       }
//     },
//     [submitted],
//   );

//   const markForReviewAndNext = useCallback(() => {
//     const qId = shuffledQuestions[currentQ].id;
//     setMarkedForReview((prev) => {
//       const next = new Set(prev);
//       if (next.has(qId)) next.delete(qId);
//       else next.add(qId);
//       return next;
//     });
//     if (currentQ < shuffledQuestions.length - 1) {
//       const nextIndex = currentQ + 1;
//       setCurrentQ(nextIndex);
//       setVisited((prev) => new Set(prev).add(shuffledQuestions[nextIndex].id));
//     }
//   }, [currentQ, shuffledQuestions]);

//   const clearResponse = useCallback(() => {
//     const qId = shuffledQuestions[currentQ].id;
//     setAnswers((prev) => {
//       const next = { ...prev };
//       delete next[qId];
//       return next;
//     });
//     setMarkedForReview((prev) => {
//       const next = new Set(prev);
//       next.delete(qId);
//       return next;
//     });
//   }, [currentQ, shuffledQuestions]);

//   const handleSectionTimeUp = useCallback(() => {
//     if (currentSectionIndex < orderedSectionNames.length - 1) {
//       const nextSectionName = orderedSectionNames[currentSectionIndex + 1];
//       const nextIndex = sectionGroups[nextSectionName].startIndex;
//       setCurrentSectionIndex((v) => v + 1);
//       setCurrentQ(nextIndex);
//       setVisited((prev) => new Set(prev).add(shuffledQuestions[nextIndex].id));
//       toast.success(`Section timeout: Moving to ${nextSectionName}`);
//     } else {
//       submitExam(true);
//     }
//   }, [
//     currentSectionIndex,
//     orderedSectionNames,
//     sectionGroups,
//     shuffledQuestions,
//     submitExam,
//   ]);

//   const navigateTo = useCallback(
//     (index: number) => {
//       const targetQ = shuffledQuestions[index];
//       const targetSection = targetQ?.section || "General";

//       if (targetSection !== activeSection) {
//         const targetSectionIndex = orderedSectionNames.indexOf(targetSection);

//         if (exam?.strictSectionTiming) {
//           toast.warning(
//             "Sectional timing active: You cannot manually switch sections.",
//           );
//           return;
//         }

//         if (exam?.sectionalNavigation === "forward-only") {
//           if (targetSectionIndex < currentSectionIndex) {
//             toast.warning(
//               "Forward-only navigation: You cannot move to a previous section.",
//             );
//             return;
//           }
//           // If they want to move forward, we allow it but it's "permanent"
//           setCurrentSectionIndex(targetSectionIndex);
//         } else {
//           // Free navigation
//           setCurrentSectionIndex(targetSectionIndex);
//         }
//       }

//       setCurrentQ(index);
//       setVisited((prev) => new Set(prev).add(shuffledQuestions[index].id));
//     },
//     [
//       shuffledQuestions,
//       activeSection,
//       orderedSectionNames,
//       currentSectionIndex,
//       exam?.strictSectionTiming,
//       exam?.sectionalNavigation,
//     ],
//   );

//   const saveAndNext = useCallback(() => {
//     const sectionEnd =
//       sectionGroups[activeSection].startIndex +
//       sectionGroups[activeSection].count -
//       1;

//     if (currentQ < sectionEnd) {
//       const nextIndex = currentQ + 1;
//       setCurrentQ(nextIndex);
//       setVisited((prev) => new Set(prev).add(shuffledQuestions[nextIndex].id));
//     } else {
//       if (currentSectionIndex < orderedSectionNames.length - 1) {
//         // Enforce strict sectional timing
//         if (exam?.strictSectionTiming) {
//           toast.info(
//             "Strict Timings Enabled: Please wait for the current section's timer to expire to proceed.",
//             { duration: 4000 },
//           );
//           return;
//         }

//         // Move to next section
//         const nextSectionName = orderedSectionNames[currentSectionIndex + 1];
//         const nextIndex = sectionGroups[nextSectionName].startIndex;
//         setCurrentSectionIndex((v) => v + 1);
//         setCurrentQ(nextIndex);
//         setVisited((prev) =>
//           new Set(prev).add(shuffledQuestions[nextIndex].id),
//         );
//         toast.success(`Proceeding to section: ${nextSectionName}`);
//       } else {
//         setShowConfirm(true);
//       }
//     }
//   }, [
//     currentQ,
//     currentSectionIndex,
//     orderedSectionNames,
//     sectionGroups,
//     shuffledQuestions,
//     activeSection,
//     exam?.strictSectionTiming,
//   ]);

//   // Handle violation limit
//   useEffect(() => {
//     const maxV = exam?.maxViolations || 3;
//     if (violations >= maxV && !submitted && !isSubmitting) {
//       submitExam(false, violations);
//     }
//   }, [violations, submitted, isSubmitting, submitExam, exam?.maxViolations]);

//   // Check for existing submission on mount
//   useEffect(() => {
//     // Initial visited update only if not loaded from storage
//     if (shuffledQuestions.length > 0 && visited.size === 0) {
//       setVisited((prev) => new Set(prev).add(shuffledQuestions[0].id));
//     }

//     if (student && examId && !submitted) {
//       const checkSubmission = async () => {
//         try {
//           const resp = await fetch(
//             `/api/results/my-result?examId=${examId}&usn=${student.usn}`,
//           );
//           if (resp.ok) {
//             const { found } = await resp.json();
//             if (found) {
//               toast.info("You have already submitted this exam.");
//               router.push(`/exam/${examId}/result`);
//             }
//           }
//         } catch (err) {
//           console.error("Failed to check submission status:", err);
//         }
//       };
//       checkSubmission();
//     }
//   }, [student, examId, router, submitted, shuffledQuestions]);

//   // Proctoring: tab visibility
//   useEffect(() => {
//     const handler = () => {
//       // Tab switching counts as a violation for ALL exams if they are in live mode
//       if (
//         document.hidden &&
//         !submitted &&
//         !preCheck &&
//         !isSubmittingRef.current
//       ) {
//         const now = Date.now();
//         const isProctored = !!exam?.proctoringEnabled;
//         const cooldownActive =
//           isProctored &&
//           now - lastViolationTimeRef.current < VIOLATION_COOLDOWN;

//         if (!cooldownActive) {
//           lastViolationTimeRef.current = now;
//           setViolations((v) => {
//             const next = v + 1;
//             const maxV = exam?.maxViolations || 3;
//             toast.error(`⚠️ Tab switch detected! Violation ${next}/${maxV}`);
//             return next;
//           });
//         } else {
//           toast.warning("Tab switch detected!", {
//             description: "Please stay on the exam tab.",
//           });
//         }
//       }
//     };
//     document.addEventListener("visibilitychange", handler);
//     return () => document.removeEventListener("visibilitychange", handler);
//   }, [submitted, submitExam, preCheck]);

//   // Proctoring: disable copy/paste/right-click
//   useEffect(() => {
//     const prevent = (e: Event) => e.preventDefault();
//     document.addEventListener("copy", prevent);
//     document.addEventListener("paste", prevent);
//     document.addEventListener("contextmenu", prevent);
//     const keyHandler = (e: KeyboardEvent) => {
//       if (
//         (e.ctrlKey || e.metaKey) &&
//         ["c", "v", "a", "x"].includes(e.key.toLowerCase())
//       )
//         e.preventDefault();
//     };
//     document.addEventListener("keydown", keyHandler);
//     return () => {
//       document.removeEventListener("copy", prevent);
//       document.removeEventListener("paste", prevent);
//       document.removeEventListener("contextmenu", prevent);
//       document.removeEventListener("keydown", keyHandler);
//     };
//   }, []);

//   // Cleanup stream and fullscreen on unmount
//   useEffect(() => {
//     return () => {
//       if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
//       if (activeStream) {
//         activeStream.getTracks().forEach((t) => t.stop());
//       }
//     };
//   }, [activeStream]);

//   // sectionGroups logic moved to top

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center font-bold text-primary animate-pulse">
//         Loading exam…
//       </div>
//     );
//   if (!exam)
//     return (
//       <div className="p-20 text-center text-destructive font-bold">
//         Exam not found
//       </div>
//     );
//   if (!student)
//     return (
//       <div className="p-20 text-center text-destructive font-bold">
//         Student session not found. Please register again.
//       </div>
//     );
//   // Data not yet initialized by useEffect — show loading instead of "no questions"
//   if (!isDataLoaded)
//     return (
//       <div className="min-h-screen flex items-center justify-center font-bold text-primary animate-pulse">
//         Preparing exam…
//       </div>
//     );
//   if (shuffledQuestions.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background p-6">
//         <div className="text-center space-y-4">
//           <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto" />
//           <p className="text-muted-foreground font-medium">
//             No questions available for this exam.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (preCheck) {
//     return (
//       <PreExamCheck
//         examTitle={exam.title}
//         proctoringEnabled={!!exam.proctoringEnabled}
//         proctoringAudioEnabled={!!exam.proctoringAudioEnabled}
//         proctoringVideoEnabled={!!exam.proctoringVideoEnabled}
//         onProceed={(stream: MediaStream | null) => {
//           if (stream) setActiveStream(stream);
//           enterFullscreen();
//           setPreCheck(false);
//         }}
//       />
//     );
//   }

//   const question = shuffledQuestions[currentQ];
//   // activeSection is already defined at top level now

//   const getSectionProgress = (sectionName: string) => {
//     const group = sectionGroups[sectionName];
//     if (!group) return { answered: 0, total: 0 };
//     const answered = group.questions.filter(
//       (q) => answers[q.id] !== undefined,
//     ).length;
//     return { answered, total: group.count };
//   };

//   return (
//     <div className="h-screen bg-muted/20 flex flex-col overflow-hidden animate-fade-in">
//       <header className="h-20 bg-background border-b border-border shadow-sm sticky top-0 z-[60]">
//         <div className="max-w-[1600px] mx-auto h-full px-6 flex items-center justify-between">
//           <div className="flex items-center gap-6">
//             <div className="flex flex-col">
//               <h1 className="font-bold text-lg leading-tight truncate max-w-[300px]">
//                 {exam.title}
//               </h1>
//               <div className="flex items-center gap-2 mt-1">
//                 <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
//                   Q{currentQ + 1} / {shuffledQuestions.length}
//                 </span>
//                 {!!exam.proctoringEnabled && (
//                   <span className="text-[10px] bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
//                     <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse" />
//                     Neural Monitor Active
//                   </span>
//                 )}
//                 {(exam.positiveMarks !== undefined ||
//                   exam.negativeMarks !== undefined) && (
//                   <span className="text-[10px] bg-white dark:bg-slate-900 shadow-sm border border-border text-muted-foreground px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-3">
//                     <div className="flex items-center gap-1.5">
//                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
//                       <span className="text-emerald-600 dark:text-emerald-400">
//                         +{exam.positiveMarks ?? 1}
//                       </span>
//                     </div>
//                     <div className="w-[1px] h-3 bg-border" />
//                     <div className="flex items-center gap-1.5">
//                       <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
//                       <span className="text-red-600 dark:text-red-400">
//                         -{exam.negativeMarks ?? 0}
//                       </span>
//                     </div>
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-6">
//             <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-2xl border border-border">
//               <TimerIcon className="w-4 h-4 text-primary" />
//               {/* Reset timer per section using key */}
//               <Timer
//                 key={exam.strictSectionTiming ? activeSection : exam.id}
//                 durationSeconds={
//                   exam.strictSectionTiming
//                     ? (exam.sectionsConfig?.find(
//                         (s) => s.name === activeSection,
//                       )?.duration || 5) * 60
//                     : (exam.duration || 60) * 60
//                 }
//                 onTimeUp={
//                   exam.strictSectionTiming
//                     ? handleSectionTimeUp
//                     : () => submitExam(true)
//                 }
//               />
//             </div>
//             <ModeToggle />
//           </div>
//         </div>
//       </header>

//       <nav className="bg-white/80 dark:bg-card backdrop-blur-md border-b sticky top-20 z-50 shadow-sm">
//         <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-8 overflow-hidden">
//           {/* Section Tabs */}
//           <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth h-full">
//             {Object.keys(sectionGroups).map((name) => {
//               const { answered, total } = getSectionProgress(name);
//               const isActive = activeSection === name;
//               const sectionIndex = Object.keys(sectionGroups).indexOf(name);

//               // Navigation restrictions
//               let isDisabled = false;
//               if (exam?.strictSectionTiming) {
//                 isDisabled = !isActive;
//               } else if (exam?.sectionalNavigation === "forward-only") {
//                 isDisabled = sectionIndex < currentSectionIndex;
//               }

//               return (
//                 <button
//                   key={name}
//                   disabled={isDisabled}
//                   onClick={() => {
//                     if (!isDisabled) {
//                       const nextIndex = sectionGroups[name].startIndex;
//                       setCurrentSectionIndex(sectionIndex);
//                       setCurrentQ(nextIndex);
//                       setVisited((prev) =>
//                         new Set(prev).add(shuffledQuestions[nextIndex].id),
//                       );
//                     }
//                   }}
//                   className={`flex items-center gap-3 px-4 py-1.5 rounded-xl transition-all whitespace-nowrap ${isActive ? "bg-primary text-white shadow-lg" : isDisabled ? "opacity-20 cursor-not-allowed" : "text-muted-foreground hover:bg-muted"}`}
//                 >
//                   <div className="flex flex-col items-start translate-y-[1px]">
//                     <span className="text-[7px] font-black uppercase tracking-widest opacity-60">
//                       Section
//                     </span>
//                     <span className="text-xs font-black leading-none">
//                       {name}
//                     </span>
//                   </div>
//                   <div
//                     className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${isActive ? "bg-white/20" : "bg-muted"}`}
//                   >
//                     {answered}/{total}
//                   </div>
//                 </button>
//               );
//             })}
//           </div>

//           <div className="w-[1px] h-8 bg-border shrink-0 hidden md:block" />

//           {/* Question Navigation Map */}
//           <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-2">
//             {sectionGroups[activeSection]?.questions.map((q, idx) => {
//               const i = q.globalIndex;
//               const isCurrent = i === currentQ;
//               const isAnswered = answers[q.id] !== undefined;
//               const isMarked = markedForReview.has(q.id);
//               const isVis = visited.has(q.id);

//               let statusClass =
//                 "bg-muted/50 text-muted-foreground border-transparent";
//               if (isMarked) {
//                 statusClass = "bg-indigo-500 text-white border-indigo-600";
//                 if (isAnswered)
//                   statusClass += " ring-2 ring-emerald-500 ring-offset-2";
//               } else if (isAnswered) {
//                 statusClass = "bg-emerald-500 text-white border-emerald-600";
//               } else if (isVis) {
//                 statusClass = "bg-rose-500 text-white border-rose-600";
//               }

//               return (
//                 <button
//                   key={i}
//                   onClick={() => navigateTo(i)}
//                   className={`flex-shrink-0 w-7 h-7 rounded-lg text-[10px] font-black transition-all border-2 flex items-center justify-center relative ${statusClass} ${isCurrent ? "scale-110 shadow-lg z-10 border-primary ring-2 ring-primary/20" : "hover:border-primary/40 opacity-90"}`}
//                 >
//                   {i + 1}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </nav>

//       <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
//         {/* Main Question Area */}
//         <div className="lg:col-span-8 flex flex-col h-full gap-6 overflow-hidden">
//           <div className="bg-background rounded-3xl border border-border shadow-card flex-1 flex flex-col overflow-hidden relative">
//             {/* Header Info */}
//             <div className="px-8 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <ClipboardList className="w-4 h-4 text-primary" />
//                 <p className="font-bold text-sm text-foreground">
//                   {activeSection}
//                 </p>
//               </div>
//               <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
//                 {question.type === "mcq"
//                   ? "Multiple Choice Question"
//                   : question.type === "msq"
//                     ? "Multiple Select Question"
//                     : "Subjective Question"}
//               </div>
//             </div>

//             <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
//               <QuestionCard
//                 question={question}
//                 index={currentQ}
//                 total={shuffledQuestions.length}
//                 selectedAnswer={answers[question.id] ?? null}
//                 justification={justifications[question.id] ?? ""}
//                 onJustify={(text) =>
//                   setJustifications((prev) => ({
//                     ...prev,
//                     [question.id]: text,
//                   }))
//                 }
//                 onSelect={(val) => {
//                   if (question.type === "msq") {
//                     setAnswers((prev) => {
//                       const current = (prev[question.id] as number[]) || [];
//                       const i = val as number;
//                       const next = current.includes(i)
//                         ? current.filter((c) => c !== i)
//                         : [...current, i];
//                       return { ...prev, [question.id]: next };
//                     });
//                   } else {
//                     setAnswers((prev) => ({ ...prev, [question.id]: val }));
//                   }
//                   // Auto remove Mark For Review if answered? (Optional, let's keep it for now as per reference)
//                 }}
//               />

//               {/* Overlays (Fullscreen, SEB) omitted for brevity in this chunk, they remain in the file */}
//             </div>

//             {/* Bottom Actions */}
//             <div className="px-8 py-6 bg-muted/20 border-t border-border flex items-center justify-between gap-4">
//               <div className="flex items-center gap-3">
//                 <Button
//                   variant="outline"
//                   onClick={markForReviewAndNext}
//                   className={`rounded-xl px-6 font-bold border-2 transition-all ${markedForReview.has(question.id) ? "bg-indigo-500 text-white border-indigo-600 shadow-md" : "hover:border-indigo-400 hover:text-indigo-600"}`}
//                 >
//                   {markedForReview.has(question.id)
//                     ? "Unmark Review"
//                     : "Mark for Review & Next"}
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   onClick={clearResponse}
//                   className="rounded-xl px-6 font-bold text-muted-foreground hover:text-destructive transition-colors"
//                 >
//                   Clear Response
//                 </Button>
//               </div>

//               <div className="flex items-center gap-3">
//                 <Button
//                   variant="outline"
//                   onClick={() => setCurrentQ((c) => c - 1)}
//                   disabled={
//                     currentQ === sectionGroups[activeSection].startIndex ||
//                     (exam?.sectionalNavigation === "forward-only" &&
//                       currentQ === sectionGroups[activeSection].startIndex)
//                   }
//                   className="rounded-xl px-6 font-bold border-2"
//                 >
//                   <ChevronLeft className="w-4 h-4 mr-2" /> Previous
//                 </Button>
//                 <Button
//                   onClick={saveAndNext}
//                   className="rounded-xl px-8 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
//                 >
//                   {currentQ === shuffledQuestions.length - 1
//                     ? "Save & Finish"
//                     : "Save & Next"}
//                   {currentQ < shuffledQuestions.length - 1 && (
//                     <ChevronRight className="w-4 h-4 ml-2" />
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Sidebar Palette & Proctoring */}
//         <div className="lg:col-span-4 flex flex-col h-full gap-6 overflow-hidden pb-6">
//           {/* Proctoring Feed - Top Fixed */}
//           {!!exam.proctoringEnabled && (
//             <div className="bg-background rounded-3xl border border-border shadow-card overflow-hidden shrink-0">
//               <AIProctor
//                 onViolation={handleAIViolation}
//                 isFinished={submitted}
//                 existingStream={activeStream}
//                 proctoringAudioEnabled={!!exam.proctoringAudioEnabled}
//                 proctoringVideoEnabled={!!exam.proctoringVideoEnabled}
//               />
//             </div>
//           )}
//           {/* Status Legend */}
//           <div className="bg-background rounded-3xl border border-border shadow-card p-6">
//             <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
//               <ClipboardList className="w-4 h-4 text-primary" /> Evaluation
//               Summary
//             </h4>
//             <div className="grid grid-cols-2 gap-3">
//               {[
//                 {
//                   label: "Answered",
//                   count: Object.keys(answers).length,
//                   color: "bg-emerald-500",
//                 },
//                 {
//                   label: "Not Answered",
//                   count: Array.from(visited).filter(
//                     (id) =>
//                       answers[id] === undefined && !markedForReview.has(id),
//                   ).length,
//                   color: "bg-rose-500",
//                 },
//                 {
//                   label: "Not Visited",
//                   count: shuffledQuestions.length - visited.size,
//                   color: "bg-slate-200 dark:bg-slate-800",
//                 },
//                 {
//                   label: "Marked for Review",
//                   count: Array.from(markedForReview).filter(
//                     (id) => answers[id] === undefined,
//                   ).length,
//                   color: "bg-indigo-500",
//                 },
//                 {
//                   label: "Ans & Marked",
//                   count: Array.from(markedForReview).filter(
//                     (id) => answers[id] !== undefined,
//                   ).length,
//                   color:
//                     "bg-indigo-500 ring-2 ring-indigo-500 ring-offset-2 ring-offset-emerald-500",
//                 },
//               ].map((s, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-center gap-3 p-2 rounded-xl bg-muted/30"
//                 >
//                   <div className={`w-3 h-3 rounded-full ${s.color}`} />
//                   <div className="flex flex-col">
//                     <span className="text-[10px] font-black text-muted-foreground uppercase">
//                       {s.label}
//                     </span>
//                     <span className="text-sm font-bold leading-none">
//                       {s.count}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Question Grid - Scrollable */}
//           <div className="bg-background rounded-3xl border border-border shadow-card flex-1 flex flex-col p-6 overflow-y-auto no-scrollbar min-h-0">
//             <div className="flex items-center justify-between mb-6">
//               <h4 className="font-bold text-sm">Question Navigation</h4>
//               <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-lg uppercase tracking-widest">
//                 Global Map
//               </span>
//             </div>

//             <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
//               {shuffledQuestions.map((q, i) => {
//                 const isCurrent = i === currentQ;
//                 const isAnswered = answers[q.id] !== undefined;
//                 const isMarked = markedForReview.has(q.id);
//                 const isVis = visited.has(q.id);

//                 let statusClass =
//                   "bg-muted text-muted-foreground border-transparent";
//                 if (isMarked) {
//                   statusClass = "bg-indigo-500 text-white border-indigo-600";
//                   if (isAnswered)
//                     statusClass += " ring-2 ring-emerald-500 ring-offset-2";
//                 } else if (isAnswered) {
//                   statusClass = "bg-emerald-500 text-white border-emerald-600";
//                 } else if (isVis) {
//                   statusClass = "bg-rose-500 text-white border-rose-600";
//                 }

//                 return (
//                   <button
//                     key={i}
//                     onClick={() => navigateTo(i)}
//                     className={`h-7 w-7 rounded-lg text-[10px] font-black transition-all border-2 flex items-center justify-center relative ${statusClass} ${isCurrent ? "scale-110 shadow-xl z-10 border-primary ring-2 ring-primary/20" : "hover:scale-110"}`}
//                   >
//                     {i + 1}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="bg-background rounded-3xl border border-border shadow-card p-6 shrink-0">
//             <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
//               <HelpCircle className="w-4 h-4 text-primary" /> Integrity
//               Guidelines
//             </h4>
//             <div className="space-y-4">
//               <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-[11px] text-red-600 font-bold">
//                 MANDATORY FULLSCREEN: Any attempt to exit fullscreen or switch
//                 tabs will be recorded as a violation.
//               </div>
//               {!!exam.proctoringEnabled && (
//                 <div className="p-3 bg-muted/50 rounded-xl text-[11px] text-muted-foreground">
//                   Maintain proper posture. AI monitor will report suspicious
//                   movement or noise.
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>

//       <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
//         <AlertDialogContent className="rounded-3xl border-border">
//           <AlertDialogHeader>
//             <AlertDialogTitle>
//               Submit your evaluation instance?
//             </AlertDialogTitle>
//             <AlertDialogDescription>
//               Confirm submission of all telemetry and response data. This action
//               is irreversible.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={isSubmitting}>
//               Review
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => submitExam()}
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? "Submitting..." : "Confirm Submission"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <AlertDialog open={showFullscreenEnforcer} onOpenChange={() => {}}>
//         <AlertDialogContent className=" rounded-[2rem] border-none shadow-2xl bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-2xl max-w-lg p-0 overflow-hidden">
//           <AlertDialogHeader className="sr-only">
//             <AlertDialogTitle>Security Protocol Violation</AlertDialogTitle>
//             <AlertDialogDescription>
//               Fullscreen mode has been disabled. Please re-enable it to
//               continue.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <div className="absolute inset-0 overflow-hidden pointer-events-none">
//             <div className="blob w-[300px] h-[300px] bg-red-500/10 -top-20 -left-20 animate-float opacity-50" />
//             <div className="blob w-[200px] h-[200px] bg-amber-500/10 -bottom-20 -right-20 animate-float [animation-delay:2s] opacity-50" />
//           </div>

//           <div className="relative p-10 flex flex-col items-center text-center gap-6">
//             <div className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-600 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse">
//               <ShieldAlert className="w-10 h-10" />
//             </div>

//             <div className="space-y-2">
//               <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
//                 Security Protocol Violation
//               </h2>
//               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto">
//                 Fullscreen mode has been disabled. This is recorded as a
//                 security breach.
//               </p>
//             </div>

//             <div className="w-full p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-[11px] font-bold text-amber-600 uppercase tracking-widest">
//               Please re-enable fullscreen to continue the session
//             </div>

//             <Button
//               onClick={enterFullscreen}
//               className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest shadow-[0_10px_25px_rgba(220,38,38,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]"
//             >
//               Re-enable Fullscreen
//             </Button>

//             <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
//               Violation {violations}/{exam?.maxViolations || 3} Recorded
//             </p>
//           </div>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/pageComponents/ModeToggle";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  ShieldAlert,
  Timer as TimerIcon,
  HelpCircle,
  ClipboardList,
  Loader2,
  BookOpen,
  RotateCcw,
  Flag,
  CloudOff,
} from "lucide-react";
import { toast } from "sonner";
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
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { RootState } from "@/store";
import {
  addResultThunk,
  setLastResult,
  setExamSession,
  updateExamSession,
  clearExamSession,
  logoutStudent,
  loadStudentFromStorage,
} from "@/store/slices/examSlice";
import type {
  Question,
  Exam,
  Student,
  Submission,
} from "@/store/slices/examSlice";
import QuestionCard from "@/components/QuestionCard";
import Timer from "@/components/Timer";
import AIProctor from "@/components/proctoring/AIProctor";
import PreExamCheck from "@/components/exam/PreExamCheck";
import { cn } from "@/lib/utils";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Q number button ───────────────────────────────────────────────────────────
function QBtn({
  index,
  isCurrent,
  isAnswered,
  isMarked,
  isVisited,
  onClick,
}: {
  index: number;
  isCurrent: boolean;
  isAnswered: boolean;
  isMarked: boolean;
  isVisited: boolean;
  onClick: () => void;
}) {
  let cls = "bg-muted text-muted-foreground border-border";
  if (isMarked) {
    cls = "bg-violet-500 text-white border-violet-600";
    if (isAnswered) cls += " ring-2 ring-emerald-400 ring-offset-1";
  } else if (isAnswered) {
    cls = "bg-emerald-500 text-white border-emerald-600";
  } else if (isVisited) {
    cls = "bg-rose-400 text-white border-rose-500";
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-8 h-8 rounded-lg text-[11px] font-black border-2 flex items-center justify-center shrink-0 transition-all duration-100",
        cls,
        isCurrent
          ? "scale-110 shadow-lg border-primary ring-2 ring-primary/30 z-10"
          : "hover:scale-105",
      )}
    >
      {index + 1}
    </button>
  );
}

// Helper functions for consistent scrambling and validation
const validateRestoredQuestions = (
  restored: Question[],
  currentExam: Exam,
): boolean => {
  if (!currentExam || !currentExam.questions) return false;

  // Check if number of questions matches
  if (restored.length !== currentExam.questions.length) return false;

  // Check if all restored question IDs exist in current exam
  const currentQuestionIds = new Set(currentExam.questions.map((q) => q.id));
  const restoredIds = restored.map((q) => q.id);

  const allIdsExist = restoredIds.every((id) => currentQuestionIds.has(id));
  const noExtraIds = restoredIds.length === currentQuestionIds.size;

  // Check section integrity
  const currentSections = new Set(
    currentExam.questions.map((q) => q.section || "General"),
  );
  const restoredSections = new Set(restored.map((q) => q.section || "General"));

  const sectionsMatch =
    currentSections.size === restoredSections.size &&
    Array.from(currentSections).every((section) =>
      restoredSections.has(section),
    );

  return allIdsExist && noExtraIds && sectionsMatch;
};

const generateScrambledQuestions = (
  examData: Exam,
  studentUsn?: string,
): Question[] => {
  const pools: Record<string, Question[]> = {};
  examData.questions.forEach((q: Question) => {
    const s = (q.section || "General").toLowerCase().trim();
    if (!pools[s]) pools[s] = [];
    pools[s].push(q);
  });

  let selected: Question[] = [];
  const usedIds = new Set<string>();

  if (examData.sectionsConfig && examData.sectionsConfig.length > 0) {
    // Use deterministic shuffle based on student USN for consistency
    examData.sectionsConfig.forEach((config: any) => {
      const pool = pools[config.name.toLowerCase().trim()] || [];
      const deterministicShuffled = deterministicShuffle(
        pool,
        studentUsn || "",
      );
      const subset = deterministicShuffled.slice(
        0,
        Math.min(config.pickCount, pool.length),
      );
      subset.forEach((q) => usedIds.add(q.id));
      selected = [
        ...selected,
        ...subset.map((q: Question) => ({ ...q, section: config.name })),
      ];
    });

    const leftovers = examData.questions.filter(
      (q: Question) => !usedIds.has(q.id),
    );
    if (leftovers.length > 0) {
      selected = [
        ...selected,
        ...deterministicShuffle(leftovers, studentUsn || ""),
      ];
    }
  } else {
    selected = deterministicShuffle(examData.questions, studentUsn || "");
  }

  return selected;
};

const deterministicShuffle = function <T>(array: T[], seed: string): T[] {
  const shuffled = [...array];
  const seedNumber = hashCode(seed);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seedNumber + i) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export default function LiveExamPage() {
  const { examId } = useParams() as { examId: string };
  const exams = useAppSelector((s: RootState) => s.exam.exams);
  const student = useAppSelector((s: RootState) => s.exam.student);
  const loading = useAppSelector((s: RootState) => s.exam.loading);
  const examSession = useAppSelector((s: RootState) => s.exam.examSession);
  const dispatch = useAppDispatch();

  const addResult = async (data: Partial<Submission>) => {
    try {
      await dispatch(addResultThunk(data)).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  const router = useRouter();
  const exam = exams.find((e: Exam) => e.id === examId);

  const [preCheck, setPreCheck] = useState(true);
  const [isSeb, setIsSeb] = useState(true);
  useEffect(() => {
    if (exam?.sebConfigId) {
      const ua = navigator.userAgent;
      setIsSeb(ua.includes("SEB") || !!(window as any).SafeExamBrowser);
    } else setIsSeb(true);
  }, [exam]);

  useEffect(() => {
    if (!student) {
      dispatch(loadStudentFromStorage());
    }
  }, [dispatch, student]);

  const isSubmittingRef = useRef(false);
  const startTime = useMemo(() => Date.now(), []);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenEnforcer, setShowFullscreenEnforcer] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const lastViolationTimeRef = useRef<number>(0);
  const VIOLATION_COOLDOWN = 30000;

  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, number | number[] | string>
  >({});
  const [justifications, setJustifications] = useState<Record<string, string>>(
    {},
  );
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(
    new Set(),
  );
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [violations, setViolations] = useState(0);
  const [violationEvents, setViolationEvents] = useState<
    { timestamp: number; reason: string; score: number }[]
  >([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasUnsyncedChanges, setHasUnsyncedChanges] = useState(false);
  const lastSyncTimeRef = useRef(0);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online!", {
        description: "Your local progress will be synchronized automatically.",
        duration: 5000,
      });
      triggerSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are offline", {
        description:
          "Your answers are saved locally and will sync automatically once connection returns.",
        duration: 0, // Persistent
      });
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const logViolation = useCallback(
    (score: number, reason: string) => {
      if (submitted) return;

      const now = Date.now();
      const newEvent = { timestamp: now, reason, score };

      // 1. Always log the event locally
      setViolationEvents((prev) => [...prev, newEvent]);

      // 2. Intelligence: Handle "Warning Phase"
      // Minor violations (score 1) get 2 free passes (warnings)
      const minorCount = violationEvents.filter((e) => e.score === 1).length;
      const isWarning = score === 1 && minorCount < 2;

      if (!isOnline) {
        toast.warning(
          `⚠️ Connection Issue: ${reason} detected, but ignoring due to offline status.`,
        );
        return;
      }

      if (isWarning) {
        toast.info(`⚠️ Warning (${minorCount + 1}/2): ${reason}`, {
          description: "Further occurrences will count as core violations.",
        });
      } else {
        setViolations((v) => {
          const next = v + 1;
          toast.error(
            `🚨 Violation! ${reason} (${next}/${exam?.maxViolations || 3})`,
            {
              description:
                "Malpractice detected. Please stay on the exam screen.",
            },
          );
          return next;
        });
      }
    },
    [violationEvents, isOnline, submitted, exam?.maxViolations],
  );

  const triggerSync = useCallback(async () => {
    if (!student || !examId || !navigator.onLine || isSyncing) {
      if (!navigator.onLine) setHasUnsyncedChanges(true);
      return;
    }

    setIsSyncing(true);
    try {
      const resp = await fetch(`/api/exams/${examId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usn: student.usn,
          studentName: student.name,
          email: student.email,
          class: student.class,
          year: student.year,
          section: student.section,
          answers,
          violations,
          violationEvents,
          justifications,
          currentQ,
          currentSectionIndex,
          visited: Array.from(visited),
          markedForReview: Array.from(markedForReview),
          endTimestamp: examSession?.endTimestamp,
          sectionEndTimestamps: examSession?.sectionEndTimestamps,
          shuffledQuestionIds: shuffledQuestions.map((q) => q.id),
        }),
      });
      if (resp.ok) {
        lastSyncTimeRef.current = Date.now();
        setHasUnsyncedChanges(false);
      } else {
        setHasUnsyncedChanges(true);
        console.error("Sync failed with status:", resp.status);
      }
    } catch (err) {
      setHasUnsyncedChanges(true);
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [
    student,
    examId,
    answers,
    violations,
    violationEvents,
    justifications,
    currentQ,
    currentSectionIndex,
    visited,
    markedForReview,
    examSession?.endTimestamp,
    examSession?.sectionEndTimestamps,
    shuffledQuestions,
    isSyncing,
  ]);

  const sectionGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        startIndex: number;
        count: number;
        questions: (Question & { globalIndex: number })[];
      }
    > = {};
    shuffledQuestions.forEach((q: Question, idx: number) => {
      const s = q.section || "General";
      if (!groups[s]) groups[s] = { startIndex: idx, count: 0, questions: [] };
      groups[s].count++;
      groups[s].questions.push({ ...q, globalIndex: idx });
    });
    return groups;
  }, [shuffledQuestions]);

  const orderedSectionNames = useMemo(
    () => Object.keys(sectionGroups),
    [sectionGroups],
  );
  const activeSection = orderedSectionNames[currentSectionIndex] || "General";

  // Enhanced Load / Restore exam state with consistent scrambling
  useEffect(() => {
    if (!exam || !student || isDataLoaded) return;

    const storageKey = `exam_prog_${examId}_${student.usn}`;

    const initialize = async () => {
      // 1. Try to restore from Redux examSession first
      if (examSession && examSession.storageKey === storageKey) {
        const restored = examSession.shuffledQuestionIds
          .map((id: string) =>
            exam.questions.find((q: Question) => q.id === id),
          )
          .filter(Boolean) as Question[];

        if (restored.length > 0 && validateRestoredQuestions(restored, exam)) {
          setShuffledQuestions(restored);
          setAnswers(examSession.answers || {});
          setVisited(new Set(examSession.visited || []));
          setMarkedForReview(new Set(examSession.markedForReview || []));
          setViolations(examSession.violations || 0);
          setViolationEvents(examSession.violationEvents || []);
          setCurrentQ(examSession.currentQ || 0);
          setCurrentSectionIndex(examSession.currentSectionIndex || 0);
          setJustifications(examSession.justifications || {});

          if (!examSession.endTimestamp) {
            const totalDurationMs = (exam.duration || 60) * 60 * 1000;
            const endTime = Date.now() + totalDurationMs;
            const sectionEnds: Record<string, number> = {};
            exam.sectionsConfig?.forEach((s: any) => {
              sectionEnds[s.name] = Date.now() + (s.duration || 5) * 60 * 1000;
            });
            dispatch(
              updateExamSession({
                endTimestamp: endTime,
                sectionEndTimestamps: sectionEnds,
              }),
            );
          }

          setPreCheck(false);
          setIsDataLoaded(true);
          toast.success("Exam session restored!");
          return;
        }
      }

      // 2. Fallback: Check localStorage as backup
      try {
        const localData = localStorage.getItem(storageKey);
        if (localData) {
          const parsedData = JSON.parse(localData);
          const restored = parsedData.shuffledQuestionIds
            .map((id: string) =>
              exam.questions.find((q: Question) => q.id === id),
            )
            .filter(Boolean) as Question[];

          if (restored.length > 0 && validateRestoredQuestions(restored, exam)) {
            setShuffledQuestions(restored);
            setAnswers(parsedData.answers || {});
            setVisited(new Set(parsedData.visited || []));
            setMarkedForReview(new Set(parsedData.markedForReview || []));
            setViolations(parsedData.violations || 0);
            setViolationEvents(parsedData.violationEvents || []);
            setCurrentQ(parsedData.currentQ || 0);
            setCurrentSectionIndex(parsedData.currentSectionIndex || 0);
            setJustifications(parsedData.justifications || {});

            if (parsedData.endTimestamp) {
              dispatch(
                updateExamSession({
                  endTimestamp: parsedData.endTimestamp,
                  sectionEndTimestamps: parsedData.sectionEndTimestamps,
                }),
              );
            }

            setPreCheck(false);
            setIsDataLoaded(true);
            toast.success("Session recovered from local cache!");
            return;
          }
        }
      } catch (error) {
        console.warn("Failed to restore from localStorage:", error);
      }

      // 3. Fallback: Check Database Session
      try {
        const resp = await fetch(
          `/api/exam/${examId}/session?studentUsn=${student.usn}`,
        );
        if (resp.ok) {
          const data = await resp.json();
          if (data.canResume && data.session) {
            const session = data.session;
            const restoredIds = JSON.parse(session.shuffledQuestionIds || "[]");
            const restored = restoredIds
              .map((id: string) =>
                exam.questions.find((q: Question) => q.id === id),
              )
              .filter(Boolean) as Question[];

            if (
              restored.length > 0 &&
              validateRestoredQuestions(restored, exam)
            ) {
              setShuffledQuestions(restored);
              setAnswers(JSON.parse(session.answers || "{}"));
              setVisited(new Set(JSON.parse(session.visitedQuestions || "[]")));
              setMarkedForReview(
                new Set(JSON.parse(session.markedForReview || "[]")),
              );
              setViolations(session.violations || 0);
              setViolationEvents(JSON.parse(session.violationEvents || "[]"));
              setCurrentQ(session.currentQuestionIndex || 0);
              setCurrentSectionIndex(session.currentSectionIndex || 0);
              setJustifications(JSON.parse(session.justifications || "{}"));

              if (session.endTimestamp) {
                dispatch(
                  updateExamSession({
                    endTimestamp: session.endTimestamp,
                    sectionEndTimestamps: JSON.parse(
                      session.sectionEndTimestamps || "{}",
                    ),
                  }),
                );
              }

              setPreCheck(false);
              setIsDataLoaded(true);
              toast.success("Session resumed from server!");
              return;
            }
          }
        }
      } catch (err) {
        console.error("DB session restore failed:", err);
      }

      // 4. Final: New exam initialization with consistent scrambling
      const scrambledQuestions = generateScrambledQuestions(exam, student?.usn);
      setShuffledQuestions(scrambledQuestions);

      const totalDurationMs = (exam.duration || 60) * 60 * 1000;
      const endTime = Date.now() + totalDurationMs;
      const sectionEnds: Record<string, number> = {};
      exam.sectionsConfig?.forEach((s: any) => {
        sectionEnds[s.name] = Date.now() + (s.duration || 5) * 60 * 1000;
      });

      const sessionData = {
        storageKey,
        shuffledQuestionIds: scrambledQuestions.map((q: Question) => q.id),
        answers: {},
        visited: [scrambledQuestions[0]?.id],
        markedForReview: [],
        violations: 0,
        violationEvents: [],
        currentQ: 0,
        currentSectionIndex: 0,
        justifications: {},
        endTimestamp: endTime,
        sectionEndTimestamps: sectionEnds,
        examVersion: exam.version || 1,
        createdAt: Date.now(),
      };

      dispatch(setExamSession(sessionData));
      try {
        localStorage.setItem(storageKey, JSON.stringify(sessionData));
      } catch (error) {
        console.warn("Failed to save to localStorage:", error);
      }
      setIsDataLoaded(true);
    };

    initialize();
  }, [exam, student, examSession, isDataLoaded, examId, dispatch]);

  // Auto-save and sync
  useEffect(() => {
    if (
      !isDataLoaded ||
      !student ||
      !examId ||
      submitted ||
      !shuffledQuestions.length
    )
      return;

    const storageKey = `exam_prog_${examId}_${student.usn}`;
    const sessionData = {
      storageKey,
      shuffledQuestionIds: shuffledQuestions.map((q) => q.id),
      answers,
      visited: Array.from(visited),
      markedForReview: Array.from(markedForReview),
      violations,
      violationEvents,
      currentQ,
      currentSectionIndex,
      endTimestamp: examSession?.endTimestamp, // Persist existing timing
      sectionEndTimestamps: examSession?.sectionEndTimestamps,
    };

    dispatch(updateExamSession(sessionData));

    // Debounced sync to server
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      triggerSync();
    }, 5000); // Sync every 5 seconds of inactivity

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [
    shuffledQuestions,
    answers,
    visited,
    markedForReview,
    violations,
    currentQ,
    currentSectionIndex,
    isDataLoaded,
    submitted,
    dispatch,
    student,
    examId,
    triggerSync,
    examSession?.endTimestamp,
    examSession?.sectionEndTimestamps,
  ]);

  // Fullscreen initial check
  useEffect(() => {
    const check = () =>
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        ),
      );
    check();
  }, []);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      const full = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(full);
      if (full) {
        setShowFullscreenEnforcer(false);
        return;
      }
      if (!submitted && !preCheck && !isSubmittingRef.current) {
        setShowFullscreenEnforcer(true);
        const now = Date.now();
        const cooldown =
          !!exam?.proctoringEnabled &&
          now - lastViolationTimeRef.current < VIOLATION_COOLDOWN;
        if (!cooldown) {
          lastViolationTimeRef.current = now;
          logViolation(1, "Fullscreen exited");
        } else {
          toast.warning("Return to fullscreen immediately!");
        }
      }
    };
    [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange",
    ].forEach((ev) => document.addEventListener(ev, handleFullscreenChange));
    return () => {
      [
        "fullscreenchange",
        "webkitfullscreenchange",
        "mozfullscreenchange",
        "MSFullscreenChange",
      ].forEach((ev) =>
        document.removeEventListener(ev, handleFullscreenChange),
      );
    };
  }, [submitted, preCheck, exam?.proctoringEnabled]);

  useEffect(() => {
    if (!preCheck && !submitted && !isFullscreen && !isSubmittingRef.current)
      setShowFullscreenEnforcer(true);
  }, [preCheck, submitted, isFullscreen]);

  const enterFullscreen = useCallback(() => {
    const el = document.documentElement as any;
    const req =
      el.requestFullscreen ||
      el.webkitRequestFullScreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;
    if (req)
      req
        .call(el)
        .then(() => setShowFullscreenEnforcer(false))
        .catch(() =>
          toast.error("Failed to enter fullscreen. Check browser settings."),
        );
  }, []);

  // Tab Change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.hidden &&
        !submitted &&
        !preCheck &&
        !isSubmittingRef.current
      ) {
        logViolation(1, "Tab switch / Window minimized");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [submitted, preCheck, logViolation]);

  // Copy/Paste prevention and logging
  useEffect(() => {
    const handleAction = (e: Event, reason: string) => {
      if (preCheck || submitted) return;
      e.preventDefault();
      logViolation(2, reason);
    };

    const onCopy = (e: ClipboardEvent) => handleAction(e, "Copy attempt");
    const onPaste = (e: ClipboardEvent) => handleAction(e, "Paste attempt");

    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);

    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
    };
  }, [preCheck, submitted, logViolation]);

  // DevTools shortcut detection (Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, F12, Ctrl+U)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (preCheck || submitted) return;

      const isDevTools =
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "J" || e.key === "j")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u")) ||
        e.key === "F12";

      if (isDevTools) {
        e.preventDefault();
        e.stopPropagation();
        logViolation(2, "Developer Tools shortcut attempted");
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [preCheck, submitted, logViolation]);

  const submitExam = useCallback(
    async (isTimeout = false, finalViolations?: number) => {
      if (submitted || isSubmittingRef.current || !exam || !student) return;
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setSubmitted(true);
      if (isTimeout)
        toast.info("Time's up! Submitting automatically…", { duration: 5000 });

      const actualViolations = finalViolations ?? violations;
      const posMarks = exam.positiveMarks ?? 1;
      const negMarks = parseFloat(String(exam.negativeMarks ?? "0"));
      let correctCount = 0,
        wrongCount = 0,
        totalObtained = 0;
      const sectionalResults: Record<string, number> = {};

      shuffledQuestions.forEach((q) => {
        const ans = answers[q.id];
        const section = q.section || "General";
        if (!sectionalResults[section]) sectionalResults[section] = 0;
        let isCorrect = false;
        if (q.type === "msq") {
          const correct = q.correctAnswer
            .split(",")
            .map((i: string) => parseInt(i))
            .sort();
          isCorrect =
            Array.isArray(ans) &&
            ans.length === correct.length &&
            [...ans].sort((a, b) => a - b).every((v, i) => v === correct[i]);
        } else if (q.type === "text") {
          isCorrect =
            typeof ans === "string" &&
            ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        } else {
          isCorrect = String(ans) === q.correctAnswer;
        }
        if (isCorrect) {
          correctCount++;
          totalObtained += posMarks;
          sectionalResults[section] += posMarks;
        } else if (ans !== undefined) {
          wrongCount++;
          totalObtained -= negMarks;
          sectionalResults[section] -= negMarks;
        }
      });

      const success = await addResult({
        id: `r-${Date.now()}`,
        examId: exam.id,
        studentName: student.name,
        usn: student.usn,
        email: student.email,
        class: student.class,
        year: student.year,
        section: student.section,
        score: totalObtained,
        violations: actualViolations,
        violationEvents,
        sectionScores: sectionalResults,
        answers,
        justifications,
        totalMarks: exam.totalMarks,
        submittedAt: new Date(),
      } as any);

      if (!success) {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        setSubmitted(false);
        return;
      }

      dispatch(
        setLastResult({
          score: totalObtained,
          totalMarks: exam.totalMarks,
          correct: correctCount,
          wrong: wrongCount,
          violations: actualViolations,
          violationEvents,
          sectionScores: sectionalResults,
          answers,
          justifications,
          questions: shuffledQuestions,
        }),
      );
      dispatch(clearExamSession());
      router.replace(`/exam/${examId}/result`);
    },
    [
      submitted,
      exam,
      student,
      answers,
      shuffledQuestions,
      violations,
      addResult,
      router,
      examId,
      dispatch,
      justifications,
    ],
  );

  const handleAIViolation = useCallback(
    (reason: string) => {
      if (submitted || isSubmittingRef.current) return;
      const now = Date.now();
      if (now - lastViolationTimeRef.current > VIOLATION_COOLDOWN) {
        lastViolationTimeRef.current = now;
        logViolation(1, `AI: ${reason}`);
      }
    },
    [submitted, logViolation],
  );

  const markForReviewAndNext = useCallback(() => {
    const qId = shuffledQuestions[currentQ].id;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
    if (currentQ < shuffledQuestions.length - 1) {
      const next = currentQ + 1;
      setCurrentQ(next);
      setVisited((prev) => new Set(prev).add(shuffledQuestions[next].id));
    }
  }, [currentQ, shuffledQuestions]);

  const clearResponse = useCallback(() => {
    const qId = shuffledQuestions[currentQ].id;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      next.delete(qId);
      return next;
    });
  }, [currentQ, shuffledQuestions]);

  const handleSectionTimeUp = useCallback(() => {
    if (currentSectionIndex < orderedSectionNames.length - 1) {
      const nextName = orderedSectionNames[currentSectionIndex + 1];
      const nextIdx = sectionGroups[nextName].startIndex;
      setCurrentSectionIndex((v) => v + 1);
      setCurrentQ(nextIdx);
      setVisited((prev) => new Set(prev).add(shuffledQuestions[nextIdx].id));
      toast.success(`Section time up — moving to ${nextName}`);
    } else submitExam(true);
  }, [
    currentSectionIndex,
    orderedSectionNames,
    sectionGroups,
    shuffledQuestions,
    submitExam,
  ]);

  const navigateTo = useCallback(
    (index: number) => {
      const targetQ = shuffledQuestions[index];
      const targetSection = targetQ?.section || "General";
      if (targetSection !== activeSection) {
        const targetSectionIdx = orderedSectionNames.indexOf(targetSection);
        if (exam?.strictSectionTiming) {
          toast.warning(
            "Sectional timing active: cannot switch sections manually.",
          );
          return;
        }
        if (
          exam?.sectionalNavigation === "forward-only" &&
          targetSectionIdx < currentSectionIndex
        ) {
          toast.warning("Forward-only: cannot move to a previous section.");
          return;
        }
        setCurrentSectionIndex(targetSectionIdx);
      }
      setCurrentQ(index);
      setVisited((prev) => new Set(prev).add(shuffledQuestions[index].id));
    },
    [
      shuffledQuestions,
      activeSection,
      orderedSectionNames,
      currentSectionIndex,
      exam?.strictSectionTiming,
      exam?.sectionalNavigation,
    ],
  );

  const saveAndNext = useCallback(() => {
    const sectionEnd =
      sectionGroups[activeSection].startIndex +
      sectionGroups[activeSection].count -
      1;
    if (currentQ < sectionEnd) {
      const next = currentQ + 1;
      setCurrentQ(next);
      setVisited((prev) => new Set(prev).add(shuffledQuestions[next].id));
    } else if (currentSectionIndex < orderedSectionNames.length - 1) {
      if (exam?.strictSectionTiming) {
        toast.info("Wait for section timer to expire.", { duration: 4000 });
        return;
      }
      const nextName = orderedSectionNames[currentSectionIndex + 1];
      const nextIdx = sectionGroups[nextName].startIndex;
      setCurrentSectionIndex((v) => v + 1);
      setCurrentQ(nextIdx);
      setVisited((prev) => new Set(prev).add(shuffledQuestions[nextIdx].id));
      toast.success(`Proceeding to: ${nextName}`);
    } else {
      setShowConfirm(true);
    }
  }, [
    currentQ,
    currentSectionIndex,
    orderedSectionNames,
    sectionGroups,
    shuffledQuestions,
    activeSection,
    exam?.strictSectionTiming,
  ]);

  // Violation limit check
  useEffect(() => {
    const maxV = exam?.maxViolations || 3;
    if (violations >= maxV && !submitted && !isSubmitting)
      submitExam(false, violations);
  }, [violations, submitted, isSubmitting, submitExam, exam?.maxViolations]);

  // Initial visited
  useEffect(() => {
    if (shuffledQuestions.length > 0 && visited.size === 0)
      setVisited((prev) => new Set(prev).add(shuffledQuestions[0].id));
    if (student && examId && !submitted) {
      fetch(`/api/results/my-result?examId=${examId}&usn=${student.usn}`)
        .then((r) => r.json())
        .then(({ found }) => {
          if (found) {
            toast.info("Already submitted.");
            router.push(`/exam/${examId}/result`);
          }
        })
        .catch(() => {});
    }
  }, [student, examId, router, submitted, shuffledQuestions]);

  // Tab visibility
  useEffect(() => {
    const handler = () => {
      if (
        document.hidden &&
        !submitted &&
        !preCheck &&
        !isSubmittingRef.current
      ) {
        const now = Date.now();
        if (now - lastViolationTimeRef.current > VIOLATION_COOLDOWN) {
          lastViolationTimeRef.current = now;
          setViolations((v) => {
            const next = v + 1;
            toast.error(
              `⚠️ Tab switch! Violation ${next}/${exam?.maxViolations || 3}`,
            );
            return next;
          });
        } else toast.warning("Stay on the exam tab!");
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [submitted, preCheck]);

  // Copy/paste prevention
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("copy", prevent);
    document.addEventListener("paste", prevent);
    document.addEventListener("contextmenu", prevent);
    const keyHandler = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "a", "x"].includes(e.key.toLowerCase())
      )
        e.preventDefault();
    };
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("paste", prevent);
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (activeStream) activeStream.getTracks().forEach((t) => t.stop());
    };
  }, [activeStream]);

  // ── Loading states ──────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading exam…
          </p>
        </div>
      </div>
    );
  if (!exam)
    return (
      <div className="p-20 text-center text-destructive font-bold">
        Exam not found
      </div>
    );
  if (!student)
    return (
      <div className="p-20 text-center text-destructive font-bold">
        Student session missing. Please register again.
      </div>
    );
  if (!isDataLoaded)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">
            Preparing exam…
          </p>
        </div>
      </div>
    );
  if (shuffledQuestions.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
        <div className="space-y-3">
          <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">
            No questions available for this exam.
          </p>
        </div>
      </div>
    );

  if (preCheck)
    return (
      <PreExamCheck
        examTitle={exam.title}
        proctoringEnabled={!!exam.proctoringEnabled}
        proctoringAudioEnabled={!!exam.proctoringAudioEnabled}
        proctoringVideoEnabled={!!exam.proctoringVideoEnabled}
        onProceed={(stream: MediaStream | null) => {
          if (stream) setActiveStream(stream);
          enterFullscreen();
          setPreCheck(false);
        }}
      />
    );

  const question = shuffledQuestions[currentQ];

  const getSectionProgress = (sectionName: string) => {
    const group = sectionGroups[sectionName];
    if (!group) return { answered: 0, total: 0 };
    return {
      answered: group.questions.filter((q) => answers[q.id] !== undefined)
        .length,
      total: group.count,
    };
  };

  const totalAnswered = Object.keys(answers).length;
  const totalMarked = Array.from(markedForReview).length;
  const totalNotVisited = shuffledQuestions.length - visited.size;

  return (
    <div className="h-screen bg-muted/10 flex flex-col overflow-hidden">
      {/* ── Top header ──────────────────────────────── */}
      <header className="h-14 bg-background border-b border-border shrink-0 z-50 sticky top-0">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: title + badges */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground truncate max-w-[180px] sm:max-w-[320px] leading-tight">
                {exam.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                  Q {currentQ + 1}/{shuffledQuestions.length}
                </span>
                {!!exam.proctoringEnabled && (
                  <span className="text-[10px] bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Proctored
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: marking scheme + timer + mode */}
          <div className="flex items-center gap-2 shrink-0">
            {(exam.positiveMarks !== undefined ||
              exam.negativeMarks !== undefined) && (
              <div className="hidden sm:flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-1.5">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  +{exam.positiveMarks ?? 1}
                </span>
                <span className="w-px h-3 bg-border" />
                <span className="text-xs font-bold text-red-500">
                  −{exam.negativeMarks ?? 0}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-muted border border-border rounded-xl px-3 py-1.5">
              {!isOnline && (
                <div className="flex items-center gap-1.5 mr-2 text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase">
                    Offline
                  </span>
                </div>
              )}
              {isSyncing && (
                <Loader2 className="w-3 h-3 text-primary animate-spin mr-1" />
              )}
              <TimerIcon className="w-3.5 h-3.5 text-primary shrink-0" />
              <Timer
                key={exam.strictSectionTiming ? activeSection : exam.id}
                endTimestamp={
                  exam.strictSectionTiming
                    ? (examSession?.sectionEndTimestamps?.[activeSection] ??
                      Date.now() +
                        (exam.sectionsConfig?.find(
                          (s: any) => s.name === activeSection,
                        )?.duration || 5) *
                          60 *
                          1000)
                    : (examSession?.endTimestamp ??
                      Date.now() + (exam.duration || 60) * 60 * 1000)
                }
                onTimeUp={
                  exam.strictSectionTiming
                    ? handleSectionTimeUp
                    : () => submitExam(true)
                }
              />
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* ── Section + Q nav bar ─────────────────────── */}
      <div className="bg-background border-b border-border shrink-0 sticky top-14 z-40">
        <div className="px-4 sm:px-6 h-11 flex items-center gap-3 overflow-hidden">
          {/* Section pills */}
          <div className="flex items-center gap-1 shrink-0">
            {orderedSectionNames.map((name, sIdx) => {
              const { answered, total } = getSectionProgress(name);
              const isActive = activeSection === name;
              const isDisabled = exam?.strictSectionTiming
                ? !isActive
                : exam?.sectionalNavigation === "forward-only"
                  ? sIdx < currentSectionIndex
                  : false;
              return (
                <button
                  key={name}
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    const nextIdx = sectionGroups[name].startIndex;
                    setCurrentSectionIndex(sIdx);
                    setCurrentQ(nextIdx);
                    setVisited((prev) =>
                      new Set(prev).add(shuffledQuestions[nextIdx].id),
                    );
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isDisabled
                        ? "opacity-30 cursor-not-allowed text-muted-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {name}
                  <span
                    className={cn(
                      "text-[10px] font-black px-1.5 py-0.5 rounded",
                      isActive
                        ? "bg-white/20"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {answered}/{total}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-border shrink-0" />

          {/* Q number mini-strip (current section) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 py-1">
            {sectionGroups[activeSection]?.questions.map((q: any) => (
              <QBtn
                key={q.globalIndex}
                index={q.globalIndex}
                isCurrent={q.globalIndex === currentQ}
                isAnswered={answers[q.id] !== undefined}
                isMarked={markedForReview.has(q.id)}
                isVisited={visited.has(q.id)}
                onClick={() => navigateTo(q.globalIndex)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Question panel */}
        <div className="lg:col-span-8 flex flex-col overflow-hidden border-r border-border">
          {/* Q type label */}
          <div className="px-5 py-2.5 bg-muted/20 border-b border-border flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" />
              {activeSection}
            </span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {question.type === "mcq"
                ? "Single Choice"
                : question.type === "msq"
                  ? "Multiple Select"
                  : "Subjective"}
            </span>
          </div>

          {/* Question content — scrollable */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <QuestionCard
              question={question}
              index={currentQ}
              total={shuffledQuestions.length}
              selectedAnswer={answers[question.id] ?? null}
              justification={justifications[question.id] ?? ""}
              onJustify={(text) =>
                setJustifications((prev) => ({ ...prev, [question.id]: text }))
              }
              onSelect={(val) => {
                if (question.type === "msq") {
                  setAnswers((prev) => {
                    const current = (prev[question.id] as number[]) || [];
                    const i = val as number;
                    const next = current.includes(i)
                      ? current.filter((c) => c !== i)
                      : [...current, i];
                    return { ...prev, [question.id]: next };
                  });
                } else {
                  setAnswers((prev) => ({ ...prev, [question.id]: val }));
                }
              }}
            />
          </div>

          {/* Bottom action bar */}
          <div className="px-5 py-3.5 bg-background border-t border-border flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markForReviewAndNext}
                className={cn(
                  "h-9 px-4 rounded-xl font-bold text-xs border-2 transition-all",
                  markedForReview.has(question.id)
                    ? "bg-violet-500 text-white border-violet-600 hover:bg-violet-600"
                    : "hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400",
                )}
              >
                <Flag className="w-3.5 h-3.5 mr-1.5" />
                {markedForReview.has(question.id) ? "Unmark" : "Mark & Next"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearResponse}
                className="h-9 px-3 rounded-xl font-semibold text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prev = currentQ - 1;
                  if (prev >= sectionGroups[activeSection].startIndex) {
                    setCurrentQ(prev);
                    setVisited((v) =>
                      new Set(v).add(shuffledQuestions[prev].id),
                    );
                  }
                }}
                disabled={currentQ === sectionGroups[activeSection].startIndex}
                className="h-9 px-4 rounded-xl font-bold text-xs border-2"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Prev
              </Button>
              <Button
                size="sm"
                onClick={saveAndNext}
                className="h-9 px-5 rounded-xl font-bold text-xs shadow-sm shadow-primary/20 hover:-translate-y-px transition-all"
              >
                {currentQ === shuffledQuestions.length - 1 ? (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Finish
                  </>
                ) : (
                  <>
                    Save & Next
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 hidden lg:flex flex-col overflow-hidden bg-background">
          {/* Proctoring feed */}
          {!!exam.proctoringEnabled && (
            <div className="border-b border-border shrink-0">
              <AIProctor
                onViolation={handleAIViolation}
                isFinished={submitted}
                existingStream={activeStream}
                proctoringAudioEnabled={!!exam.proctoringAudioEnabled}
                proctoringVideoEnabled={!!exam.proctoringVideoEnabled}
              />
            </div>
          )}

          {/* Status summary */}
          <div className="p-4 border-b border-border shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
              Answer Status
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Answered",
                  count: totalAnswered,
                  dot: "bg-emerald-500",
                },
                {
                  label: "Not Answered",
                  count: Array.from(visited).filter(
                    (id) =>
                      answers[id] === undefined && !markedForReview.has(id),
                  ).length,
                  dot: "bg-rose-400",
                },
                {
                  label: "Not Visited",
                  count: totalNotVisited,
                  dot: "bg-muted-foreground/30",
                },
                { label: "Marked", count: totalMarked, dot: "bg-violet-500" },
              ].map(({ label, count, dot }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-border"
                >
                  <div
                    className={cn("w-2.5 h-2.5 rounded-full shrink-0", dot)}
                  />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground leading-none">
                      {label}
                    </p>
                    <p className="text-sm font-black text-foreground tabular-nums leading-tight mt-0.5">
                      {count}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Network & Sync Status */}
            <div className="mt-4 flex flex-col gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold border transition-all uppercase tracking-tight",
                  isOnline
                    ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse",
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    isOnline ? "bg-emerald-500" : "bg-rose-500",
                  )}
                />
                {isOnline ? "Connected" : "Offline"}
              </div>

              {(isSyncing || hasUnsyncedChanges) && (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold border transition-all uppercase tracking-tight",
                    isSyncing
                      ? "bg-blue-500/5 border-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
                  )}
                >
                  {isSyncing ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin shrink-0" />
                  ) : (
                    <CloudOff className="w-3 h-3 shrink-0" />
                  )}
                  {isSyncing ? "Syncing..." : "Unsynced Data"}
                </div>
              )}
            </div>
          </div>

          {/* Global Q map — scrollable */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
              All Questions
            </p>
            <div className="grid grid-cols-5 gap-2">
              {shuffledQuestions.map((q, i) => (
                <QBtn
                  key={i}
                  index={i}
                  isCurrent={i === currentQ}
                  isAnswered={answers[q.id] !== undefined}
                  isMarked={markedForReview.has(q.id)}
                  isVisited={visited.has(q.id)}
                  onClick={() => navigateTo(i)}
                />
              ))}
            </div>
          </div>

          {/* Submit + integrity note */}
          <div className="p-4 border-t border-border space-y-3 shrink-0">
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 leading-relaxed">
                Fullscreen exit and tab switching are recorded as violations.{" "}
                {violations}/{exam.maxViolations || 3} logged.
              </p>
            </div>
            <Button
              onClick={() => setShowConfirm(true)}
              variant="outline"
              size="sm"
              className="w-full h-9 rounded-xl font-bold text-xs border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Submit Exam
            </Button>
          </div>
        </div>
      </div>

      {/* ── Submit confirmation ──────────────────────── */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Submit exam?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              You've answered{" "}
              <strong className="text-foreground">{totalAnswered}</strong> of{" "}
              <strong className="text-foreground">
                {shuffledQuestions.length}
              </strong>{" "}
              questions. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting} className="rounded-xl">
              Review
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => submitExam()}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Confirm Submit"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Fullscreen enforcer ──────────────────────── */}
      <AlertDialog open={showFullscreenEnforcer} onOpenChange={() => {}}>
        <AlertDialogContent className="rounded-2xl max-w-sm border-red-500/20 bg-card">
          <AlertDialogHeader className="sr-only">
            <AlertDialogTitle>Fullscreen Required</AlertDialogTitle>
            <AlertDialogDescription>
              You have exited fullscreen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col items-center text-center p-6 gap-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground mb-1">
                Fullscreen Exited
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is a security violation. Return to fullscreen to continue.
              </p>
            </div>
            <div className="w-full px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Violation {violations} / {exam?.maxViolations || 3} recorded
              </p>
            </div>
            <Button
              onClick={enterFullscreen}
              className="w-full h-10 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20"
            >
              Re-enable Fullscreen
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
