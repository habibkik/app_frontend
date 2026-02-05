import { create } from "zustand";

export interface StudioContentItem {
  id: string;
  productName: string;
  generatedAt: string;
  headlines: string[];
  adCopy: { short: string; medium: string; long: string };
  socialCaptions: {
    platform: string;
    caption: string;
    hashtags?: string[];
  }[];
}

interface ContentStudioStore {
  savedItems: StudioContentItem[];
  addItem: (item: StudioContentItem) => void;
  removeItem: (id: string) => void;
}

export const useContentStudioStore = create<ContentStudioStore>((set) => ({
  savedItems: [],
  addItem: (item) =>
    set((s) => ({ savedItems: [item, ...s.savedItems].slice(0, 20) })),
  removeItem: (id) =>
    set((s) => ({ savedItems: s.savedItems.filter((i) => i.id !== id) })),
}));
