import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Supplier } from "@/data/suppliers";

export interface SupplierMetadata {
  notes: string;
  tags: string[];
  savedAt: Date;
}

interface SavedSuppliersContextType {
  savedSuppliers: Supplier[];
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

const SavedSuppliersContext = createContext<SavedSuppliersContextType | undefined>(undefined);

// Initialize with some mock saved suppliers and metadata
const initialSavedSuppliers: string[] = ["sup-001", "sup-003", "sup-005"];

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

export function SavedSuppliersProvider({ children }: { children: ReactNode }) {
  const [savedSupplierIds, setSavedSupplierIds] = useState<Set<string>>(
    new Set(initialSavedSuppliers)
  );
  const [savedSuppliers, setSavedSuppliers] = useState<Supplier[]>([]);
  const [supplierMetadata, setSupplierMetadata] = useState<Record<string, SupplierMetadata>>(
    initialMetadata
  );

  const saveSupplier = useCallback((supplier: Supplier) => {
    setSavedSupplierIds((prev) => {
      const next = new Set(prev);
      next.add(supplier.id);
      return next;
    });
    setSavedSuppliers((prev) => {
      if (prev.find((s) => s.id === supplier.id)) return prev;
      return [...prev, supplier];
    });
    // Initialize metadata if not exists
    setSupplierMetadata((prev) => {
      if (prev[supplier.id]) return prev;
      return {
        ...prev,
        [supplier.id]: {
          notes: "",
          tags: [],
          savedAt: new Date(),
        },
      };
    });
  }, []);

  const removeSupplier = useCallback((supplierId: string) => {
    setSavedSupplierIds((prev) => {
      const next = new Set(prev);
      next.delete(supplierId);
      return next;
    });
    setSavedSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
    // Keep metadata in case they re-save
  }, []);

  const isSupplierSaved = useCallback(
    (supplierId: string) => savedSupplierIds.has(supplierId),
    [savedSupplierIds]
  );

  const toggleSupplier = useCallback(
    (supplier: Supplier) => {
      if (isSupplierSaved(supplier.id)) {
        removeSupplier(supplier.id);
      } else {
        saveSupplier(supplier);
      }
    },
    [isSupplierSaved, removeSupplier, saveSupplier]
  );

  const getSupplierMetadata = useCallback(
    (supplierId: string) => supplierMetadata[supplierId],
    [supplierMetadata]
  );

  const updateSupplierNotes = useCallback((supplierId: string, notes: string) => {
    setSupplierMetadata((prev) => ({
      ...prev,
      [supplierId]: {
        ...prev[supplierId],
        notes,
      },
    }));
  }, []);

  const addSupplierTag = useCallback((supplierId: string, tag: string) => {
    setSupplierMetadata((prev) => {
      const current = prev[supplierId];
      if (!current || current.tags.includes(tag)) return prev;
      return {
        ...prev,
        [supplierId]: {
          ...current,
          tags: [...current.tags, tag],
        },
      };
    });
  }, []);

  const removeSupplierTag = useCallback((supplierId: string, tag: string) => {
    setSupplierMetadata((prev) => {
      const current = prev[supplierId];
      if (!current) return prev;
      return {
        ...prev,
        [supplierId]: {
          ...current,
          tags: current.tags.filter((t) => t !== tag),
        },
      };
    });
  }, []);

  const setSupplierTags = useCallback((supplierId: string, tags: string[]) => {
    setSupplierMetadata((prev) => ({
      ...prev,
      [supplierId]: {
        ...prev[supplierId],
        tags,
      },
    }));
  }, []);

  const getAllTags = useCallback(() => {
    const allTags = new Set<string>();
    Object.values(supplierMetadata).forEach((meta) => {
      meta.tags.forEach((tag) => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }, [supplierMetadata]);

  return (
    <SavedSuppliersContext.Provider
      value={{
        savedSuppliers,
        saveSupplier,
        removeSupplier,
        isSupplierSaved,
        toggleSupplier,
        getSupplierMetadata,
        updateSupplierNotes,
        addSupplierTag,
        removeSupplierTag,
        setSupplierTags,
        getAllTags,
      }}
    >
      {children}
    </SavedSuppliersContext.Provider>
  );
}

export function useSavedSuppliers() {
  const context = useContext(SavedSuppliersContext);
  if (context === undefined) {
    throw new Error("useSavedSuppliers must be used within a SavedSuppliersProvider");
  }
  return context;
}
