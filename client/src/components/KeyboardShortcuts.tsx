import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["?"], description: "Show keyboard shortcuts", category: "General" },
  { keys: ["g", "h"], description: "Go to home / Village Square", category: "Navigation" },
  { keys: ["g", "g"], description: "Go to groups", category: "Navigation" },
  { keys: ["g", "p"], description: "Go to profile", category: "Navigation" },
  { keys: ["g", "r"], description: "Go to recognition", category: "Navigation" },
  { keys: ["g", "a"], description: "Go to games", category: "Navigation" },
  { keys: ["n"], description: "Create new post", category: "Actions" },
  { keys: ["Escape"], description: "Close modal / cancel", category: "General" },
  { keys: ["/"], description: "Focus search", category: "General" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const isInteractiveElement = (element: EventTarget | null): boolean => {
    if (!element || !(element instanceof HTMLElement)) return false;
    
    const tagName = element.tagName.toLowerCase();
    const interactiveTags = ['input', 'textarea', 'select', 'button', 'a'];
    
    if (interactiveTags.includes(tagName)) return true;
    if (element.isContentEditable) return true;
    if (element.getAttribute('role') === 'textbox') return true;
    if (element.getAttribute('role') === 'button') return true;
    
    return false;
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isInteractiveElement(e.target)) {
      if (e.key === "Escape") {
        setOpen(false);
        setPendingKey(null);
      }
      return;
    }

    if (e.key === "?") {
      e.preventDefault();
      setOpen(true);
      return;
    }

    if (e.key === "Escape") {
      setOpen(false);
      setPendingKey(null);
      return;
    }

    if (pendingKey === "g") {
      e.preventDefault();
      switch (e.key) {
        case "h":
          setLocation("/");
          break;
        case "g":
          setLocation("/groups");
          break;
        case "p":
          setLocation("/profile");
          break;
        case "r":
          setLocation("/recognition");
          break;
        case "a":
          setLocation("/games");
          break;
      }
      setPendingKey(null);
      return;
    }

    if (e.key === "g") {
      setPendingKey("g");
      setTimeout(() => setPendingKey(null), 1500);
      return;
    }

    if (e.key === "n") {
      const createPostButton = document.querySelector('[data-testid="button-create-post"]') as HTMLButtonElement;
      if (createPostButton) {
        createPostButton.click();
      }
      return;
    }

    if (e.key === "/") {
      e.preventDefault();
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="earch"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [pendingKey, setLocation]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <>
      {pendingKey && (
        <div 
          className="fixed bottom-20 right-6 z-50 bg-card border shadow-lg rounded-lg px-4 py-2 animate-in fade-in"
          role="status"
          aria-live="polite"
        >
          <span className="text-sm font-medium">
            Press next key... <kbd className="ml-2 px-2 py-1 bg-muted rounded text-xs font-mono">{pendingKey}</kbd>
          </span>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg" aria-labelledby="shortcuts-title">
          <DialogHeader>
            <DialogTitle id="shortcuts-title" className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these keyboard shortcuts to navigate quickly without a mouse.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">{category}</h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, j) => (
                          <span key={j}>
                            <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono min-w-[28px] text-center inline-block">
                              {key}
                            </kbd>
                            {j < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-muted-foreground text-xs">then</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">Escape</kbd> to close
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
