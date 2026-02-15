"use client";

import { useEffect, useRef, useState,memo } from "react";
import { AlertTriangle } from "lucide-react";

interface AIProctorProps {
  onViolation: (reason: string, points: number) => void;
}
 function AIProctor ({ onViolation }: AIProctorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeViolations, setActiveViolations] = useState<string[]>([]);
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  const addRisk = (points: number, reason: string) => {
    onViolationRef.current?.(reason, points);
    setActiveViolations(prev => {
      if (prev.includes(reason)) return prev;
      const next = [...prev, reason];
      setTimeout(() => {
        setActiveViolations(current => current.filter(r => r !== reason));
      }, 3000);
      return next;
    });
  };

  useEffect(() => {
    let stream: MediaStream;
    let animationFrameId: number;
    let faceMesh: any;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array<ArrayBuffer>;
    let isInitialized = false;
    let isClosed = false;

    let lipOpenFrames = 0;
    let headTurnFrames = 0;
    let loudAudioFrames = 0;
    const loadScript = (src: string) =>
      new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });

    const initialize = async () => {
      // Load MediaPipe from CDN
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
      );

      // @ts-ignore
      if (window.FaceMesh) {
        // @ts-ignore
        faceMesh = new window.FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: false,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        faceMesh.onResults((results: any) => {
          if (isClosed) return;
          if (!results.multiFaceLandmarks?.length) {
            addRisk(25, "Face not detected");
            return;
          }

          const landmarks = results.multiFaceLandmarks[0];
          detectLipMovement(landmarks);
          detectHeadTurn(landmarks);
        });

        // Add a small delay to ensure WASM is truly parsed
        await new Promise(r => setTimeout(r, 500));
        isInitialized = true;
      }

      try {
        // Get Camera + Mic
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            frameRate: { ideal: 15, max: 20 },
          },
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Setup Audio Analyzer
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);

        const detectLoop = async () => {
          if (isClosed) return;
          
          if (videoRef.current && videoRef.current.readyState >= 2 && isInitialized && faceMesh) {
            try {
              await faceMesh.send({ image: videoRef.current });
            } catch (err) {
              console.warn("MediaPipe send error (retrying):", err);
              // Avoid spamming if it really fails
            }
          }
          
          if (analyser) {
            monitorAudio();
          }
          if (canvasRef.current && analyser) {
            drawAudioGraph(analyser, dataArray);
          }
          animationFrameId = requestAnimationFrame(detectLoop);
        };

        detectLoop();
      } catch (err) {
        console.error("Failed to access media devices:", err);
      }
    };

    const detectLipMovement = (landmarks: any) => {
      const upperLip = landmarks[13];
      const lowerLip = landmarks[14];
      const distance = Math.abs(upperLip.y - lowerLip.y);

      if (distance > 0.02) {
        lipOpenFrames++;
      } else {
        lipOpenFrames = 0;
      }

      if (lipOpenFrames > 12) {
        addRisk(10, "Continuous lip movement");
        lipOpenFrames = 0;
      }
    };

    const detectHeadTurn = (landmarks: any) => {
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      const nose = landmarks[1];

      const midEyeX = (leftEye.x + rightEye.x) / 2;
      const deviation = Math.abs(nose.x - midEyeX);

      if (deviation > 0.04) {
        headTurnFrames++;
      } else {
        headTurnFrames = 0;
      }

      if (headTurnFrames > 15) {
        addRisk(15, "Looking sideways too long");
        headTurnFrames = 0;
      }
    };

    const monitorAudio = () => {
      if (!analyser) return;

      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      if (avg > 60) {
        loudAudioFrames++;
      } else {
        loudAudioFrames = 0;
      }

      if (loudAudioFrames > 15) {
        addRisk(20, "Sustained loud audio");
        loudAudioFrames = 0;
      }
    };

    const drawAudioGraph = (analyser: AnalyserNode, dataArray: Uint8Array<ArrayBuffer>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bufferLength = analyser.frequencyBinCount;
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    initialize();

    return () => {
      isClosed = true;
      cancelAnimationFrame(animationFrameId);
      stream?.getTracks().forEach((track) => track.stop());
      audioContext?.close();
      if (faceMesh) {
        faceMesh.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 items-center p-4 bg-card border border-border rounded-xl shadow-sm">
      <div className="relative group">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-[320px] rounded-lg border-2 border-primary/20 aspect-video object-cover"
        />
        <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
          Live Proctoring Active
        </div>
        
        {activeViolations.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 backdrop-blur-[2px] rounded-lg">
            {activeViolations.map((reason, i) => (
              <div key={i} className="flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-md text-xs font-bold animate-bounce mb-2">
                <AlertTriangle className="w-3 h-3" />
                {reason}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-[320px] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>Audio Frequency</span>
          <span className="text-primary">Live</span>
        </div>
        <canvas
          ref={canvasRef}
          width={320}
          height={60}
          className="w-full bg-muted/30 rounded-lg border border-border"
        />
      </div>
    </div>
  );
}


export default memo(AIProctor)