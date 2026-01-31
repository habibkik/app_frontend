// Producer feature barrel export

// BOM Components
export { BOMUploadZone } from "@/components/bom/BOMUploadZone";
export { BOMComponentsTable } from "@/components/bom/BOMComponentsTable";
export { BOMCostSummary } from "@/components/bom/BOMCostSummary";
export { BOMExportActions } from "@/components/bom/BOMExportActions";
export { BOMSupplierMatchModal } from "@/components/bom/BOMSupplierMatchModal";
export { AIAnalysisPanel } from "@/components/bom/AIAnalysisPanel";

// Component Supply Components
export { ComponentCard } from "@/components/components/ComponentCard";
export { SupplierQuoteList } from "@/components/components/SupplierQuoteList";
export { ComparisonSummary } from "@/components/components/ComparisonSummary";
export { CostComparisonChart } from "@/components/components/CostComparisonChart";
export { SaveComparisonDialog } from "@/components/components/SaveComparisonDialog";
export { LoadComparisonDialog } from "@/components/components/LoadComparisonDialog";

// Pages
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
