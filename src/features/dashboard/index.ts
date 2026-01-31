// Dashboard feature barrel export
export { DashboardLayout } from "@/components/dashboard/DashboardLayout";
export { DashboardHeader } from "@/components/dashboard/DashboardHeader";
export { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
export { ModeSelector } from "@/components/dashboard/ModeSelector";
export { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

// Pages
export { default as DashboardPage } from "@/pages/Dashboard";
export { default as AnalyticsPage } from "@/pages/dashboard/Analytics";

// Context (will be migrated to Zustand store)
export { 
  DashboardModeProvider, 
  useDashboardMode,
  type DashboardMode,
} from "@/contexts/DashboardModeContext";

// Config
export { 
  getNavigationForMode, 
  modeConfig,
  type NavItem,
  type NavGroup,
} from "@/config/navigation";
