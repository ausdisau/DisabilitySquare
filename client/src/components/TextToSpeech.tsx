import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TextToSpeechProps {
  text: string;
  label?: string;
}

const announceToScreenReader = (message: string) => {
  const announcer = document.getElementById("announcer");
  if (announcer) {
    announcer.textContent = message;
  }
};

export function TextToSpeech({ text, label = "Read aloud" }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      announceToScreenReader("Speech paused");
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      announceToScreenReader("Speech resumed");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      announceToScreenReader("Started reading content");
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      announceToScreenReader("Finished reading content");
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      announceToScreenReader("Speech stopped");
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSpeak}
            aria-label={isPlaying ? (isPaused ? "Resume reading" : "Pause reading") : label}
            data-testid="button-text-to-speech"
          >
            {isPlaying ? (
              isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isPlaying ? (isPaused ? "Resume" : "Pause") : label}
        </TooltipContent>
      </Tooltip>

      {isPlaying && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStop}
              aria-label="Stop reading"
              data-testid="button-stop-speech"
            >
              <VolumeX className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Stop</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
