"use client";

import { useEffect, useRef, useState, memo } from "react";
import { AlertTriangle } from "lucide-react";

interface AIProctorProps {
  onViolation: (reason: string, points: number) => void;
  isFinished?: boolean;
  existingStream?: MediaStream | null;
}

function AIProctor({ onViolation, isFinished, existingStream }: AIProctorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeViolations, setActiveViolations] = useState<string[]>([]);
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  const addRisk = (points: number, reason: string) => {
    onViolationRef.current?.(reason, points);

    setActiveViolations((prev) => {
      if (prev.includes(reason)) return prev;
      const next = [...prev, reason];

      setTimeout(() => {
        setActiveViolations((current) =>
          current.filter((r) => r !== reason)
        );
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

    let isClosed = false;
    let isInitialized = false;

    let lipOpenFrames = 0;
    let headTurnFrames = 0;

    let speechStartTime: number | null = null;
    let lipRecentlyActive = false;

    const loadScript = (src: string) =>
      new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });

    const initialize = async () => {
      // Use existing stream if available, otherwise request new one
      const streamPromise = existingStream 
        ? Promise.resolve(existingStream)
        : navigator.mediaDevices.getUserMedia({
            video: {
              width: 640,
              height: 480,
              frameRate: { ideal: 15, max: 20 },
            },
            audio: true,
          });

      const scriptPromise = loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
      );

      try {
        // Wait for both to be ready
        const [userStream] = await Promise.all([streamPromise, scriptPromise]);
        stream = userStream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Initialize FaceMesh after script is loaded
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

          // Model is ready immediately after setOptions and first send
          isInitialized = true;
        }

        // Setup Audio analysis
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);

        detectLoop();
      } catch (err) {
        console.error("Proctoring initialization failed:", err);
      }
    };

    const detectLoop = async () => {
      if (isClosed) return;

      if (
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        isInitialized &&
        faceMesh
      ) {
        try {
          await faceMesh.send({ image: videoRef.current });
        } catch (e) {
          console.warn("FaceMesh send error:", e);
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

    const detectLipMovement = (landmarks: any) => {
      const upperLip = landmarks[13];
      const lowerLip = landmarks[14];
      const distance = Math.abs(upperLip.y - lowerLip.y);

      if (distance > 0.02) {
        lipOpenFrames++;
        lipRecentlyActive = true;
        setTimeout(() => (lipRecentlyActive = false), 2000);
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

      // 1. Speech Band (approx 400Hz - 2kHz)
      let speechEnergy = 0;
      for (let i = 10; i < 45; i++) {
        speechEnergy += dataArray[i];
      }
      speechEnergy /= 35;

      // 2. High Frequency / Noise Band (Upper range)
      // Mechanical noises like footsteps or chair scrapes usually have significant energy here too
      let highFreqNoise = 0;
      for (let i = 80; i < 120; i++) {
        highFreqNoise += dataArray[i];
      }
      highFreqNoise /= 40;

      // 3. Overall Volume
      let totalEnergy = 0;
      for (let i = 0; i < dataArray.length; i++) {
        totalEnergy += dataArray[i];
      }
      totalEnergy /= dataArray.length;

      const now = Date.now();

      // Ratio logic: Human speech is usually harmonically rich in the mid-band
      // Broadband noise (footsteps, thumps) will have highFreqNoise move in tandem with speechEnergy
      const speechRatio = speechEnergy / (highFreqNoise + 1);

      // Voice Detection Criteria:
      // - speechEnergy is loud enough (> 65)
      // - speechRatio is high (> 1.5) indicating speech dominance over background hiss/thumps
      // - totalEnergy is not EXTREME (which would be a non-speech bang)
      const isVoiceLike = speechEnergy > 65 && speechRatio > 1.5 && totalEnergy < 170;

      if (isVoiceLike) {
        if (!speechStartTime) {
          speechStartTime = now;
        }

        // Must sustain for 2 seconds to be counted as actual speech
        if (now - speechStartTime > 2000) {
          if (lipRecentlyActive) {
            addRisk(25, "Speech detected with lip movement");
          } else {
            addRisk(1, "Background speech detected");
          }
          speechStartTime = null;
        }
      } else {
        // Drop threshold slightly for "tailing" sounds
        if (speechEnergy < 45 || speechRatio < 1.2) {
          speechStartTime = null;
        }
      }
    };


    const drawAudioGraph = (
      analyser: AnalyserNode,
      dataArray: Uint8Array<ArrayBuffer>
    ) => {
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
        ctx.fillRect(
          x,
          canvas.height - barHeight / 2,
          barWidth,
          barHeight / 2
        );
        x += barWidth + 1;
      }
    };

    initialize();

    return () => {
      isClosed = true;
      cancelAnimationFrame(animationFrameId);
      stream?.getTracks().forEach((t) => t.stop());
      audioContext?.close();
      faceMesh?.close?.();
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

        {activeViolations.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 backdrop-blur-[2px] rounded-lg">
            {activeViolations.map((reason, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-destructive text-white px-3 py-1 rounded-md text-xs font-bold animate-bounce mb-2 shadow-lg"
              >
                <AlertTriangle className="w-3 h-3" />
                {reason}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-[320px] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>Audio Spectrum</span>
          <span className="text-primary animate-pulse">Monitoring</span>
        </div>
        <canvas
          ref={canvasRef}
          width={320}
          height={60}
          className="w-full bg-muted/30 rounded-lg border border-border overflow-hidden"
        />
      </div>
    </div>
  );
}

export default memo(AIProctor);
