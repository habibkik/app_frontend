

# Content Generation Module Implementation Plan

## Overview
Create a comprehensive AI-powered content generation module `src/features/agents/miromind/contentGeneration.ts` that integrates with the Lovable AI Gateway to generate marketing content. This module will power the ContentStudio component with real AI-generated content instead of mock data.

## Current State

### Existing Infrastructure
- **MiroMind Agent**: Located at `src/features/agents/miromind/` with types, prompts, and API functions
- **Generate Caption Edge Function**: `supabase/functions/generate-caption/index.ts` already uses Lovable AI Gateway with tool calling
- **ContentStudio Component**: Uses mock `generateMockContent()` function that needs to be replaced
- **LOVABLE_API_KEY**: Already configured as a secret

### What's Missing
1. No `contentGeneration.ts` module for comprehensive marketing content
2. No edge function dedicated to full content generation (headlines, copy, descriptions, email, social)
3. ContentStudio uses mock data instead of real AI

## Architecture

```text
ContentStudio.tsx
       │
       ▼ (calls)
contentGeneration.ts (client-side API)
       │
       ▼ (HTTP request)
supabase/functions/generate-marketing-content/index.ts
       │
       ▼ (calls)
Lovable AI Gateway (google/gemini-3-flash-preview)
       │
       ▼ (returns structured JSON)
GeneratedContent response
```

## Implementation Plan

### 1. Create Edge Function for Marketing Content Generation

**New File**: `supabase/functions/generate-marketing-content/index.ts`

This edge function will:
- Accept product details, audience, and tone
- Use Lovable AI Gateway with tool calling for structured output
- Generate all content types in one request
- Handle rate limits (429) and payment errors (402)

Key features:
- System prompt with detailed instructions for each content type
- Tool definition for structured `GeneratedContent` output
- Tone and audience customization in prompts

### 2. Create Client-Side Content Generation Module

**New File**: `src/features/agents/miromind/contentGeneration.ts`

Exports:
- `generateMarketingContent()` - Main function that calls the edge function
- `GeneratedContent` type - Return type with all content categories
- Helper types for headlines, ad copy, descriptions, email, and social

### 3. Update MiroMind Index

**Edit**: `src/features/agents/miromind/index.ts`

Add exports for the new content generation module.

### 4. Add Edge Function Config

**Edit**: `supabase/config.toml`

Add configuration for the new edge function.

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/generate-marketing-content/index.ts` | Create | Edge function using Lovable AI Gateway |
| `src/features/agents/miromind/contentGeneration.ts` | Create | Client-side API module |
| `src/features/agents/miromind/index.ts` | Edit | Add new exports |
| `supabase/config.toml` | Edit | Add function config |

## Technical Details

### Edge Function Implementation

The edge function will use the Lovable AI Gateway with tool calling to extract structured output:

```typescript
// System prompt structure
const systemPrompt = `You are MiroMind, an expert marketing content creator...

PRODUCT: ${productName}
DESCRIPTION: ${productDescription}
TARGET AUDIENCE: ${targetAudience}
TONE: ${tone}

Generate comprehensive marketing content following these guidelines:

1. HEADLINES (5 variations):
   - Attention-grabbing, benefit-focused
   - Include: urgency, uniqueness, value proposition
   
2. AD COPY (3 lengths):
   - Short (~30 words): Hook + CTA
   - Medium (~75 words): Hook + value + benefits + CTA
   - Long (~150 words): Full narrative
   
3. PRODUCT DESCRIPTIONS (3 lengths):
   - Short (~50 words): Core value
   - Medium (~150 words): Features + benefits
   - Long (~300 words): Complete with specs
   
4. EMAIL CAMPAIGN:
   - 3 subject line variations
   - Full email body template
   
5. SOCIAL MEDIA (per platform):
   - Instagram: caption, hashtags, emojis
   - TikTok: hook, caption, trending sounds
   - Facebook: copy, engagement question, CTA
   - LinkedIn: professional B2B angle
   - Twitter/X: concise 280-char message

TONE ADAPTATION:
- Professional: Business-like, formal, trustworthy
- Friendly: Conversational, approachable
- Humorous: Witty, entertaining
- Urgent: FOMO, scarcity, action-driven

AUDIENCE CUSTOMIZATION:
- E-commerce: Value, variety, fast shipping
- Wholesale: Bulk pricing, reliability
- Retailers: Margins, display-friendly
- B2B: ROI, compliance, support`;
```

### Tool Definition for Structured Output

```typescript
const tools = [{
  type: "function",
  function: {
    name: "generate_marketing_content",
    description: "Generate comprehensive marketing content for a product",
    parameters: {
      type: "object",
      properties: {
        headlines: {
          type: "array",
          items: { type: "string" },
          description: "5 attention-grabbing headlines"
        },
        adCopy: {
          type: "object",
          properties: {
            short: { type: "string" },
            medium: { type: "string" },
            long: { type: "string" }
          }
        },
        descriptions: {
          type: "object",
          properties: {
            short: { type: "string" },
            medium: { type: "string" },
            long: { type: "string" }
          }
        },
        emailCampaign: {
          type: "object",
          properties: {
            subjects: { type: "array", items: { type: "string" } },
            body: { type: "string" }
          }
        },
        socialMedia: {
          type: "object",
          properties: {
            instagram: { /* ... */ },
            tiktok: { /* ... */ },
            facebook: { /* ... */ },
            linkedin: { /* ... */ },
            twitter: { /* ... */ }
          }
        }
      },
      required: ["headlines", "adCopy", "descriptions", "emailCampaign", "socialMedia"]
    }
  }
}];
```

### Client-Side Module Types

```typescript
// GeneratedContent type
export interface GeneratedContent {
  productName: string;
  targetAudience: string;
  tone: string;
  
  headlines: string[];  // 5 variations
  
  adCopy: {
    short: string;   // ~30 words
    medium: string;  // ~75 words
    long: string;    // ~150 words
  };
  
  descriptions: {
    short: string;   // ~50 words
    medium: string;  // ~150 words
    long: string;    // ~300+ words
  };
  
  emailCampaign: {
    subjects: string[];  // 3 variations
    body: string;        // HTML template
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
  
  generatedAt: string;
}
```

### Client-Side API Function

```typescript
export async function generateMarketingContent(
  productName: string,
  productDescription: string,
  targetAudience: string,
  tone: string
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
    throw new Error("Failed to generate content");
  }

  return response.json();
}
```

## Error Handling

The implementation will handle:
- **429 Too Many Requests**: Display rate limit message to user
- **402 Payment Required**: Display credits exhausted message
- **Network errors**: Fallback to mock content with warning toast
- **Validation errors**: Return descriptive error messages

## Integration with ContentStudio

After implementation, the ContentStudio component can be updated to:

```typescript
import { generateMarketingContent } from "@/features/agents/miromind";

// In the generate handler:
const handleGenerate = async () => {
  setIsGenerating(true);
  try {
    const content = await generateMarketingContent(
      selectedProduct.name,
      selectedProduct.description || "",
      targetAudience,
      tone
    );
    // Map to component's GeneratedContent format
    setGeneratedContent(mapToComponentFormat(content));
  } catch (error) {
    toast.error(error.message);
    // Fallback to mock content
    setGeneratedContent(generateMockContent(selectedProduct.name));
  } finally {
    setIsGenerating(false);
  }
};
```

## Prompt Engineering Details

### Tone Variations

| Tone | Characteristics |
|------|-----------------|
| Professional | Business-like, formal, trustworthy, industry terminology |
| Friendly | Conversational, approachable, relatable, warm |
| Humorous | Witty, entertaining, memorable, playful |
| Urgent/FOMO | Time-sensitive, scarcity, action-driven, compelling |

### Audience Targeting

| Audience | Focus Areas |
|----------|-------------|
| E-commerce Shoppers | Value, variety, fast shipping, reviews |
| Wholesale Buyers | Bulk pricing, reliability, partnerships, volume discounts |
| Retailers | Margins, display-friendly, brand strength, resale potential |
| Corporate/B2B | ROI, compliance, reliability, support, scalability |

### Platform-Specific Guidelines

| Platform | Character Limit | Style |
|----------|-----------------|-------|
| Instagram | 2200 | Visual-focused, emoji-heavy, 10-15 hashtags |
| TikTok | 300 | Trendy, casual, hook-focused, sound suggestions |
| Facebook | 500+ | Conversational, engagement questions, CTA buttons |
| LinkedIn | 700 | Professional B2B, industry insights, thought leadership |
| Twitter/X | 280 | Concise, witty, punchy, 1-2 hashtags |

