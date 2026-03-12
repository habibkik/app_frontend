import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LandingPageTheme } from "@/features/seller/components/content-studio/types";
import { DEFAULT_LANDING_THEME } from "@/features/seller/components/content-studio/types";
import type { SiteBlock, SiteConfig, WebsiteEditorState } from "@/features/seller/components/website-builder/types";
import { DEFAULT_BLOCKS, createDefaultBlock } from "@/features/seller/components/website-builder/blocks";

interface StoreConnection {
  engine: "standalone" | "woocommerce" | "shopify";
  connected: boolean;
  storeUrl?: string;
  apiKey?: string;
}

interface WebsiteBuilderActions {
  setSiteConfig: (config: Partial<SiteConfig>) => void;
  setTheme: (theme: LandingPageTheme) => void;
  setBlocks: (blocks: SiteBlock[]) => void;
  addBlock: (block: SiteBlock) => void;
  removeBlock: (id: string) => void;
  updateBlockConfig: (id: string, config: any) => void;
  toggleBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  setSelectedBlockId: (id: string | null) => void;
  setWebsiteId: (id: string | null) => void;
  setIsPublished: (v: boolean) => void;
  setSlug: (slug: string) => void;
  setCustomHtml: (html: string | null) => void;
  setTemplateChosen: (v: boolean) => void;
  setStoreMode: (mode: "standard" | "ecommerce") => void;
  setStoreConnection: (conn: StoreConnection | null) => void;
  loadFromDb: (data: { config_json: any; theme_json: any; id: string; name: string; slug: string; is_published: boolean }) => void;
  reset: () => void;
  importLandingPage: (data: { html: string; theme: any; sections: any }) => void;
}

const ECOMMERCE_BLOCK_TYPES = ["product-detail", "shopping-cart", "checkout-form", "customer-reviews", "order-tracking"] as const;

const initialState: WebsiteEditorState & { storeMode: "standard" | "ecommerce"; storeConnection: StoreConnection | null } = {
  siteConfig: { name: "My Store", tagline: "Quality products, competitive prices", logoUrl: "" },
  blocks: DEFAULT_BLOCKS,
  theme: DEFAULT_LANDING_THEME,
  selectedBlockId: null,
  websiteId: null,
  isPublished: false,
  slug: "my-store",
  customHtml: null,
  templateChosen: false,
  storeMode: "standard",
  storeConnection: null,
};

export const useWebsiteBuilderStore = create<WebsiteEditorState & { storeMode: "standard" | "ecommerce"; storeConnection: StoreConnection | null } & WebsiteBuilderActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSiteConfig: (config) => set((s) => ({ siteConfig: { ...s.siteConfig, ...config } })),
      setTheme: (theme) => set({ theme }),
      setBlocks: (blocks) => set({ blocks }),
      addBlock: (block) => set((s) => ({ blocks: [...s.blocks, block] })),
      removeBlock: (id) => set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id), selectedBlockId: s.selectedBlockId === id ? null : s.selectedBlockId })),
      updateBlockConfig: (id, config) =>
        set((s) => ({
          blocks: s.blocks.map((b) => (b.id === id ? { ...b, config: { ...b.config, ...config } } : b)),
        })),
      toggleBlock: (id) =>
        set((s) => ({
          blocks: s.blocks.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)),
        })),
      moveBlock: (fromIndex, toIndex) =>
        set((s) => {
          const newBlocks = [...s.blocks];
          const [moved] = newBlocks.splice(fromIndex, 1);
          newBlocks.splice(toIndex, 0, moved);
          return { blocks: newBlocks };
        }),
      setSelectedBlockId: (id) => set({ selectedBlockId: id }),
      setWebsiteId: (id) => set({ websiteId: id }),
      setIsPublished: (v) => set({ isPublished: v }),
      setSlug: (slug) => set({ slug }),
      setCustomHtml: (html) => set({ customHtml: html }),
      setStoreMode: (mode) => {
        const state = get();
        if (mode === "ecommerce") {
          const existingTypes = state.blocks.map((b) => b.type);
          const newBlocks = [...state.blocks];
          for (const t of ECOMMERCE_BLOCK_TYPES) {
            if (!existingTypes.includes(t)) {
              newBlocks.push(createDefaultBlock(t));
            }
          }
          set({ storeMode: mode, blocks: newBlocks });
        } else {
          set({ storeMode: mode });
        }
      },
      setTemplateChosen: (v) => set({ templateChosen: v }),
      loadFromDb: (data) => {
        const cfg = data.config_json as any;
        set({
          websiteId: data.id,
          siteConfig: cfg.siteConfig || initialState.siteConfig,
          blocks: cfg.blocks || initialState.blocks,
          customHtml: cfg.customHtml || null,
          theme: (data.theme_json as any) || initialState.theme,
          slug: data.slug,
          isPublished: data.is_published,
          selectedBlockId: null,
          templateChosen: true,
        });
      },
      reset: () => set(initialState),
      importLandingPage: (data: { html: string; theme: any; sections: any }) => {
        const heroBlock = createDefaultBlock("hero");
        if (data.sections?.hero) {
          heroBlock.config = { ...heroBlock.config, title: data.sections.hero };
        }
        const faqBlock = createDefaultBlock("faq");
        if (data.sections?.faq?.length) {
          faqBlock.config = { ...faqBlock.config, items: data.sections.faq };
        }
        set({
          blocks: [heroBlock, createDefaultBlock("product-catalog"), createDefaultBlock("about"), faqBlock, createDefaultBlock("contact")],
          theme: data.theme || initialState.theme,
        });
      },
    }),
    { name: "website-builder-store" }
  )
);
