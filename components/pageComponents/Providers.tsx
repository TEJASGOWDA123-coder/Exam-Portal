// lib/Providers.tsx
"use client"; // only this file is client-side

import { ReactNode } from "react";

// import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "../theme-provider";
import { Toaster } from "sonner";
import { ReduxProvider } from "./ReduxProvider";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ReduxProvider>{children}</ReduxProvider>
        <Toaster position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  );
}
