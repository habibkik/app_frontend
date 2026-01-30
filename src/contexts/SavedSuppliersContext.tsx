import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Supplier } from "@/data/suppliers";

interface SavedSuppliersContextType {
  savedSuppliers: Supplier[];
  saveSupplier: (supplier: Supplier) => void;
  removeSupplier: (supplierId: string) => void;
  isSupplierSaved: (supplierId: string) => boolean;
  toggleSupplier: (supplier: Supplier) => void;
}

const SavedSuppliersContext = createContext<SavedSuppliersContextType | undefined>(undefined);

// Initialize with some mock saved suppliers
const initialSavedSuppliers: string[] = ["sup-001", "sup-003", "sup-005"];

export function SavedSuppliersProvider({ children }: { children: ReactNode }) {
  const [savedSupplierIds, setSavedSupplierIds] = useState<Set<string>>(
    new Set(initialSavedSuppliers)
  );
  const [savedSuppliers, setSavedSuppliers] = useState<Supplier[]>([]);

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
  }, []);

  const removeSupplier = useCallback((supplierId: string) => {
    setSavedSupplierIds((prev) => {
      const next = new Set(prev);
      next.delete(supplierId);
      return next;
    });
    setSavedSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
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

  return (
    <SavedSuppliersContext.Provider
      value={{
        savedSuppliers,
        saveSupplier,
        removeSupplier,
        isSupplierSaved,
        toggleSupplier,
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
