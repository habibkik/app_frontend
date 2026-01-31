/**
 * @deprecated Use `useSavedSuppliers` from `@/stores` instead.
 * This file is kept for backward compatibility.
 */

export { 
  useSavedSuppliers, 
  useSavedSuppliersStore,
  type SupplierMetadata 
} from "@/stores/savedSuppliersStore";

// Re-export Supplier type for convenience
export type { Supplier } from "@/data/suppliers";

/**
 * @deprecated Provider no longer needed with Zustand.
 * Kept for backward compatibility - renders children directly.
 */
export function SavedSuppliersProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
