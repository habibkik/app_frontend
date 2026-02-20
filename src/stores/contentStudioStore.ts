import { create } from "zustand";
import type {
  GeneratedImage,
  SocialImagePost,
  EmailCampaign,
  ContentScore,
  LandingPageData,
  GenerationStep,
} from "@/features/seller/components/content-studio/types";

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
  // Legacy
  savedItems: StudioContentItem[];
  addItem: (item: StudioContentItem) => void;
  removeItem: (id: string) => void;

  // Enhanced Content Studio
  images: GeneratedImage[];
  socialPosts: SocialImagePost[];
  emailCampaigns: EmailCampaign[];
  landingPage: LandingPageData | null;
  contentScore: ContentScore | null;
  generationSteps: GenerationStep[];
  isGeneratingKit: boolean;
  currentStepIndex: number;

  setImages: (images: GeneratedImage[]) => void;
  updateImage: (id: string, updates: Partial<GeneratedImage>) => void;
  setSocialPosts: (posts: SocialImagePost[]) => void;
  setEmailCampaigns: (campaigns: EmailCampaign[]) => void;
  setLandingPage: (lp: LandingPageData | null) => void;
  setContentScore: (score: ContentScore | null) => void;
  setGenerationSteps: (steps: GenerationStep[]) => void;
  setIsGeneratingKit: (v: boolean) => void;
  setCurrentStepIndex: (i: number) => void;
  resetKit: () => void;
}

const initialImages: GeneratedImage[] = [
  { id: "social", label: "Social Media", prompt: "", imageUrl: null, isGenerating: false },
  { id: "ad", label: "Advertising", prompt: "", imageUrl: null, isGenerating: false },
  { id: "landing", label: "Landing Page", prompt: "", imageUrl: null, isGenerating: false },
  { id: "ecommerce", label: "E-commerce", prompt: "", imageUrl: null, isGenerating: false },
  { id: "email", label: "Email Marketing", prompt: "", imageUrl: null, isGenerating: false },
];

export const useContentStudioStore = create<ContentStudioStore>((set) => ({
  savedItems: [],
  addItem: (item) =>
    set((s) => ({ savedItems: [item, ...s.savedItems].slice(0, 20) })),
  removeItem: (id) =>
    set((s) => ({ savedItems: s.savedItems.filter((i) => i.id !== id) })),

  images: initialImages,
  socialPosts: [],
  emailCampaigns: [],
  landingPage: null,
  contentScore: null,
  generationSteps: [],
  isGeneratingKit: false,
  currentStepIndex: 0,

  setImages: (images) => set({ images }),
  updateImage: (id, updates) =>
    set((s) => ({
      images: s.images.map((img) => (img.id === id ? { ...img, ...updates } : img)),
    })),
  setSocialPosts: (socialPosts) => set({ socialPosts }),
  setEmailCampaigns: (emailCampaigns) => set({ emailCampaigns }),
  setLandingPage: (landingPage) => set({ landingPage }),
  setContentScore: (contentScore) => set({ contentScore }),
  setGenerationSteps: (generationSteps) => set({ generationSteps }),
  setIsGeneratingKit: (isGeneratingKit) => set({ isGeneratingKit }),
  setCurrentStepIndex: (currentStepIndex) => set({ currentStepIndex }),
  resetKit: () =>
    set({
      images: initialImages,
      socialPosts: [],
      emailCampaigns: [],
      landingPage: null,
      contentScore: null,
      generationSteps: [],
      isGeneratingKit: false,
      currentStepIndex: 0,
    }),
}));
