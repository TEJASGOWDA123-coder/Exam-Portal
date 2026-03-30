import React, { useEffect, useState } from "react";
// @ts-ignore
import { Clock } from "lucide-react";

interface TimerProps {
  endTimestamp: number; // Date.now() style timestamp
  onTimeUp: () => void;
  className?: string;
}

export default function Timer({ endTimestamp, onTimeUp, className = "" }: TimerProps) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((endTimestamp - Date.now()) / 1000)));

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp();
      return;
    }
    const interval = setInterval(() => {
      const nextRemaining = Math.max(0, Math.floor((endTimestamp - Date.now()) / 1000));
      setRemaining(nextRemaining);
      if (nextRemaining <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTimestamp, onTimeUp]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isLow = remaining < 60;

  return (
    <div className={`flex items-center gap-2 font-mono text-lg ${isLow ? "text-destructive animate-pulse" : "text-foreground"} ${className}`}>
      <Clock className="w-5 h-5" />
      <span>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
    </div>
  );
}
