/**
 * Saved Suppliers Store
 * Manages saved/bookmarked suppliers with notes and tags using Zustand
 */

import { create } from "zustand";
import { Supplier } from "@/data/suppliers";

export interface SupplierMetadata {
  notes: string;
  tags: string[];
  savedAt: Date;
}

// Initialize with some mock saved suppliers and metadata
const initialSavedSupplierIds = new Set(["sup-001", "sup-003", "sup-005"]);

const initialMetadata: Record<string, SupplierMetadata> = {
  "sup-001": {
    notes: "Great communication, fast response times. Consider for electronics projects.",
    tags: ["Preferred", "Electronics"],
    savedAt: new Date("2025-01-15"),
  },
  "sup-003": {
    notes: "Premium quality but higher pricing. Good for precision parts.",
    tags: ["Premium", "Automotive"],
    savedAt: new Date("2025-01-10"),
  },
  "sup-005": {
    notes: "FDA approved, excellent for medical device projects.",
    tags: ["Medical", "Certified"],
    savedAt: new Date("2025-01-20"),
  },
};

interface SavedSuppliersState {
  savedSupplierIds: Set<string>;
  savedSuppliers: Supplier[];
  supplierMetadata: Record<string, SupplierMetadata>;
}

interface SavedSuppliersActions {
  saveSupplier: (supplier: Supplier) => void;
  removeSupplier: (supplierId: string) => void;
  isSupplierSaved: (supplierId: string) => boolean;
  toggleSupplier: (supplier: Supplier) => void;
  getSupplierMetadata: (supplierId: string) => SupplierMetadata | undefined;
  updateSupplierNotes: (supplierId: string, notes: string) => void;
  addSupplierTag: (supplierId: string, tag: string) => void;
  removeSupplierTag: (supplierId: string, tag: string) => void;
  setSupplierTags: (supplierId: string, tags: string[]) => void;
  getAllTags: () => string[];
}

type SavedSuppliersStore = SavedSuppliersState & SavedSuppliersActions;

export const useSavedSuppliersStore = create<SavedSuppliersStore>((set, get) => ({
  // State
  savedSupplierIds: initialSavedSupplierIds,
  savedSuppliers: [],
  supplierMetadata: initialMetadata,

  // Actions
  saveSupplier: (supplier) => {
    set((state) => {
      const newIds = new Set(state.savedSupplierIds);
      newIds.add(supplier.id);

      const alreadySaved = state.savedSuppliers.some((s) => s.id === supplier.id);
      const newSuppliers = alreadySaved ? state.savedSuppliers : [...state.savedSuppliers, supplier];

      const newMetadata = state.supplierMetadata[supplier.id]
        ? state.supplierMetadata
        : {
            ...state.supplierMetadata,
            [supplier.id]: {
              notes: "",
              tags: [],
              savedAt: new Date(),
            },
          };

      return {
        savedSupplierIds: newIds,
        savedSuppliers: newSuppliers,
        supplierMetadata: newMetadata,
      };
    });
  },

  removeSupplier: (supplierId) => {
    set((state) => {
      const newIds = new Set(state.savedSupplierIds);
      newIds.delete(supplierId);

      return {
        savedSupplierIds: newIds,
        savedSuppliers: state.savedSuppliers.filter((s) => s.id !== supplierId),
        // Keep metadata in case they re-save
      };
    });
  },

  isSupplierSaved: (supplierId) => {
    return get().savedSupplierIds.has(supplierId);
  },

  toggleSupplier: (supplier) => {
    const { isSupplierSaved, removeSupplier, saveSupplier } = get();
    if (isSupplierSaved(supplier.id)) {
      removeSupplier(supplier.id);
    } else {
      saveSupplier(supplier);
    }
  },

  getSupplierMetadata: (supplierId) => {
    return get().supplierMetadata[supplierId];
  },

  updateSupplierNotes: (supplierId, notes) => {
    set((state) => ({
      supplierMetadata: {
        ...state.supplierMetadata,
        [supplierId]: {
          ...state.supplierMetadata[supplierId],
          notes,
        },
      },
    }));
  },

  addSupplierTag: (supplierId, tag) => {
    set((state) => {
      const current = state.supplierMetadata[supplierId];
      if (!current || current.tags.includes(tag)) return state;

      return {
        supplierMetadata: {
          ...state.supplierMetadata,
          [supplierId]: {
            ...current,
            tags: [...current.tags, tag],
          },
        },
      };
    });
  },

  removeSupplierTag: (supplierId, tag) => {
    set((state) => {
      const current = state.supplierMetadata[supplierId];
      if (!current) return state;

      return {
        supplierMetadata: {
          ...state.supplierMetadata,
          [supplierId]: {
            ...current,
            tags: current.tags.filter((t) => t !== tag),
          },
        },
      };
    });
  },

  setSupplierTags: (supplierId, tags) => {
    set((state) => ({
      supplierMetadata: {
        ...state.supplierMetadata,
        [supplierId]: {
          ...state.supplierMetadata[supplierId],
          tags,
        },
      },
    }));
  },

  getAllTags: () => {
    const { supplierMetadata } = get();
    const allTags = new Set<string>();
    Object.values(supplierMetadata).forEach((meta) => {
      meta.tags.forEach((tag) => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  },
}));

// Hook alias for backward compatibility
export const useSavedSuppliers = useSavedSuppliersStore;
