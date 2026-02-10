/**
 * MiroMind Content Generation Module
 * AI-powered marketing content generation using Lovable AI Gateway
 */

// Types
export interface GeneratedContent {
  productName: string;
  targetAudience: string;
  tone: string;

  headlines: string[];

  adCopy: {
    short: string;
    medium: string;
    long: string;
  };

  descriptions: {
    short: string;
    medium: string;
    long: string;
  };

  emailCampaign: {
    subjects: string[];
    body: string;
  };

  socialMedia: {
    instagram: {
      caption: string;
      hashtags: string[];
      emojis: string[];
    };
    tiktok: {
      caption: string;
      hashtags: string[];
      sounds: string[];
    };
    facebook: {
      copy: string;
      cta: string;
      question: string;
    };
    linkedin: {
      copy: string;
      cta: string;
    };
    twitter: {
      copy: string;
      hashtag: string;
      cta: string;
    };
  };

  landingPage: {
    heroHeadline: string;
    heroSubheadline: string;
    valueProposition: string;
    featureHighlights: string[];
    ctaText: string;
  } | null;

  generatedAt: string;
}

export type TargetAudience = "ecommerce" | "wholesale" | "retailers" | "b2b" | "other";
export type ContentTone = "professional" | "friendly" | "humorous" | "urgent";

export interface GenerateContentOptions {
  productName: string;
  productDescription?: string;
  targetAudience: TargetAudience | string;
  tone: ContentTone | string;
}

/**
 * Generate comprehensive marketing content for a product using AI
 * 
 * @param productName - Name of the product
 * @param productDescription - Optional description of the product
 * @param targetAudience - Target audience (ecommerce, wholesale, retailers, b2b, other)
 * @param tone - Content tone (professional, friendly, humorous, urgent)
 * @returns Generated marketing content including headlines, copy, descriptions, email, and social
 */
export async function generateMarketingContent(
  productName: string,
  productDescription: string = "",
  targetAudience: string = "ecommerce",
  tone: string = "professional"
): Promise<GeneratedContent> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-marketing-content`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        productName,
        productDescription,
        targetAudience,
        tone,
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted. Please add credits to continue.");
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate content");
  }

  return response.json();
}

/**
 * Generate content with options object
 */
export async function generateContentWithOptions(
  options: GenerateContentOptions
): Promise<GeneratedContent> {
  return generateMarketingContent(
    options.productName,
    options.productDescription || "",
    options.targetAudience,
    options.tone
  );
}
