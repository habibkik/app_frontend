/**
 * Discovered Suppliers Store - Zustand store for AI-discovered suppliers
 * Persists suppliers found via image analysis to display in Browse All tab
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Supplier } from "@/data/suppliers";
import type { SupplierMatch, SubstituteSupplier } from "./analysisStore";
import { supplierMatchToSupplier, substituteSupplierToSupplier } from "@/lib/supplier-converter";

// ============================================================
// TYPES
// ============================================================
export interface SupplierSourceInfo {
  analysisId: string;
  discoveredAt: string; // ISO date string for serialization
  type: "match" | "substitute";
  matchScore?: number;
  originalProduct?: string;
}

interface DiscoveredSuppliersState {
  // Suppliers discovered via AI analysis
  discoveredSuppliers: Supplier[];
  
  // Track source analysis for each supplier
  supplierSources: Record<string, SupplierSourceInfo>;
}

interface DiscoveredSuppliersActions {
  // Add suppliers from analysis results
  addFromAnalysis: (
    suppliers: SupplierMatch[],
    substituteSuppliers: SubstituteSupplier[],
    analysisId: string
  ) => void;
  
  // Check if supplier is AI-discovered
  isDiscovered: (supplierId: string) => boolean;
  
  // Get source info for a supplier
  getSourceInfo: (supplierId: string) => SupplierSourceInfo | undefined;
  
  // Clear all discovered suppliers
  clearDiscovered: () => void;
  
  // Remove a specific supplier
  removeSupplier: (supplierId: string) => void;
}

// ============================================================
// STORE IMPLEMENTATION
// ============================================================
export const useDiscoveredSuppliersStore = create<DiscoveredSuppliersState & DiscoveredSuppliersActions>()(
  persist(
    (set, get) => ({
      // Initial state
      discoveredSuppliers: [],
      supplierSources: {},
      
      // Add suppliers from AI analysis results
      addFromAnalysis: (suppliers, substituteSuppliers, analysisId) => {
        const now = new Date().toISOString();
        const newSuppliers: Supplier[] = [];
        const newSources: Record<string, SupplierSourceInfo> = {};
        
        // Convert and add main supplier matches
        suppliers.forEach((match) => {
          const supplier = supplierMatchToSupplier(match);
          newSuppliers.push(supplier);
          newSources[supplier.id] = {
            analysisId,
            discoveredAt: now,
            type: "match",
            matchScore: match.matchScore,
          };
        });
        
        // Convert and add substitute suppliers
        substituteSuppliers.forEach((sub) => {
          const supplier = substituteSupplierToSupplier(sub);
          newSuppliers.push(supplier);
          newSources[supplier.id] = {
            analysisId,
            discoveredAt: now,
            type: "substitute",
            matchScore: sub.similarity,
            originalProduct: sub.originalProduct,
          };
        });
        
        set((state) => {
          // Merge with existing, avoiding duplicates by ID
          const existingMap = new Map(
            state.discoveredSuppliers.map((s) => [s.id, s])
          );
          
          newSuppliers.forEach((s) => existingMap.set(s.id, s));
          
          return {
            discoveredSuppliers: Array.from(existingMap.values()),
            supplierSources: { ...state.supplierSources, ...newSources },
          };
        });
      },
      
      // Check if a supplier was discovered by AI
      isDiscovered: (supplierId) => {
        return supplierId in get().supplierSources;
      },
      
      // Get source info for a supplier
      getSourceInfo: (supplierId) => {
        return get().supplierSources[supplierId];
      },
      
      // Clear all discovered suppliers
      clearDiscovered: () => {
        set({
          discoveredSuppliers: [],
          supplierSources: {},
        });
      },
      
      // Remove a specific supplier
      removeSupplier: (supplierId) => {
        set((state) => {
          const { [supplierId]: removed, ...remainingSources } = state.supplierSources;
          return {
            discoveredSuppliers: state.discoveredSuppliers.filter((s) => s.id !== supplierId),
            supplierSources: remainingSources,
          };
        });
      },
    }),
    {
      name: "discovered-suppliers-storage",
    }
  )
);

// Hook alias for convenience
export const useDiscoveredSuppliers = () => useDiscoveredSuppliersStore();
