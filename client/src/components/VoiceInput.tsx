import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, MicOffIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type RecordingState = "idle" | "recording" | "processing";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
}

export function VoiceInput({ onTranscript, disabled, className, showLabel }: VoiceInputProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
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
        setState("processing");

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
            toast({
              title: "Voice captured",
              description: "Your speech has been converted to text.",
            });
          }
        } catch (error) {
          console.error("Transcription error:", error);
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
    } catch (error) {
      console.error("Microphone access error:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
      });
    }
  }, [onTranscript, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setMediaRecorder(null);
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
        return "Recording... Click to stop";
      case "processing":
        return "Converting speech to text...";
      default:
        return "Click to dictate";
    }
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
    <Button
      type="button"
      variant={state === "recording" ? "destructive" : "outline"}
      size="icon"
      onClick={handleClick}
      disabled={disabled || state === "processing"}
      className={className}
      aria-label={getStatusText()}
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
  );

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{getStatusText()}</p>
        </TooltipContent>
      </Tooltip>
      {showLabel && (
        <span className="text-sm text-muted-foreground">{getStatusText()}</span>
      )}
      <span aria-live="polite" className="sr-only">
        {state !== "idle" && getStatusText()}
      </span>
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
