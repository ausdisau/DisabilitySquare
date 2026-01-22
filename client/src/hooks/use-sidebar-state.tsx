import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarStateContextType {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarStateContext = createContext<SidebarStateContextType | null>(null);

export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  return (
    <SidebarStateContext.Provider value={{ isExpanded, setIsExpanded, toggleSidebar }}>
      {children}
    </SidebarStateContext.Provider>
  );
}

export function useSidebarState() {
  const context = useContext(SidebarStateContext);
  if (!context) {
    throw new Error("useSidebarState must be used within a SidebarStateProvider");
  }
  return context;
}
