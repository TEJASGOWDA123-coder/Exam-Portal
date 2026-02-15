"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LegacyStartRedirect() {
  const { examId } = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/start/exam/${examId}`);
  }, [examId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );
}
