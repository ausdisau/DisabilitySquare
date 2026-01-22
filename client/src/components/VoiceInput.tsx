import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, MicOffIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type RecordingState = "idle" | "recording" | "processing";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
}

const announceToScreenReader = (message: string) => {
  const announcer = document.getElementById("announcer");
  if (announcer) {
    announcer.textContent = message;
  }
};

export function VoiceInput({ onTranscript, disabled, className, showLabel }: VoiceInputProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(100, average * 1.5));
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      announceToScreenReader("Starting voice recording. Speak now.");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/mp4";
      
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        audioContext.close();
        analyserRef.current = null;
        setAudioLevel(0);
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
        setRecordingDuration(0);
        
        setState("processing");
        announceToScreenReader("Processing your voice input. Please wait.");

        try {
          const blob = new Blob(chunks, { type: mimeType });
          const base64 = await blobToBase64(blob);
          
          const response = await apiRequest<{ transcript: string }>("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: base64 }),
          });
          
          if (response.transcript) {
            onTranscript(response.transcript);
            announceToScreenReader(`Voice input successful. Text added: ${response.transcript}`);
            toast({
              title: "Voice captured",
              description: "Your speech has been converted to text.",
            });
          }
        } catch (error) {
          console.error("Transcription error:", error);
          announceToScreenReader("Voice transcription failed. Please try again.");
          toast({
            title: "Transcription failed",
            description: "Could not convert speech to text. Please try again.",
            variant: "destructive",
          });
        } finally {
          setState("idle");
        }
      };

      recorder.start(100);
      setMediaRecorder(recorder);
      setState("recording");
      setRecordingDuration(0);
      
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      updateAudioLevel();
      
    } catch (error) {
      console.error("Microphone access error:", error);
      announceToScreenReader("Microphone access denied. Please allow microphone access to use voice input.");
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
      });
    }
  }, [onTranscript, toast, updateAudioLevel]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setMediaRecorder(null);
      announceToScreenReader("Recording stopped. Processing voice input.");
    }
  }, [mediaRecorder]);

  const handleClick = () => {
    if (state === "recording") {
      stopRecording();
    } else if (state === "idle") {
      startRecording();
    }
  };

  const getStatusText = () => {
    switch (state) {
      case "recording":
        return `Recording (${recordingDuration}s)... Click to stop`;
      case "processing":
        return "Converting speech to text...";
      default:
        return "Click to dictate";
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  if (!isSupported) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled
            className={className}
            data-testid="button-voice-input-unsupported"
          >
            <MicOffIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Voice input is not supported in your browser</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const button = (
    <div className="relative">
      {state === "recording" && (
        <div 
          className="absolute inset-0 rounded-md bg-destructive/20 animate-pulse"
          style={{ 
            transform: `scale(${1 + audioLevel / 200})`,
            transition: 'transform 0.1s ease-out'
          }}
          aria-hidden="true"
        />
      )}
      <Button
        type="button"
        variant={state === "recording" ? "destructive" : "outline"}
        size="icon"
        onClick={handleClick}
        disabled={disabled || state === "processing"}
        className={cn(
          className,
          state === "recording" && "ring-2 ring-destructive ring-offset-2 ring-offset-background"
        )}
        aria-label={getStatusText()}
        aria-pressed={state === "recording"}
        data-testid="button-voice-input"
      >
        {state === "processing" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : state === "recording" ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{getStatusText()}</p>
        </TooltipContent>
      </Tooltip>
      
      {state === "recording" && (
        <div className="flex items-center gap-2" aria-hidden="true">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-destructive rounded-full transition-all duration-100"
                style={{ 
                  height: `${Math.max(4, Math.min(16, audioLevel / 8 + (i === 2 ? 4 : 0)))}px`,
                  opacity: audioLevel > i * 20 ? 1 : 0.3
                }}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-destructive font-medium">
            {formatDuration(recordingDuration)}
          </span>
        </div>
      )}
      
      {state === "processing" && (
        <span className="text-xs text-muted-foreground animate-pulse">
          Processing...
        </span>
      )}
      
      {showLabel && state === "idle" && (
        <span className="text-sm text-muted-foreground">{getStatusText()}</span>
      )}
    </div>
  );
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.readAsDataURL(blob);
  });
}
