"use client";

import { useState, useRef, useCallback } from "react";
import { useLanguage } from "@/features/auth/i18n/language-context";

type VoiceRecorderState = "idle" | "recording" | "processing" | "success" | "error";

interface VoiceRecorderProps {
  passphrase?: string;
  mode: "enroll" | "login";
  onRecordComplete: (audioBlob: Blob) => Promise<void>;
  onError?: (error: string) => void;
}

function LiquidButton({ children, onClick, disabled, variant = "primary", className = "" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const baseColor = variant === "primary" ? "from-rose-500 to-purple-600" : variant === "danger" ? "from-red-500 to-red-600" : "from-slate-300 to-slate-400";
  const hoverColor = variant === "primary" ? "from-rose-400 to-purple-500" : variant === "danger" ? "from-red-400 to-red-500" : "from-slate-200 to-slate-300";
  const textColor = variant === "secondary" ? "text-slate-700" : "text-white";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-xl font-bold py-4 px-8 transition-all duration-300 ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] hover:shadow-xl"} ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${isHovered ? hoverColor : baseColor} transition-all duration-300`} />
      {isHovered && (
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 rounded-full blur-xl animate-pulse" />
        </div>
      )}
      <span className={`relative z-10 ${textColor} drop-shadow-md`}>{children}</span>
    </button>
  );
}

function LiquidMicButton({ state, onClick, disabled }: { 
  state: VoiceRecorderState; 
  onClick: () => void; 
  disabled?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const colors = {
    idle: "from-rose-500 to-purple-600",
    recording: "from-red-500 to-red-600",
    processing: "from-slate-400 to-slate-500",
    success: "from-green-500 to-emerald-600",
    error: "from-red-600 to-rose-700",
  };
  
  const icons = {
    idle: (
      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
      </svg>
    ),
    recording: <div className="w-7 h-7 bg-white rounded-lg animate-pulse" />,
    processing: <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin" />,
    success: (
      <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    ),
    error: (
      <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    ),
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${disabled ? "opacity-50" : "hover:scale-105 hover:shadow-2xl"}`}
    >
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors[state]} transition-all duration-300`} />
      
      {isHovered && state === "idle" && (
        <div className="absolute inset-0 rounded-full">
          <div className="absolute top-2 left-1/4 w-2 h-2 bg-white/70 rounded-full animate-ping" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white/50 rounded-full animate-ping" style={{ animationDelay: "100ms" }} />
          <div className="absolute bottom-1/4 left-1/3 w-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: "200ms" }} />
        </div>
      )}
      
      {state === "recording" && (
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-2 rounded-full bg-red-400/30 animate-ping" />
          <div className="absolute inset-4 rounded-full bg-red-400/20 animate-ping" style={{ animationDelay: "200ms" }} />
        </div>
      )}
      
      <div className="relative z-10">{icons[state]}</div>
    </button>
  );
}

export function VoiceRecorder({ passphrase, mode, onRecordComplete, onError }: VoiceRecorderProps) {
  const [state, setState] = useState<VoiceRecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);
  const { t } = useLanguage();

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") 
        ? "audio/webm;codecs=opus" 
        : "audio/webm";
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 512;
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") return;
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.slice(0, 64).reduce((a, b) => a + b, 0) / 64;
        setAudioLevel(average / 255);
        requestAnimationFrame(updateLevel);
      };

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        stream.getTracks().forEach(t => t.stop());
        audioContext.close();
        setAudioLevel(0);
        clearInterval(timerRef.current);
        
        setRecorded(true);
        setState("processing");

        try {
          await onRecordComplete(audioBlob);
          setState("success");
        } catch (caughtError) {
          const msg = caughtError instanceof Error ? caughtError.message : "Error";
          setError(msg);
          setState("error");
          onError?.(msg);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(50);
      setState("recording");
      setDuration(0);
      updateLevel();
      timerRef.current = window.setInterval(() => setDuration(d => d + 1), 1000);
    } catch (caughtError) {
      const msg = caughtError instanceof Error ? caughtError.message : "Microphone access denied";
      setError(msg);
      setState("error");
      onError?.(msg);
    }
  }, [onRecordComplete, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, [state]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const generateWaveform = () => {
    const bars = 40;
    return Array.from({ length: bars }, (_, i) => {
      if (state === "recording" && audioLevel > 0) {
        const offset = Math.sin(i * 0.3 + Date.now() * 0.01) * 0.3;
        return Math.max(0.1, Math.min(1, audioLevel + offset));
      }
      return 0.1;
    });
  };

  const statusText = {
    idle: t.login.pressToSpeak,
    recording: t.login.listening,
    processing: t.login.verifying,
    success: t.login.voiceRecognized,
    error: t.login.error,
  }[state];

  return (
    <div className="py-8">
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center">
        {state === "recording" && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-500 font-medium">{formatTime(duration)}</span>
          </div>
        )}

        <div className="h-16 flex items-center justify-center gap-1 w-full max-w-xs mb-8">
          {generateWaveform().map((level, i) => (
            <div
              key={i}
              className="w-1 bg-rose-500 rounded-full transition-all"
              style={{ height: `${Math.max(4, level * 60)}px` }}
            />
          ))}
        </div>

        <LiquidMicButton
          state={state}
          onClick={state === "recording" ? stopRecording : startRecording}
          disabled={state === "processing"}
        />

        <p className="mt-6 text-center text-slate-500">
          {statusText}
        </p>
      </div>
    </div>
  );
}

export { LiquidButton };