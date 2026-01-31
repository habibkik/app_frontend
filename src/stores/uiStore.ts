import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface UiStore {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  sidebarOpen: boolean;
  setTheme: (theme: Theme) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  initTheme: () => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: "light",
      sidebarOpen: true,
      
      setTheme: (theme) => {
        const resolved = theme === "system" ? getSystemTheme() : theme;
        
        // Update DOM
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolved);
        
        set({ theme, resolvedTheme: resolved });
      },
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      initTheme: () => {
        const { theme } = get();
        const resolved = theme === "system" ? getSystemTheme() : theme;
        
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolved);
        
        set({ resolvedTheme: resolved });
        
        // Listen for system theme changes
        if (theme === "system") {
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const handleChange = (e: MediaQueryListEvent) => {
            const newTheme = e.matches ? "dark" : "light";
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(newTheme);
            set({ resolvedTheme: newTheme });
          };
          mediaQuery.addEventListener("change", handleChange);
        }
      },
    }),
    { 
      name: "tradeplatform-ui",
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    }
  )
);
