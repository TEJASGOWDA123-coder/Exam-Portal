// lib/Providers.tsx
"use client"; // only this file is client-side

import { ReactNode } from "react";

// import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "../theme-provider";
import { Toaster } from "sonner";
import { ExamProvider } from "@/hooks/contexts/ExamContext";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ExamProvider>{children}</ExamProvider>
        <Toaster position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  );
}
