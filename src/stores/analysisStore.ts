/**
 * Analysis Store - Zustand store for centralized analysis results across modes
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashboardMode } from "@/features/dashboard";
import type { ProductAnalysisResult, IdentifiedComponent } from "@/features/agents/miromind/types";

// Buyer-specific results
export interface SupplierMatch {
  id: string;
  name: string;
  matchScore: number;
  priceRange: { min: number; max: number };
  moq: number;
  leadTime: string;
  location: string;
  verified: boolean;
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
  estimatedMarketPrice: { min: number; max: number };
  confidence: number;
}

// Producer-specific results (existing BOM)
export interface BOMAnalysisResult extends ProductAnalysisResult {
  totalEstimatedCost: number;
  components: IdentifiedComponent[];
}

// Seller-specific results
export interface CompetitorInfo {
  name: string;
  priceRange: { min: number; max: number };
  marketShare: string;
  strengths: string[];
}

export interface MarketAnalysisResult {
  productIdentification: {
    name: string;
    category: string;
    attributes: Record<string, string>;
  };
  competitors: CompetitorInfo[];
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

// History item for all modes
export interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  mode: DashboardMode;
  imagePreview: string; // base64 thumbnail
  productName: string;
  productCategory: string;
}

interface AnalysisState {
  // Current active analysis image
  currentImage: string | null;
  currentImageName: string | null;
  
  // Mode-specific results
  buyerResults: SupplierDiscoveryResult | null;
  producerResults: BOMAnalysisResult | null;
  sellerResults: MarketAnalysisResult | null;
  
  // Analysis history
  history: AnalysisHistoryItem[];
  
  // Loading states
  isAnalyzing: boolean;
  analysisProgress: number;
  analysisStep: string;
}

interface AnalysisActions {
  // Set the current image for analysis
  setCurrentImage: (image: string, fileName: string) => void;
  clearCurrentImage: () => void;
  
  // Set mode-specific results
  setBuyerResults: (results: SupplierDiscoveryResult) => void;
  setProducerResults: (results: BOMAnalysisResult) => void;
  setSellerResults: (results: MarketAnalysisResult) => void;
  
  // Clear results
  clearResults: (mode?: DashboardMode) => void;
  clearAllResults: () => void;
  
  // History management
  addToHistory: (item: Omit<AnalysisHistoryItem, "id" | "timestamp">) => void;
  clearHistory: () => void;
  
  // Loading state
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisProgress: (progress: number, step: string) => void;
}

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
      isAnalyzing: false,
      analysisProgress: 0,
      analysisStep: "",
      
      // Actions
      setCurrentImage: (image, fileName) => set({
        currentImage: image,
        currentImageName: fileName,
      }),
      
      clearCurrentImage: () => set({
        currentImage: null,
        currentImageName: null,
      }),
      
      setBuyerResults: (results) => {
        set({ buyerResults: results });
        // Add to history
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
      }),
      
      addToHistory: (item) => set((state) => ({
        history: [
          {
            ...item,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          },
          ...state.history.slice(0, 19), // Keep last 20 items
        ],
      })),
      
      clearHistory: () => set({ history: [] }),
      
      setAnalyzing: (isAnalyzing) => set({ 
        isAnalyzing,
        analysisProgress: isAnalyzing ? 0 : 100,
        analysisStep: isAnalyzing ? "Initializing..." : "",
      }),
      
      setAnalysisProgress: (progress, step) => set({
        analysisProgress: progress,
        analysisStep: step,
      }),
    }),
    {
      name: "analysis-store",
      partialize: (state) => ({
        history: state.history,
      }),
    }
  )
);
