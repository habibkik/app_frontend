// Producer feature barrel export

// BOM Components
export { BOMUploadZone } from "@/components/bom/BOMUploadZone";
export { BOMComponentsTable } from "@/components/bom/BOMComponentsTable";
export { BOMCostSummary } from "@/components/bom/BOMCostSummary";
export { BOMExportActions } from "@/components/bom/BOMExportActions";
export { BOMSupplierMatchModal } from "@/components/bom/BOMSupplierMatchModal";
export { AIAnalysisPanel } from "@/components/bom/AIAnalysisPanel";

// Competition Components
export { ProducerCompetition } from "@/components/producer/ProducerCompetition";
export { SubstituteProducers } from "@/components/producer/SubstituteProducers";

// Component Supply Components
export { ComponentCard } from "@/components/components/ComponentCard";
export { SupplierQuoteList } from "@/components/components/SupplierQuoteList";
export { ComparisonSummary } from "@/components/components/ComparisonSummary";
export { CostComparisonChart } from "@/components/components/CostComparisonChart";
export { SaveComparisonDialog } from "@/components/components/SaveComparisonDialog";
export { LoadComparisonDialog } from "@/components/components/LoadComparisonDialog";
export { SupplyChainFlow } from "@/components/components/SupplyChainFlow";
export { SupplyChainRiskPanel } from "@/components/components/SupplyChainRiskPanel";
export { ComponentSupplierDetailModal } from "@/components/components/ComponentSupplierDetailModal";

// Feasibility Analysis Components
export { FeasibilityAnalysisComponent } from "./components/FeasibilityAnalysisComponent";
export { FeasibilityScoreCircle } from "./components/FeasibilityScoreCircle";
export { CostBreakdownCards } from "./components/CostBreakdownCards";
export { FeasibilityFactorsPanel } from "./components/FeasibilityFactorsPanel";
export { MakeVsBuyCard } from "./components/MakeVsBuyCard";
export { ScenarioSimulator } from "./components/ScenarioSimulator";
export { RiskFactorsPanel } from "./components/RiskFactorsPanel";
export { RecommendationBanner } from "./components/RecommendationBanner";

// Pages
export { default as ProducerDashboard } from "./pages/ProducerDashboard";
export { default as BOMsPage } from "@/pages/dashboard/BOM";
export { default as ComponentsPage } from "@/pages/dashboard/Components";
export { default as FeasibilityPage } from "@/pages/dashboard/Feasibility";
export { default as GTMPage } from "@/pages/dashboard/GTM";

// Data/API
export { 
  mockBOMComponents, 
  componentCategories, 
  type BOMComponent 
} from "@/data/bom";
export { 
  mockComponentParts, 
  getQuotesForComponent, 
  mockSupplierQuotes,
  type ComparisonSelection 
} from "@/data/components";
export { type AnalyzedComponent } from "@/lib/ai-analysis-service";

// Feasibility Types & Utilities
export * from "./types/feasibility";
export * from "./utils/feasibilityCalculator";
