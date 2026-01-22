import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accessibility,
  Sun,
  Moon,
  Contrast,
  Type,
  Eye,
  MousePointer2,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { useAccessibility, type FontSize, type ContrastMode } from "./AccessibilityProvider";

const fontSizeLabels: Record<FontSize, string> = {
  normal: "Normal (100%)",
  large: "Large (125%)",
  "extra-large": "Extra Large (150%)",
};

const contrastModeLabels: Record<ContrastMode, { label: string; icon: typeof Sun }> = {
  normal: { label: "Standard", icon: Sun },
  dark: { label: "Dark Mode", icon: Moon },
  "high-contrast": { label: "High Contrast", icon: Contrast },
};

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const {
    fontSize,
    setFontSize,
    contrastMode,
    setContrastMode,
    reducedMotion,
    setReducedMotion,
    dyslexiaFont,
    setDyslexiaFont,
    readingFocus,
    setReadingFocus,
    largeTargets,
    setLargeTargets,
    resetToDefaults,
  } = useAccessibility();

  const fontSizeIndex = fontSize === "normal" ? 0 : fontSize === "large" ? 1 : 2;

  const handleFontSizeChange = (value: number[]) => {
    const sizes: FontSize[] = ["normal", "large", "extra-large"];
    setFontSize(sizes[value[0]]);
  };

  const announceChange = (message: string) => {
    const announcer = document.getElementById("announcer");
    if (announcer) {
      announcer.textContent = message;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg border-2 bg-background"
          aria-label="Open accessibility settings"
          data-testid="button-accessibility-panel"
        >
          <Accessibility className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        className="w-full sm:max-w-md overflow-y-auto" 
        side="right"
        aria-label="Accessibility Settings Panel"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Accessibility className="h-5 w-5" />
            Accessibility Settings
          </SheetTitle>
          <SheetDescription>
            Customize your experience to meet your needs. All changes are saved automatically.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          <section aria-labelledby="contrast-heading">
            <h3 id="contrast-heading" className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              Display Mode
            </h3>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="contrast-heading">
              {(Object.keys(contrastModeLabels) as ContrastMode[]).map((mode) => {
                const { label, icon: Icon } = contrastModeLabels[mode];
                const isSelected = contrastMode === mode;
                return (
                  <Button
                    key={mode}
                    variant={isSelected ? "default" : "outline"}
                    className="flex-col h-auto py-4 gap-2"
                    onClick={() => {
                      setContrastMode(mode);
                      announceChange(`Display mode changed to ${label}`);
                    }}
                    role="radio"
                    aria-checked={isSelected}
                    data-testid={`button-contrast-${mode}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{label}</span>
                  </Button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="font-heading">
            <h3 id="font-heading" className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text Size
            </h3>
            <div className="space-y-4">
              <Slider
                value={[fontSizeIndex]}
                onValueChange={handleFontSizeChange}
                max={2}
                step={1}
                className="w-full"
                aria-label="Text size"
                data-testid="slider-font-size"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>A</span>
                <span className="text-base">A</span>
                <span className="text-lg">A</span>
              </div>
              <p className="text-sm text-center font-medium" aria-live="polite">
                {fontSizeLabels[fontSize]}
              </p>
            </div>
          </section>

          <section aria-labelledby="visual-heading">
            <h3 id="visual-heading" className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visual Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="reduced-motion" className="text-sm font-medium cursor-pointer">
                    Reduce Motion
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={reducedMotion}
                  onCheckedChange={(checked) => {
                    setReducedMotion(checked);
                    announceChange(`Reduced motion ${checked ? "enabled" : "disabled"}`);
                  }}
                  data-testid="switch-reduced-motion"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="dyslexia-font" className="text-sm font-medium cursor-pointer">
                    Dyslexia-Friendly Font
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Use OpenDyslexic typeface
                  </p>
                </div>
                <Switch
                  id="dyslexia-font"
                  checked={dyslexiaFont}
                  onCheckedChange={(checked) => {
                    setDyslexiaFont(checked);
                    announceChange(`Dyslexia font ${checked ? "enabled" : "disabled"}`);
                  }}
                  data-testid="switch-dyslexia-font"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="reading-focus" className="text-sm font-medium cursor-pointer">
                    Reading Focus Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Highlight current content, dim surroundings
                  </p>
                </div>
                <Switch
                  id="reading-focus"
                  checked={readingFocus}
                  onCheckedChange={(checked) => {
                    setReadingFocus(checked);
                    announceChange(`Reading focus ${checked ? "enabled" : "disabled"}`);
                  }}
                  data-testid="switch-reading-focus"
                />
              </div>
            </div>
          </section>

          <section aria-labelledby="motor-heading">
            <h3 id="motor-heading" className="text-sm font-semibold mb-4 flex items-center gap-2">
              <MousePointer2 className="h-4 w-4" />
              Motor Accessibility
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="large-targets" className="text-sm font-medium cursor-pointer">
                    Large Touch Targets
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Increase button and link sizes
                  </p>
                </div>
                <Switch
                  id="large-targets"
                  checked={largeTargets}
                  onCheckedChange={(checked) => {
                    setLargeTargets(checked);
                    announceChange(`Large touch targets ${checked ? "enabled" : "disabled"}`);
                  }}
                  data-testid="switch-large-targets"
                />
              </div>
            </div>
          </section>

          <section aria-labelledby="audio-heading">
            <h3 id="audio-heading" className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Audio Features
            </h3>
            <p className="text-sm text-muted-foreground">
              Text-to-speech is available on posts and messages. Look for the speaker icon to have content read aloud.
            </p>
          </section>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                resetToDefaults();
                announceChange("All settings reset to defaults");
              }}
              data-testid="button-reset-accessibility"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pb-4">
            <p>Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">?</kbd> for keyboard shortcuts</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
