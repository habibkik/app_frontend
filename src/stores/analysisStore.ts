/**
 * Analysis Store - Zustand store for centralized analysis results across modes
 * Optimized with better loading states and error handling
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashboardMode } from "@/features/dashboard";

// ============================================================
// TYPES - Buyer Mode
// ============================================================
export interface DeliveryEstimate {
  method: string;
  cost: number;
  days: string;
  carrier?: string;
}

export interface SupplierMatch {
  id: string;
  name: string;
  matchScore: number;
  priceRange: { min: number; max: number };
  moq: number;
  leadTime: string;
  location: string;
  verified: boolean;
  deliveryEstimates?: DeliveryEstimate[];
}

export interface SubstituteSupplier {
  id: string;
  name: string;
  originalProduct: string;
  substituteProduct: string;
  similarity: number;
  priceAdvantage: string;
  location: string;
  leadTime: string;
  deliveryEstimates?: DeliveryEstimate[];
}

export interface SupplierDiscoveryResult {
  productIdentification: {
    name: string;
    category: string;
    specifications: Record<string, string>;
  };
  suggestedSuppliers: SupplierMatch[];
  substitutes: Array<{
    name: string;
    similarity: number;
    priceAdvantage: string;
  }>;
  substituteSuppliers?: SubstituteSupplier[];
  estimatedMarketPrice: { min: number; max: number };
  confidence: number;
}

// ============================================================
// TYPES - Producer Mode
// ============================================================
export interface IdentifiedComponent {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  specifications: string;
  material: string;
  confidence: number;
}

export interface ProducerCompetitor {
  id: string;
  name: string;
  location: string;
  productionCapacity: string;
  priceRange: { min: number; max: number };
  leadTime: string;
  certifications: string[];
  marketShare: string;
  strengths: string[];
}

export interface SubstituteProducer {
  id: string;
  name: string;
  substituteProduct: string;
  similarity: number;
  location: string;
  priceAdvantage: string;
  productionCapacity: string;
  certifications: string[];
}

export interface BOMAnalysisResult {
  success: boolean;
  productName: string;
  productCategory: string;
  components: IdentifiedComponent[];
  overallConfidence: number;
  processingTime: number;
  suggestedTags: string[];
  attributes: Record<string, string>;
  totalEstimatedCost: number;
  competition?: ProducerCompetitor[];
  substituteCompetition?: SubstituteProducer[];
  error?: string;
}

// ============================================================
// TYPES - Seller Mode
// ============================================================
export interface CompetitorInfo {
  name: string;
  priceRange: { min: number; max: number };
  marketShare: string;
  strengths: string[];
}

export interface MarketHeatMapRegion {
  region: string;
  demand: "high" | "medium" | "low";
  competitorCount: number;
  avgPrice: number;
  growth: string;
  opportunity: "excellent" | "good" | "moderate" | "saturated";
}

export interface SubstituteCompetitor {
  id: string;
  name: string;
  substituteProduct: string;
  similarity: number;
  priceRange: { min: number; max: number };
  marketShare: string;
  threat: "high" | "medium" | "low";
  differentiators: string[];
}

export interface MarketAnalysisResult {
  productIdentification: {
    name: string;
    category: string;
    attributes: Record<string, string>;
  };
  competitors: CompetitorInfo[];
  substituteCompetitors?: SubstituteCompetitor[];
  marketHeatMap?: MarketHeatMapRegion[];
  marketPriceRange: { min: number; max: number; average: number };
  pricingRecommendation: {
    suggested: number;
    marginScenarios: Array<{
      margin: string;
      price: number;
      competitiveness: string;
    }>;
  };
  demandIndicators: {
    trend: "rising" | "stable" | "declining";
    seasonality: string;
    searchVolume: string;
  };
  confidence: number;
}

// ============================================================
// TYPES - History & Loading States
// ============================================================
export interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  mode: DashboardMode;
  imagePreview: string;
  productName: string;
  productCategory: string;
}

export type AnalysisStatus = "idle" | "uploading" | "analyzing" | "complete" | "error";

export interface AnalysisError {
  code: string;
  message: string;
  retryable: boolean;
}

// ============================================================
// STORE STATE
// ============================================================
interface AnalysisState {
  // Current active analysis
  currentImage: string | null;
  currentImageName: string | null;
  
  // Mode-specific results
  buyerResults: SupplierDiscoveryResult | null;
  producerResults: BOMAnalysisResult | null;
  sellerResults: MarketAnalysisResult | null;
  
  // Analysis history
  history: AnalysisHistoryItem[];
  
  // Enhanced loading states
  status: AnalysisStatus;
  activeMode: DashboardMode | null;
  analysisProgress: number;
  analysisStep: string;
  error: AnalysisError | null;
  
  // Timestamps for cache management
  lastAnalysisTime: number | null;
}

// ============================================================
// STORE ACTIONS
// ============================================================
interface AnalysisActions {
  // Image management
  setCurrentImage: (image: string, fileName: string) => void;
  clearCurrentImage: () => void;
  
  // Analysis lifecycle
  startAnalysis: (mode: DashboardMode) => void;
  updateProgress: (progress: number, step: string) => void;
  completeAnalysis: () => void;
  failAnalysis: (error: AnalysisError) => void;
  resetStatus: () => void;
  
  // Set mode-specific results
  setBuyerResults: (results: SupplierDiscoveryResult) => void;
  setProducerResults: (results: BOMAnalysisResult) => void;
  setSellerResults: (results: MarketAnalysisResult) => void;
  
  // Clear results
  clearResults: (mode?: DashboardMode) => void;
  clearAllResults: () => void;
  
  // History management
  addToHistory: (item: Omit<AnalysisHistoryItem, "id" | "timestamp">) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  
  // Computed helpers
  hasResults: (mode: DashboardMode) => boolean;
  getResultsForMode: (mode: DashboardMode) => SupplierDiscoveryResult | BOMAnalysisResult | MarketAnalysisResult | null;
  
  // Legacy compatibility
  isAnalyzing: boolean;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisProgress: (progress: number, step: string) => void;
}

// ============================================================
// STORE IMPLEMENTATION
// ============================================================
export const useAnalysisStore = create<AnalysisState & AnalysisActions>()(
  persist(
    (set, get) => ({
      // Initial state
      currentImage: null,
      currentImageName: null,
      buyerResults: null,
      producerResults: null,
      sellerResults: null,
      history: [],
      status: "idle",
      activeMode: null,
      analysisProgress: 0,
      analysisStep: "",
      error: null,
      lastAnalysisTime: null,
      isAnalyzing: false,
      
      // Image management
      setCurrentImage: (image, fileName) => set({
        currentImage: image,
        currentImageName: fileName,
        error: null,
      }),
      
      clearCurrentImage: () => set({
        currentImage: null,
        currentImageName: null,
      }),
      
      // Analysis lifecycle
      startAnalysis: (mode) => set({
        status: "analyzing",
        activeMode: mode,
        analysisProgress: 0,
        analysisStep: "Initializing...",
        error: null,
        isAnalyzing: true,
      }),
      
      updateProgress: (progress, step) => set({
        analysisProgress: progress,
        analysisStep: step,
      }),
      
      completeAnalysis: () => set({
        status: "complete",
        analysisProgress: 100,
        analysisStep: "Complete!",
        lastAnalysisTime: Date.now(),
        isAnalyzing: false,
      }),
      
      failAnalysis: (error) => set({
        status: "error",
        error,
        isAnalyzing: false,
      }),
      
      resetStatus: () => set({
        status: "idle",
        activeMode: null,
        analysisProgress: 0,
        analysisStep: "",
        error: null,
        isAnalyzing: false,
      }),
      
      // Legacy compatibility
      setAnalyzing: (isAnalyzing) => set({ 
        isAnalyzing,
        status: isAnalyzing ? "analyzing" : "idle",
        analysisProgress: isAnalyzing ? 0 : 100,
        analysisStep: isAnalyzing ? "Initializing..." : "",
      }),
      
      setAnalysisProgress: (progress, step) => set({
        analysisProgress: progress,
        analysisStep: step,
      }),
      
      // Set results
      setBuyerResults: (results) => {
        set({ buyerResults: results });
        get().addToHistory({
          mode: "buyer",
          imagePreview: get().currentImage?.substring(0, 200) || "",
          productName: results.productIdentification.name,
          productCategory: results.productIdentification.category,
        });
      },
      
      setProducerResults: (results) => {
        set({ producerResults: results });
        get().addToHistory({
          mode: "producer",
          imagePreview: get().currentImage?.substring(0, 200) || "",
          productName: results.productName,
          productCategory: results.productCategory,
        });
      },
      
      setSellerResults: (results) => {
        set({ sellerResults: results });
        get().addToHistory({
          mode: "seller",
          imagePreview: get().currentImage?.substring(0, 200) || "",
          productName: results.productIdentification.name,
          productCategory: results.productIdentification.category,
        });
      },
      
      // Clear results
      clearResults: (mode) => {
        if (!mode) {
          set({
            buyerResults: null,
            producerResults: null,
            sellerResults: null,
          });
        } else {
          switch (mode) {
            case "buyer":
              set({ buyerResults: null });
              break;
            case "producer":
              set({ producerResults: null });
              break;
            case "seller":
              set({ sellerResults: null });
              break;
          }
        }
      },
      
      clearAllResults: () => set({
        currentImage: null,
        currentImageName: null,
        buyerResults: null,
        producerResults: null,
        sellerResults: null,
        status: "idle",
        error: null,
      }),
      
      // History management
      addToHistory: (item) => set((state) => ({
        history: [
          {
            ...item,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          },
          ...state.history.slice(0, 19),
        ],
      })),
      
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((item) => item.id !== id),
      })),
      
      clearHistory: () => set({ history: [] }),
      
      // Computed helpers
      hasResults: (mode) => {
        const state = get();
        switch (mode) {
          case "buyer":
            return state.buyerResults !== null;
          case "producer":
            return state.producerResults !== null;
          case "seller":
            return state.sellerResults !== null;
          default:
            return false;
        }
      },
      
      getResultsForMode: (mode) => {
        const state = get();
        switch (mode) {
          case "buyer":
            return state.buyerResults;
          case "producer":
            return state.producerResults;
          case "seller":
            return state.sellerResults;
          default:
            return null;
        }
      },
    }),
    {
      name: "analysis-store",
      partialize: (state) => ({
        history: state.history,
        // Don't persist results or images to avoid large localStorage
      }),
    }
  )
);

// ============================================================
// SELECTOR HOOKS
// ============================================================
export const useAnalysisStatus = () => useAnalysisStore((s) => ({
  status: s.status,
  progress: s.analysisProgress,
  step: s.analysisStep,
  error: s.error,
  isAnalyzing: s.isAnalyzing,
}));

export const useAnalysisResults = (mode: DashboardMode) => useAnalysisStore((s) => {
  switch (mode) {
    case "buyer":
      return s.buyerResults;
    case "producer":
      return s.producerResults;
    case "seller":
      return s.sellerResults;
  }
});

export const useHasResults = (mode: DashboardMode) => useAnalysisStore((s) => {
  switch (mode) {
    case "buyer":
      return s.buyerResults !== null;
    case "producer":
      return s.producerResults !== null;
    case "seller":
      return s.sellerResults !== null;
    default:
      return false;
  }
});
