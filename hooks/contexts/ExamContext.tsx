"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

export interface Question {
  id: string;
  type: "mcq" | "msq" | "text";
  question: string;
  questionImage?: string; // Base64
  options?: { text: string; image?: string }[];
  correctAnswer: string; // indices "0", "0,1" or literal text for type="text"
  section: string;
  marks: number;
  requiresJustification?: boolean;
  solution?: string;
}

export interface Exam {
  id: string;
  title: string;
  duration: number; // minutes
  totalMarks: number;
  startTime: string;
  endTime: string;
  status: "active" | "upcoming" | "completed";
  proctoringEnabled?: boolean | number;
  showResults?: boolean | number;
  requireSeb?: boolean | number;
  sebKey?: string;
  sectionsConfig?: { name: string; pickCount: number }[];
  questions: Question[];
}

export interface Student {
  id: string;
  examId: string;
  name: string;
  email: string;
  usn: string;
  class: string;
  section: string;
}

export interface Submission {
  id: string;
  examId: string;
  studentName: string;
  usn: string;
  email: string;
  class: string;
  section: string;
  score: number;
  violations: number;
  sectionScores?: Record<string, number>;
  justifications?: Record<string, string>;
  submittedAt: string | Date;
}

interface ExamContextType {
  exams: Exam[];
  results: Submission[];
  students: Student[];
  fetchStudents: () => Promise<void>;
  addExam: (exam: Exam) => Promise<boolean>;
  updateExam: (exam: Exam) => Promise<boolean>;
  addResult: (result: Partial<Submission>) => Promise<boolean>;
  deleteExam: (id: string) => Promise<boolean>;
  fetchResults: () => Promise<void>;
  loading: boolean;
  currentExam: Exam | null;
  setCurrentExam: (exam: Exam | null) => void;
  student: Student | null;
  registerStudent: (data: Omit<Student, "id">) => Promise<boolean>;
  logoutStudent: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Submission[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const { data: session } = useSession();

  const fetchExams = async () => {
    try {
      const resp = await fetch("/api/exams");
      if (resp.ok) {
        const data = await resp.json();
        setExams(data);
      }
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const resp = await fetch("/api/results");
      if (resp.ok) {
        const data = await resp.json();
        setResults(data);
      }
    } catch (err) {
      console.error("Failed to fetch results:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const resp = await fetch("/api/students");
      if (resp.ok) {
        const data = await resp.json();
        setAllStudents(data);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };

  useEffect(() => {
    fetchExams();
    // Load student from localStorage if exists
    const saved = localStorage.getItem("msq_student");
    if (saved) {
      try {
        setStudent(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("msq_student");
      }
    }
  }, []);

  useEffect(() => {
    const role = (session?.user as any)?.role;
    if (role === "admin" || role === "superadmin") {
      fetchResults();
      fetchStudents();
    }
  }, [session]);

  const addExam = async (exam: Exam) => {
    try {
      const resp = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exam),
      });
      if (resp.ok) {
        setExams((prev) => [...prev, exam]);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to add exam:", err);
      return false;
    }
  };

  const updateExam = async (exam: Exam): Promise<boolean> => {
    setExams((prev) => prev.map((e) => (e.id === exam.id ? exam : e)));
    try {
      const resp = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exam),
      });
      return resp.ok;
    } catch (err) {
      console.error("Failed to update exam:", err);
      return false;
    }
  };

  const deleteExam = async (id: string) => {
    try {
      const resp = await fetch(`/api/exams/${id}`, {
        method: "DELETE",
      });
      if (resp.ok) {
        setExams((prev) => prev.filter((e) => e.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete exam:", err);
      return false;
    }
  };

  const addResult = async (result: Partial<Submission>) => {
    try {
      const resp = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      if (resp.ok) {
        fetchResults();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to add result:", err);
      return false;
    }
  };

  const registerStudent = async (data: Omit<Student, "id">) => {
    try {
      const resp = await fetch("/api/students/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (resp.ok) {
        const { student } = await resp.json();
        setStudent(student);
        localStorage.setItem("msq_student", JSON.stringify(student));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Entry failed:", error);
      return false;
    }
  };

  const logoutStudent = () => {
    setStudent(null);
    localStorage.removeItem("msq_student");
  };

  return (
    <ExamContext.Provider
      value={{
        exams,
        results,
        students: allStudents,
        fetchStudents,
        addExam,
        updateExam,
        deleteExam,
        addResult,
        fetchResults,
        loading,
        currentExam,
        setCurrentExam,
        student,
        registerStudent,
        logoutStudent,
      }}
    >
      {!loading && children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be used within ExamProvider");
  return ctx;
}
