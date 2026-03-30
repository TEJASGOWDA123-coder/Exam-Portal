import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { RootState, AppDispatch } from "../index";

export interface Question {
  id: string;
  type: "mcq" | "msq" | "text";
  question: string;
  questionImage?: string;
  options?: { text: string; image?: string }[];
  correctAnswer: string;
  section: string;
  marks: number;
  requiresJustification?: boolean;
  solution?: string;
  startTime?: number; // timestamp when first visited
}

export interface Exam {
  id: string;
  title: string;
  duration: number;
  totalMarks: number;
  startTime: string;
  endTime: string;
  status: "active" | "upcoming" | "completed";
  proctoringEnabled?: boolean | number;
  proctoringAudioEnabled?: boolean | number;
  proctoringVideoEnabled?: boolean | number;
  showResults?: boolean | number;
  strictSectionTiming?: boolean | number;
  sectionalNavigation?: "free" | "forward-only";
  sebConfigId?: string | null;
  positiveMarks?: number;
  negativeMarks?: string;
  maxViolations?: number;
  blueprint?: string | null;
  generatedQuestions?: string | null;
  sectionsConfig?: { name: string; pickCount: number; duration: number }[];
  version?: number;
  questions: Question[];
}

export interface Student {
  id: string;
  examId: string;
  name: string;
  email: string;
  usn: string;
  class: string;
  year: string;
  section: string;
}

export interface Submission {
  id: string;
  examId: string;
  studentName: string;
  usn: string;
  email: string;
  class: string;
  year: string;
  section: string;
  score: number;
  violations: number;
  sectionScores?: Record<string, number>;
  answers?: Record<string, any>;
  justifications?: Record<string, string>;
  submittedAt: string | Date;
}

export interface ExamSession {
  storageKey: string;
  shuffledQuestionIds: string[];
  answers: Record<string, number | number[] | string>;
  visited: string[];
  markedForReview: string[];
  violations: number;
  violationEvents: { timestamp: number; reason: string; score: number }[];
  currentQ: number;
  currentSectionIndex: number;
  endTimestamp?: number;
  sectionEndTimestamps?: Record<string, number>;
  justifications: Record<string, string>;
}

interface ExamState {
  exams: Exam[];
  results: Submission[];
  students: Student[];
  loading: boolean;
  currentExam: Exam | null;
  student: Student | null;
  lastResult: {
    score: number;
    totalMarks: number;
    correct: number;
    wrong: number;
    violations: number;
    violationEvents: { timestamp: number; reason: string; score: number }[];
    sectionScores: Record<string, number>;
    answers: Record<string, any>;
    justifications: Record<string, string>;
    questions: Question[];
  } | null;
  examSession: ExamSession | null;
}

const initialState: ExamState = {
  exams: [],
  results: [],
  students: [],
  loading: true,
  currentExam: null,
  student: null,
  lastResult: null,
  examSession: null,
};

// Async Thunks
export const fetchExamsThunk = createAsyncThunk("exam/fetchExams", async () => {
  const resp = await fetch("/api/exams");
  if (!resp.ok) throw new Error("Failed to fetch exams");
  return (await resp.json()) as Exam[];
});

export const fetchResultsThunk = createAsyncThunk(
  "exam/fetchResults",
  async () => {
    const resp = await fetch("/api/results");
    if (!resp.ok) throw new Error("Failed to fetch results");
    return (await resp.json()) as Submission[];
  },
);

export const fetchStudentsThunk = createAsyncThunk(
  "exam/fetchStudents",
  async () => {
    const resp = await fetch("/api/students");
    if (!resp.ok) throw new Error("Failed to fetch students");
    return (await resp.json()) as Student[];
  },
);

export const addExamThunk = createAsyncThunk(
  "exam/addExam",
  async (exam: Exam) => {
    const resp = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exam),
    });
    if (!resp.ok) {
      const errorData = await resp
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        errorData.details || errorData.error || "Failed to create exam",
      );
    }
    return exam;
  },
);

export const updateExamThunk = createAsyncThunk(
  "exam/updateExam",
  async (exam: Exam) => {
    const resp = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exam),
    });
    if (!resp.ok) {
      const errorData = await resp
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        errorData.details || errorData.error || "Failed to update exam",
      );
    }
    return exam;
  },
);

export const deleteExamThunk = createAsyncThunk(
  "exam/deleteExam",
  async (id: string) => {
    const resp = await fetch(`/api/exams/${id}`, {
      method: "DELETE",
    });
    if (!resp.ok) {
      throw new Error("Failed to delete exam");
    }
    return id;
  },
);

export const addResultThunk = createAsyncThunk(
  "exam/addResult",
  async (result: Partial<Submission>, { dispatch }: any) => {
    const resp = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    if (!resp.ok) {
      const errData = await resp.json().catch(async () => {
        const text = await resp.text();
        return { error: text || "Unknown API error" };
      });
      throw new Error(errData.error || "Submission Failed");
    }
    dispatch(fetchResultsThunk());
    return true;
  },
);

export const registerStudentThunk = createAsyncThunk(
  "exam/registerStudent",
  async (data: Omit<Student, "id">) => {
    const resp = await fetch("/api/students/entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      throw new Error("Entry failed");
    }
    const { student } = await resp.json();
    localStorage.setItem("msq_student", JSON.stringify(student));
    return student as Student;
  },
);

export const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    setCurrentExam: (state: ExamState, action: PayloadAction<Exam | null>) => {
      state.currentExam = action.payload;
    },
    setLastResult: (
      state: ExamState,
      action: PayloadAction<ExamState["lastResult"]>,
    ) => {
      if (state.lastResult) {
        state.lastResult.correct = action.payload?.correct ?? 0;
        state.lastResult.wrong = action.payload?.wrong ?? 0;
        state.lastResult.violations = action.payload?.violations ?? 0;
        state.lastResult.violationEvents =
          action.payload?.violationEvents ?? [];
        state.lastResult.sectionScores = action.payload?.sectionScores ?? {};
      } else {
        state.lastResult = action.payload;
      }
    },
    clearLastResult: (state: ExamState) => {
      state.lastResult = null;
    },
    setStudent: (state: ExamState, action: PayloadAction<Student | null>) => {
      state.student = action.payload;
    },
    loadStudentFromStorage: (state: ExamState) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("msq_student");
        if (saved) {
          try {
            const student = JSON.parse(saved);
            state.student = student;
            // Also try to load the session for this student
            const sessionSaved = localStorage.getItem(
              `exam_prog_${student.examId}_${student.usn}`,
            );
            if (sessionSaved) {
              state.examSession = JSON.parse(sessionSaved);
            }
          } catch (e: any) {
            localStorage.removeItem("msq_student");
          }
        }
      }
    },
    logoutStudent: (state: ExamState) => {
      const { student } = state;
      if (typeof window !== "undefined" && student) {
        localStorage.removeItem(`exam_prog_${student.examId}_${student.usn}`);
        localStorage.removeItem("msq_student");
      }
      state.student = null;
      state.examSession = null;
    },
    setLoading: (state: ExamState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setExamSession: (
      state: ExamState,
      action: PayloadAction<ExamSession | null>,
    ) => {
      state.examSession = action.payload;
    },
    updateExamSession: (
      state: ExamState,
      action: PayloadAction<Partial<ExamSession>>,
    ) => {
      const currentSession = state.examSession;
      if (currentSession) {
        const updatedSession = { ...currentSession, ...action.payload };
        state.examSession = updatedSession;
        if (typeof window !== "undefined") {
          localStorage.setItem(
            updatedSession.storageKey,
            JSON.stringify(updatedSession),
          );
        }
      }
    },
    clearExamSession: (state: ExamState) => {
      state.examSession = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<ExamState>) => {
    // fetchExams
    builder.addCase(fetchExamsThunk.pending, (state: ExamState) => {
      state.loading = true;
    });
    builder.addCase(
      fetchExamsThunk.fulfilled,
      (state: ExamState, action: PayloadAction<Exam[]>) => {
        state.exams = action.payload;
        state.loading = false;
      },
    );
    builder.addCase(
      fetchExamsThunk.rejected,
      (state: ExamState, action: any) => {
        console.error(action.error);
        state.loading = false;
      },
    );

    // fetchResults
    builder.addCase(
      fetchResultsThunk.fulfilled,
      (state: ExamState, action: PayloadAction<Submission[]>) => {
        state.results = action.payload;
      },
    );

    // fetchStudents
    builder.addCase(
      fetchStudentsThunk.fulfilled,
      (state: ExamState, action: PayloadAction<Student[]>) => {
        state.students = action.payload;
      },
    );

    // addExam
    builder.addCase(
      addExamThunk.fulfilled,
      (state: ExamState, action: PayloadAction<Exam>) => {
        state.exams.push(action.payload);
      },
    );

    // updateExam
    builder.addCase(
      updateExamThunk.fulfilled,
      (state: ExamState, action: PayloadAction<Exam>) => {
        const index = state.exams.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.exams[index] = action.payload;
        }
      },
    );

    // deleteExam
    builder.addCase(
      deleteExamThunk.fulfilled,
      (state: ExamState, action: PayloadAction<string>) => {
        state.exams = state.exams.filter((e) => e.id !== action.payload);
      },
    );

    // addResult
    builder.addCase(
      addResultThunk.rejected,
      (state: ExamState, action: any) => {
        toast.error(action.error.message || "Failed to submit result");
      },
    );

    // registerStudent
    builder.addCase(
      registerStudentThunk.fulfilled,
      (state: ExamState, action: PayloadAction<Student>) => {
        state.student = action.payload;
      },
    );
  },
});

export const {
  setCurrentExam,
  setLastResult,
  clearLastResult,
  setStudent,
  loadStudentFromStorage,
  logoutStudent,
  setLoading,
  setExamSession,
  updateExamSession,
  clearExamSession,
} = examSlice.actions;

export default examSlice.reducer;
