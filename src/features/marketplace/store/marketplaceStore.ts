import { create } from "zustand";

export type MarketplaceTab = "products" | "connections" | "dashboard" | "bulk" | "ai-tools" | "settings";

interface MarketplaceState {
  activeTab: MarketplaceTab;
  setActiveTab: (tab: MarketplaceTab) => void;
  selectedListingId: string | null;
  setSelectedListingId: (id: string | null) => void;
  editingListingId: string | null;
  setEditingListingId: (id: string | null) => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  activeTab: "products",
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedListingId: null,
  setSelectedListingId: (id) => set({ selectedListingId: id }),
  editingListingId: null,
  setEditingListingId: (id) => set({ editingListingId: id }),
}));
