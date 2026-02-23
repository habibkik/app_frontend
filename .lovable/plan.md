

## Add 4 Professional Product Photography Sections to AI Product Images

### Overview
Expand the Images tab from 5 marketing-channel images to 5 + 20 professional photography images across 4 new sections. Each section generates 5 images using the uploaded product image as a reference, producing hyper-realistic commercial product photography.

### New Sections (each with 5 images)

1. **Packshot (Background Removal)** - Product isolated on white/transparent, 5 angles: front, side, back, 45-degree, top view
2. **UGC Lifestyle** - Authentic user-generated content style with real people, candid moments, diverse environments
3. **Real-Life Usage** - Contextual product-in-use scenes, cinematic lighting, storytelling composition
4. **Studio Commercial** - Premium studio advertising shots, professional lighting, luxury aesthetic

### Architecture

**Edge Function: `supabase/functions/generate-product-images/index.ts`**
- Add 20 new prompt entries to `IMAGE_PROMPTS` covering all 4 sections x 5 angles
- Accept an optional `referenceImageUrl` field in the request body
- When a reference image is provided, switch from text-only to image-editing mode by passing both the text prompt and the reference image in the `messages` content array (multimodal input)
- Update the `ImageRequest` type to include the new image types and `referenceImageUrl`

New prompt IDs:
- `packshot-front`, `packshot-side`, `packshot-back`, `packshot-45deg`, `packshot-top`
- `ugc-outdoor`, `ugc-home`, `ugc-social`, `ugc-unboxing`, `ugc-action`
- `usage-morning`, `usage-work`, `usage-commute`, `usage-leisure`, `usage-evening`
- `studio-hero`, `studio-detail`, `studio-lifestyle`, `studio-dramatic`, `studio-flat`

**Store: `src/stores/contentStudioStore.ts`**
- Add a new `proImages` array (20 `GeneratedImage` entries) alongside existing `images` (5 marketing images)
- Add `setProImages`, `updateProImage` actions
- Add `referenceImageUrl: string | null` and `setReferenceImageUrl` for storing the uploaded product image

**Types: `src/features/seller/components/content-studio/types.ts`**
- Add `GeneratedImage.section?: string` optional field to group images by section
- Add `ProImageSection` type: `"packshot" | "ugc" | "usage" | "studio"`

**New Component: `src/features/seller/components/content-studio/ProImageGenerationTab.tsx`**
- Displays 4 collapsible sections, each with a 5-image grid
- Each section has a header with title, description, and "Generate All" button
- Individual images have Regenerate and Download buttons (same pattern as `ImageGenerationTab`)
- At the top: a reference image uploader/selector that pulls from `analysisStore.currentImage` or lets the user upload a new one
- Global "Generate All 20 Images" button at the top
- Shows the reference image thumbnail with a label "Reference Product Image"

**Content Studio: `src/features/seller/components/ContentStudio.tsx`**
- Add a new tab `"pro-images"` with label "Pro Photography" and a Camera icon
- Import and render `ProImageGenerationTab` in the new tab
- Update `handleGenerateKit` to also generate pro images (as an optional step, after marketing images)
- Update `handleLoadDemoData` to include demo pro images (using Unsplash URLs)
- Add a new generation step "Generating pro photography" to the kit workflow

**Image Generation Flow:**
1. User sees reference image auto-populated from their last analysis (or uploads one)
2. User clicks "Generate All" on a section or individual "Generate" buttons
3. Edge function receives the reference image URL + prompt, uses Gemini image model with multimodal input
4. Generated base64 image is returned and stored in the `proImages` array

### Section-by-Section Prompt Strategy

Each prompt includes:
- The reference product image as visual input
- Explicit instruction to maintain product accuracy (shape, color, branding, proportions)
- Section-specific style direction (packshot = white BG, UGC = smartphone quality, usage = cinematic, studio = professional lighting)
- "No distortion, no hallucinated features, accurate branding" as a global suffix

### Rate Limiting Consideration
Generating 20 images sequentially with 1.5s delays would take ~30s+. The implementation will:
- Generate one section at a time (5 images per section)
- Add 2s delay between images to avoid 429 errors
- Allow per-section generation so users don't have to wait for all 20

### Files Changed

| File | Change |
|---|---|
| `supabase/functions/generate-product-images/index.ts` | Add 20 new prompts, accept `referenceImageUrl`, multimodal message format |
| `src/features/seller/components/content-studio/types.ts` | Add `ProImageSection` type, optional `section` field on `GeneratedImage` |
| `src/stores/contentStudioStore.ts` | Add `proImages` array (20 items), `referenceImageUrl`, actions |
| `src/features/seller/components/content-studio/ProImageGenerationTab.tsx` | New component with 4 collapsible sections |
| `src/features/seller/components/ContentStudio.tsx` | Add "Pro Photography" tab, wire up generation logic |
| `src/features/seller/components/content-studio/ImageGenerationTab.tsx` | No changes needed |
