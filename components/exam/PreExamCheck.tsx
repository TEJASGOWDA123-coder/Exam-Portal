"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Camera, Mic, Signal, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface PreExamCheckProps {
  onProceed: () => void;
  examTitle: string;
}

export default function PreExamCheck({ onProceed, examTitle }: PreExamCheckProps) {
  const [checks, setChecks] = useState({
    camera: false,
    mic: false,
    network: false,
  });
  const [loading, setLoading] = useState({
    camera: true,
    mic: true,
    network: true,
  });
  const [latency, setLatency] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    checkMedia();
    checkNetwork();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const checkMedia = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setChecks(prev => ({ ...prev, camera: true, mic: true }));
    } catch (err) {
      toast.error("Media permission denied. Please allow camera and mic access.");
      setChecks(prev => ({ ...prev, camera: false, mic: false }));
    } finally {
      setLoading(prev => ({ ...prev, camera: false, mic: false }));
    }
  };

  const checkNetwork = async () => {
    const start = Date.now();
    try {
      await fetch("https://www.google.com/favicon.ico", { mode: 'no-cors', cache: 'no-store' });
      const lat = Date.now() - start;
      setLatency(lat);
      setChecks(prev => ({ ...prev, network: lat < 500 }));
    } catch (err) {
      setChecks(prev => ({ ...prev, network: false }));
    } finally {
      setLoading(prev => ({ ...prev, network: false }));
    }
  };

  const allPassed = Object.values(checks).every(v => v);

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-6 animate-fade-in">
      <Card className="max-w-4xl w-full shadow-2xl border-border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 bg-background border-r border-border">
            <CardHeader className="p-0 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Pre-Exam Verification</CardTitle>
              <CardDescription>Setup your environment for {examTitle}</CardDescription>
            </CardHeader>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${checks.camera ? "border-green-500/30 bg-green-500/5" : "border-border"}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Camera</p>
                    <p className="text-[10px] text-muted-foreground">{loading.camera ? "Checking..." : (checks.camera ? "Ready" : "Not Found")}</p>
                  </div>
                </div>
                {loading.camera ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : (checks.camera ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-destructive" />)}
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${checks.mic ? "border-green-500/30 bg-green-500/5" : "border-border"}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Microphone</p>
                    <p className="text-[10px] text-muted-foreground">{loading.mic ? "Checking..." : (checks.mic ? "Ready" : "Not Found")}</p>
                  </div>
                </div>
                {loading.mic ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : (checks.mic ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-destructive" />)}
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${checks.network ? "border-green-500/30 bg-green-500/5" : "border-border"}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Signal className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Network Speed</p>
                    <p className="text-[10px] text-muted-foreground">{loading.network ? "Checking..." : (latency ? `${latency}ms latency` : "Poor connection")}</p>
                  </div>
                </div>
                {loading.network ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : (checks.network ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-destructive" />)}
              </div>
            </div>

            <Button 
              className="w-full h-12 mt-8 font-bold text-md group" 
              disabled={!allPassed}
              onClick={onProceed}
            >
              Proceed to Exam
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {!allPassed && !loading.camera && !loading.mic && !loading.network && (
              <p className="text-[10px] text-center text-destructive mt-4 font-medium italic">
                Please resolve all issues to start the test.
              </p>
            )}
          </div>

          <div className="bg-muted p-8 flex flex-col items-center justify-center text-center">
            <div className="w-full aspect-video bg-black rounded-2xl border-4 border-background shadow-lg overflow-hidden relative mb-6">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] text-white flex items-center gap-1.5 font-bold">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  PREVIEW
                </div>
              </div>
            </div>
            <div className="max-w-xs">
              <h4 className="font-bold text-sm mb-2">Instructions</h4>
              <ul className="text-[11px] text-muted-foreground space-y-2 text-left list-disc pl-4">
                <li>Ensure you are in a brightly lit room.</li>
                <li>Keep your mobile phone away from your reach.</li>
                <li>Do NOT use headsets or earphones.</li>
                <li>Looking away from the screen will be flagged.</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
