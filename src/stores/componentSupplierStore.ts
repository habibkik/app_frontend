import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { 
  SupplierGeoLocation, 
  SupplierContact, 
  SupplierBusinessProfile, 
  SupplierEmployee,
  EmployeeDepartment 
} from "@/data/suppliers";

export interface ComponentSupplierMatch {
  id: string;
  supplierId: string;
  name: string;
  logo: string;
  location: string;
  unitPrice: number;
  moq: number;
  leadTime: string;
  leadTimeDays: number;
  rating: number;
  certifications: string[];
  inStock: boolean;
  stockQuantity?: number;
  // Full supplier details
  geoLocation?: SupplierGeoLocation;
  contact?: SupplierContact;
  businessProfile?: SupplierBusinessProfile;
  employees?: SupplierEmployee[];
  industry?: string;
  specializations?: string[];
  description?: string;
  yearEstablished?: number;
  verified?: boolean;
}

export interface ComponentSearchResult {
  id: string;
  componentId: string;
  componentName: string;
  category: string;
  searchedAt: Date;
  suppliers: ComponentSupplierMatch[];
}

interface ComponentSupplierState {
  searchHistory: ComponentSearchResult[];
  selectedComponentId: string | null;
}

interface ComponentSupplierActions {
  addSearchResult: (result: Omit<ComponentSearchResult, "id" | "searchedAt">) => void;
  clearHistory: () => void;
  removeSearchResult: (id: string) => void;
  getSuppliersByComponent: (componentId: string) => ComponentSupplierMatch[];
  getAllUniqueSuppliers: () => ComponentSupplierMatch[];
  setSelectedComponent: (componentId: string | null) => void;
}

type ComponentSupplierStore = ComponentSupplierState & ComponentSupplierActions;

export const useComponentSupplierStore = create<ComponentSupplierStore>()(
  persist(
    (set, get) => ({
      searchHistory: [],
      selectedComponentId: null,

      addSearchResult: (result) => {
        const newResult: ComponentSearchResult = {
          ...result,
          id: crypto.randomUUID(),
          searchedAt: new Date(),
        };
        set((state) => ({
          searchHistory: [newResult, ...state.searchHistory].slice(0, 50), // Keep last 50
        }));
      },

      clearHistory: () => set({ searchHistory: [] }),

      removeSearchResult: (id) => {
        set((state) => ({
          searchHistory: state.searchHistory.filter((r) => r.id !== id),
        }));
      },

      getSuppliersByComponent: (componentId) => {
        const result = get().searchHistory.find((r) => r.componentId === componentId);
        return result?.suppliers || [];
      },

      getAllUniqueSuppliers: () => {
        const suppliersMap = new Map<string, ComponentSupplierMatch>();
        get().searchHistory.forEach((result) => {
          result.suppliers.forEach((supplier) => {
            if (!suppliersMap.has(supplier.supplierId)) {
              suppliersMap.set(supplier.supplierId, supplier);
            }
          });
        });
        return Array.from(suppliersMap.values());
      },

      setSelectedComponent: (componentId) => {
        set({ selectedComponentId: componentId });
      },
    }),
    {
      name: "component-supplier-store",
      partialize: (state) => ({
        searchHistory: state.searchHistory,
      }),
    }
  )
);

// Hook for easier consumption
export const useComponentSuppliers = () => {
  const store = useComponentSupplierStore();
  return {
    searchHistory: store.searchHistory,
    selectedComponentId: store.selectedComponentId,
    addSearchResult: store.addSearchResult,
    clearHistory: store.clearHistory,
    removeSearchResult: store.removeSearchResult,
    getSuppliersByComponent: store.getSuppliersByComponent,
    getAllUniqueSuppliers: store.getAllUniqueSuppliers,
    setSelectedComponent: store.setSelectedComponent,
  };
};
