

## Enhanced Content Studio -- Full Marketing Kit Generator

A complete overhaul of the Content Studio page that auto-activates when product intelligence is available, generating a full marketing content kit including AI images, social posts with images, video (placeholder), landing page with order form, and email campaigns with scoring and optimization suggestions.

### What gets built

**1. Auto-Activation from Market Intelligence**
- Content Studio detects when seller analysis results exist in the `analysisStore` (product identification, competitors, pricing, demand indicators)
- Automatically pre-fills product name, category, competitor data, and pricing strategy into the generation context
- Shows a banner: "Intelligence data detected -- Generate your complete marketing kit"

**2. AI Image Generation (5 images)**
- New edge function `generate-product-images` using Nano Banana (google/gemini-2.5-flash-image)
- Generates 5 product images optimized for: social media, ads, landing page, ecommerce, email
- Each image includes: preview, regenerate button, download button, usage label
- Images stored as base64 in component state (optionally uploadable to storage)

**3. Social Media Posts with Image (5 posts)**
- Each post includes: caption, hook, CTA, hashtags, and an attached generated image
- Platform-optimized for Instagram, Facebook, TikTok, LinkedIn, Twitter/X
- Copy and download actions per post
- Competitor differentiation woven into captions using analysis data

**4. Video Generation (Placeholder)**
- UI tab with "Coming Soon" badge
- Shows what will be generated: script, storyboard, voiceover text, subtitles
- Placeholder cards with the video generation workflow description
- Ready to connect when a video API becomes available

**5. Social Media Posts with Video (Placeholder)**
- Same placeholder approach as video tab
- Shows 5 planned video-based post slots

**6. Landing Page Builder**
- Auto-generates a conversion-optimized landing page using:
  - Generated images
  - Product intelligence insights (from analysisStore)
  - Competitor differentiation points
  - Pricing strategy data
- Sections: Hero, Benefits, Features, Social Proof (from competitor analysis), FAQ (AI-generated), CTA, Order Form
- Live preview in an iframe-like card
- Mobile responsive preview toggle
- Export as HTML

**7. Order Form with Database Integration**
- Built-in order form component: name, phone, email, address, quantity, submit
- New database table `content_orders` to store submissions
- RLS policies scoped to the content creator's user_id
- Success toast notification on submission

**8. Email Campaign Generator (5 campaigns)**
- 5 distinct email campaigns using generated images
- Each includes: subject line, preview text, body with image, CTA, personalization placeholders
- Responsive email layout preview
- Copy HTML / Download options

**9. Content Scoring and Optimization**
- Content score (0-100) for each generated piece based on: clarity, CTA strength, emotional appeal, keyword density
- Competitor differentiation suggestions panel
- Pricing angle suggestions based on market data
- CTA optimization tips
- A/B testing suggestions for headlines/CTAs

**10. Publishing and Export**
- Export options: HTML, JSON, CMS-ready format
- SEO meta tags auto-generated (title, description, keywords)
- Download all assets as a package

### New Tab Navigation

```text
Images | Social (Image) | Video | Social (Video) | Landing Page | Email Campaign | Score & Optimize
```

### Files to create

| File | Purpose |
|------|---------|
| `supabase/functions/generate-product-images/index.ts` | Edge function for AI image generation using Nano Banana |
| `src/features/seller/components/content-studio/ImageGenerationTab.tsx` | 5 AI-generated product images with preview/download |
| `src/features/seller/components/content-studio/SocialImagePostsTab.tsx` | 5 social posts with attached images |
| `src/features/seller/components/content-studio/VideoTab.tsx` | Placeholder for video generation |
| `src/features/seller/components/content-studio/SocialVideoPostsTab.tsx` | Placeholder for video social posts |
| `src/features/seller/components/content-studio/LandingPageTab.tsx` | Landing page builder with live preview |
| `src/features/seller/components/content-studio/OrderForm.tsx` | Order form component with database integration |
| `src/features/seller/components/content-studio/EmailCampaignTab.tsx` | 5 email campaigns with images |
| `src/features/seller/components/content-studio/ContentScoreTab.tsx` | Scoring, differentiation, CTA optimization, A/B suggestions |
| `src/features/seller/components/content-studio/types.ts` | Shared types for the enhanced content studio |

### Files to modify

| File | Changes |
|------|---------|
| `src/features/seller/components/ContentStudio.tsx` | Major overhaul: new tab structure, auto-activation from analysisStore, orchestrated generation flow with progress indicator |
| `src/stores/contentStudioStore.ts` | Expand to hold generated images, landing page HTML, email campaigns, scores |
| `supabase/config.toml` | Add `[functions.generate-product-images]` |

### Database changes

**New table: `content_orders`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | Owner of the landing page |
| name | text | Customer name |
| phone | text | Customer phone |
| email | text | Customer email |
| address | text | Customer address |
| quantity | integer | Order quantity |
| product_name | text | Product ordered |
| created_at | timestamptz | default now() |

RLS: Insert allowed for anon (public order form), SELECT/DELETE scoped to user_id.

### Technical details

**Image Generation Edge Function:**
- Uses `google/gemini-2.5-flash-image` (Nano Banana) via Lovable AI Gateway
- Generates 5 images sequentially with different prompts per use case (social, ad, landing, ecommerce, email)
- Returns array of base64 image URLs
- Handles 429/402 errors gracefully

**Auto-Activation Logic:**
```text
const sellerResults = useAnalysisStore(s => s.sellerResults);

// If sellerResults exist, pre-populate:
// - productName from sellerResults.productIdentification.name
// - competitors from sellerResults.competitors
// - pricing from sellerResults.pricingRecommendation
// - demand from sellerResults.demandIndicators
```

**Content Scoring Algorithm:**
- Headline clarity: keyword density + length optimization (0-20 points)
- CTA strength: action verb presence + urgency (0-20 points)
- Emotional appeal: sentiment analysis keywords (0-20 points)
- Platform optimization: character count compliance (0-20 points)
- Competitive differentiation: unique selling points vs competitors (0-20 points)

**Landing Page HTML Generation:**
- Uses the existing `generate-marketing-content` edge function enhanced with landing page sections
- Renders a full HTML page with inline CSS for portability
- Includes: hero with image, benefits grid, features list, testimonial placeholders, FAQ accordion, CTA with order form
- Export produces a self-contained HTML file

**Generation Flow:**
```text
1. User clicks "Generate Full Kit" (or auto-triggered)
2. Progress bar shows: "Generating images... (1/7)"
3. Sequential generation:
   a. Images (5x Nano Banana calls)
   b. Social posts with images (text generation + image attachment)
   c. Landing page content
   d. Email campaigns
   e. Content scoring
4. All tabs populated, user can navigate freely
```

### Video generation note

Seedance 2.0 and other video generation APIs are not available through Lovable AI. The Video and Social (Video) tabs will show a polished "Coming Soon" interface with:
- Description of what will be generated
- Script/storyboard template that can be used manually
- A note that video API integration is planned

