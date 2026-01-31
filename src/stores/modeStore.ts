import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DashboardMode = "buyer" | "producer" | "seller";

interface ModeStore {
  mode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
}

export const useModeStore = create<ModeStore>()(
  persist(
    (set) => ({
      mode: "buyer",
      setMode: (mode) => set({ mode }),
    }),
    { name: "dashboard-mode" }
  )
);
