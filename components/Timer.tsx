import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  durationSeconds: number;
  onTimeUp: () => void;
  className?: string;
}

export default function Timer({ durationSeconds, onTimeUp, className = "" }: TimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    if (remaining <= 0) { onTimeUp(); return; }
    const interval = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(interval);
  }, [remaining, onTimeUp]);

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
