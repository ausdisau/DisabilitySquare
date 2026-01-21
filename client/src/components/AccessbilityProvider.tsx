import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";

interface AccessibilityContextType {
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  fontSize: "normal" | "large" | "extra-large";
  setFontSize: (size: "normal" | "large" | "extra-large") => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();

  const [highContrast, setHighContrastLocal] = useState(false);
  const [fontSize, setFontSizeLocal] = useState<"normal" | "large" | "extra-large">("normal");

  // Sync with profile when loaded
  useEffect(() => {
    if (profile?.accessibilitySettings) {
      setHighContrastLocal(profile.accessibilitySettings.highContrast);
      setFontSizeLocal(profile.accessibilitySettings.fontSize);
    }
  }, [profile]);

  // Apply classes to document body
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    root.classList.remove("text-normal", "text-large", "text-xlarge");
    if (fontSize === "large") root.classList.add("text-large");
    if (fontSize === "extra-large") root.classList.add("text-xlarge");
  }, [highContrast, fontSize]);

  const setHighContrast = (enabled: boolean) => {
    setHighContrastLocal(enabled);
    if (user && profile) {
      updateProfile.mutate({
        accessibilitySettings: { ...profile.accessibilitySettings, highContrast: enabled, fontSize }
      });
    }
  };

  const setFontSize = (size: "normal" | "large" | "extra-large") => {
    setFontSizeLocal(size);
    if (user && profile) {
      updateProfile.mutate({
        accessibilitySettings: { ...profile.accessibilitySettings, highContrast, fontSize: size }
      });
    }
  };

  return (
    <AccessibilityContext.Provider value={{ highContrast, setHighContrast, fontSize, setFontSize }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return context;
}
