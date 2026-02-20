export interface GeneratedImage {
  id: string;
  label: string;
  prompt: string;
  imageUrl: string | null;
  isGenerating: boolean;
  error?: string;
}

export interface SocialImagePost {
  id: string;
  platform: "instagram" | "facebook" | "tiktok" | "linkedin" | "twitter";
  caption: string;
  hook: string;
  cta: string;
  hashtags: string[];
  imageId: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subjectLine: string;
  previewText: string;
  body: string;
  cta: string;
  imageId: string;
}

export interface ContentScore {
  overall: number;
  headlineClarity: number;
  ctaStrength: number;
  emotionalAppeal: number;
  platformOptimization: number;
  competitiveDifferentiation: number;
  suggestions: string[];
  abTestSuggestions: string[];
  pricingAngleSuggestions: string[];
  ctaOptimizations: string[];
}

export interface LandingPageData {
  html: string;
  sections: {
    hero: string;
    benefits: string[];
    features: string[];
    socialProof: string[];
    faq: { question: string; answer: string }[];
    ctaText: string;
  };
}

export interface GenerationStep {
  label: string;
  status: "pending" | "running" | "done" | "error";
}

export type ContentStudioTab =
  | "images"
  | "social-image"
  | "video"
  | "social-video"
  | "landing-page"
  | "email"
  | "score";
