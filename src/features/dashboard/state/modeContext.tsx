import { createContext, useContext, useState, ReactNode } from "react";

export type DashboardMode = "buyer" | "producer" | "seller";

interface DashboardModeContextType {
  mode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
}

const DashboardModeContext = createContext<DashboardModeContextType | null>(null);

export function useDashboardMode() {
  const context = useContext(DashboardModeContext);
  if (!context) {
    throw new Error("useDashboardMode must be used within a DashboardModeProvider");
  }
  return context;
}

interface DashboardModeProviderProps {
  children: ReactNode;
  defaultMode?: DashboardMode;
}

export function DashboardModeProvider({ children, defaultMode = "buyer" }: DashboardModeProviderProps) {
  const [mode, setMode] = useState<DashboardMode>(() => {
    const stored = localStorage.getItem("dashboard_mode") as DashboardMode;
    return stored || defaultMode;
  });

  const handleSetMode = (newMode: DashboardMode) => {
    setMode(newMode);
    localStorage.setItem("dashboard_mode", newMode);
  };

  return (
    <DashboardModeContext.Provider value={{ mode, setMode: handleSetMode }}>
      {children}
    </DashboardModeContext.Provider>
  );
}
