import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type FontSize = "normal" | "large" | "extra-large";
export type ContrastMode = "normal" | "high-contrast" | "dark";

interface AccessibilitySettings {
  fontSize: FontSize;
  contrastMode: ContrastMode;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  readingFocus: boolean;
  largeTargets: boolean;
}

interface AccessibilityContextType extends AccessibilitySettings {
  setFontSize: (size: FontSize) => void;
  setContrastMode: (mode: ContrastMode) => void;
  setReducedMotion: (enabled: boolean) => void;
  setDyslexiaFont: (enabled: boolean) => void;
  setReadingFocus: (enabled: boolean) => void;
  setLargeTargets: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: "normal",
  contrastMode: "normal",
  reducedMotion: false,
  dyslexiaFont: false,
  readingFocus: false,
  largeTargets: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = "accessibility-settings";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {
          return defaultSettings;
        }
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return { ...defaultSettings, reducedMotion: true };
      }
      if (window.matchMedia("(prefers-contrast: more)").matches) {
        return { ...defaultSettings, contrastMode: "high-contrast" };
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.remove("text-normal", "text-large", "text-xlarge");
    if (settings.fontSize === "large") root.classList.add("text-large");
    if (settings.fontSize === "extra-large") root.classList.add("text-xlarge");

    root.classList.remove("high-contrast", "dark");
    if (settings.contrastMode === "high-contrast") root.classList.add("high-contrast");
    if (settings.contrastMode === "dark") root.classList.add("dark");

    if (settings.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    if (settings.dyslexiaFont) {
      root.classList.add("dyslexia-font");
    } else {
      root.classList.remove("dyslexia-font");
    }

    if (settings.readingFocus) {
      root.classList.add("reading-focus");
    } else {
      root.classList.remove("reading-focus");
    }

    if (settings.largeTargets) {
      root.classList.add("large-targets");
    } else {
      root.classList.remove("large-targets");
    }
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const value: AccessibilityContextType = {
    ...settings,
    setFontSize: (size) => updateSetting("fontSize", size),
    setContrastMode: (mode) => updateSetting("contrastMode", mode),
    setReducedMotion: (enabled) => updateSetting("reducedMotion", enabled),
    setDyslexiaFont: (enabled) => updateSetting("dyslexiaFont", enabled),
    setReadingFocus: (enabled) => updateSetting("readingFocus", enabled),
    setLargeTargets: (enabled) => updateSetting("largeTargets", enabled),
    resetToDefaults: () => setSettings(defaultSettings),
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}
