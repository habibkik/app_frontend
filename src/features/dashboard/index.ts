// Dashboard feature barrel export

// Components
export { 
  DashboardLayout, 
  DashboardHeader, 
  DashboardSidebar, 
  ModeSelector, 
  PlaceholderPage 
} from "./components";

// State/Context
export { 
  DashboardModeProvider, 
  useDashboardMode,
  type DashboardMode,
} from "./state/modeContext";

// Config
export { 
  getNavigationForMode, 
  modeConfig,
  type NavItem,
  type NavGroup,
} from "./config/navigation";

// API/Data
export {
  rfqTrendsData,
  responseTimesData,
  costSavingsData,
  quoteSuccessData,
  categoryDistributionData,
  analyticsStats,
  filterDataByDateRange,
  calculateFilteredStats,
} from "./api/analyticsApi";

// Pages
export { default as DashboardPage } from "./pages/DashboardPage";
