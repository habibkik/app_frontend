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

  // Publisher integration
  pendingPublisherPost: { content: string; platform: string; imageUrl?: string } | null;
  setPendingPublisherPost: (post: { content: string; platform: string; imageUrl?: string } | null) => void;

  // Batch campaign
  pendingBatchPosts: { content: string; platform: string; imageUrl?: string }[];
  setPendingBatchPosts: (posts: { content: string; platform: string; imageUrl?: string }[]) => void;

  // Website Builder integration
  pendingWebsiteData: { html: string; theme: any; sections: any } | null;
  setPendingWebsiteData: (data: { html: string; theme: any; sections: any } | null) => void;

  // Pro Photography
  proImages: GeneratedImage[];
  referenceImageUrl: string | null;
  setProImages: (images: GeneratedImage[]) => void;
  updateProImage: (id: string, updates: Partial<GeneratedImage>) => void;
  setReferenceImageUrl: (url: string | null) => void;
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

  pendingPublisherPost: null,
  setPendingPublisherPost: (pendingPublisherPost) => set({ pendingPublisherPost }),

  pendingBatchPosts: [],
  setPendingBatchPosts: (pendingBatchPosts) => set({ pendingBatchPosts }),

  pendingWebsiteData: null,
  setPendingWebsiteData: (pendingWebsiteData) => set({ pendingWebsiteData }),

  // Pro Photography
  proImages: [
    // Packshot
    { id: "packshot-front", label: "Front View", prompt: "", imageUrl: null, isGenerating: false, section: "packshot" },
    { id: "packshot-side", label: "Side View", prompt: "", imageUrl: null, isGenerating: false, section: "packshot" },
    { id: "packshot-back", label: "Back View", prompt: "", imageUrl: null, isGenerating: false, section: "packshot" },
    { id: "packshot-45deg", label: "45° Perspective", prompt: "", imageUrl: null, isGenerating: false, section: "packshot" },
    { id: "packshot-top", label: "Top View", prompt: "", imageUrl: null, isGenerating: false, section: "packshot" },
    // UGC
    { id: "ugc-outdoor", label: "Outdoor", prompt: "", imageUrl: null, isGenerating: false, section: "ugc" },
    { id: "ugc-home", label: "At Home", prompt: "", imageUrl: null, isGenerating: false, section: "ugc" },
    { id: "ugc-social", label: "Social Selfie", prompt: "", imageUrl: null, isGenerating: false, section: "ugc" },
    { id: "ugc-unboxing", label: "Unboxing", prompt: "", imageUrl: null, isGenerating: false, section: "ugc" },
    { id: "ugc-action", label: "In Action", prompt: "", imageUrl: null, isGenerating: false, section: "ugc" },
    // Usage
    { id: "usage-morning", label: "Morning Routine", prompt: "", imageUrl: null, isGenerating: false, section: "usage" },
    { id: "usage-work", label: "At Work", prompt: "", imageUrl: null, isGenerating: false, section: "usage" },
    { id: "usage-commute", label: "Commute", prompt: "", imageUrl: null, isGenerating: false, section: "usage" },
    { id: "usage-leisure", label: "Leisure", prompt: "", imageUrl: null, isGenerating: false, section: "usage" },
    { id: "usage-evening", label: "Evening", prompt: "", imageUrl: null, isGenerating: false, section: "usage" },
    // Studio
    { id: "studio-hero", label: "Hero Shot", prompt: "", imageUrl: null, isGenerating: false, section: "studio" },
    { id: "studio-detail", label: "Detail Macro", prompt: "", imageUrl: null, isGenerating: false, section: "studio" },
    { id: "studio-lifestyle", label: "Styled Lifestyle", prompt: "", imageUrl: null, isGenerating: false, section: "studio" },
    { id: "studio-dramatic", label: "Dramatic Lighting", prompt: "", imageUrl: null, isGenerating: false, section: "studio" },
    { id: "studio-flat", label: "Flat Lay", prompt: "", imageUrl: null, isGenerating: false, section: "studio" },
  ],
  referenceImageUrl: null,
  setProImages: (proImages) => set({ proImages }),
  updateProImage: (id, updates) =>
    set((s) => ({
      proImages: s.proImages.map((img) => (img.id === id ? { ...img, ...updates } : img)),
    })),
  setReferenceImageUrl: (referenceImageUrl) => set({ referenceImageUrl }),
}));
