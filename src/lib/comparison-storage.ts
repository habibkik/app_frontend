import { ComparisonSelection } from "@/data/components";

export interface SavedComparison {
  id: string;
  name: string;
  description?: string;
  selections: ComparisonSelection[];
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "saved-comparisons";

export function getSavedComparisons(): SavedComparison[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveComparison(
  name: string,
  selections: ComparisonSelection[],
  totalCost: number,
  description?: string
): SavedComparison {
  const comparisons = getSavedComparisons();
  
  const newComparison: SavedComparison = {
    id: `comp-${Date.now()}`,
    name,
    description,
    selections,
    totalCost,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  comparisons.unshift(newComparison);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisons));
  
  return newComparison;
}

export function updateComparison(
  id: string,
  updates: Partial<Pick<SavedComparison, "name" | "description" | "selections" | "totalCost">>
): SavedComparison | null {
  const comparisons = getSavedComparisons();
  const index = comparisons.findIndex((c) => c.id === id);
  
  if (index === -1) return null;

  comparisons[index] = {
    ...comparisons[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisons));
  return comparisons[index];
}

export function deleteComparison(id: string): boolean {
  const comparisons = getSavedComparisons();
  const filtered = comparisons.filter((c) => c.id !== id);
  
  if (filtered.length === comparisons.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function getComparisonById(id: string): SavedComparison | null {
  const comparisons = getSavedComparisons();
  return comparisons.find((c) => c.id === id) || null;
}
