

## AI Variation Playground

### What We're Building
A "Remix" dropdown on each generated pro image with three variation options: **Change Background**, **Add Prop**, and **Expand Canvas**. Clicking an option sends the existing image back to the `generate-product-images` edge function with a specialized remix prompt, and the result replaces the current image (or could be shown side-by-side).

### Architecture

**No new edge function needed.** The existing `generate-product-images` already supports multimodal input (image + text prompt). We add a new `remixMode` parameter that, when present, overrides the normal prompt with a remix-specific instruction.

### Changes

#### 1. Edge Function Update (`supabase/functions/generate-product-images/index.ts`)
- Add optional `remixMode` field to the request: `"change-background" | "add-prop" | "expand-canvas"`
- Add optional `remixContext` field (e.g., user-specified background scene or prop)
- When `remixMode` is set, bypass normal `IMAGE_PROMPTS` lookup and use remix-specific prompts:
  - **Change Background**: "Keep the product exactly as shown. Replace the background with [scene]. Maintain product proportions and lighting consistency."
  - **Add Prop**: "Keep the product exactly as shown. Add a complementary prop/accessory nearby: [prop]. Natural placement, matching lighting."
  - **Expand Canvas**: "Expand the canvas outward, extending the scene naturally. Keep the product centered and unchanged. Fill new areas with contextually appropriate content."
- The existing multimodal message construction (image_url + text) is reused as-is.

#### 2. New Component: `RemixMenu.tsx`
- A `DropdownMenu` triggered by a wand/sparkles icon button on each image card.
- Three options, each opens a small dialog/popover:
  - **Change Background** — optional text input for scene description (e.g., "beach sunset", "marble table"), or a few quick presets
  - **Add Prop** — optional text input for prop description, or presets like "coffee cup", "flowers", "laptop"
  - **Expand Canvas** — one-click, no extra input needed
- Calls the edge function with `remixMode`, the current `imageUrl` as `referenceImageUrl`, and any user context.
- Shows loading state on the image tile during generation.

#### 3. ProImageGenerationTab Updates
- Add a third button (Remix) alongside the existing Regenerate and Download buttons for each image tile (only enabled when image exists).
- Import and render `RemixMenu` component.
- Add a `remixProImage` callback similar to `generateProImage` but passes remix params.

#### 4. Store Update (`contentStudioStore.ts`)
- No schema changes needed — `updateProImage` already handles partial updates. The remix just replaces `imageUrl` on the same image slot.

### UI Layout per Image Tile
```text
┌─────────────────┐
│                  │
│   [Generated     │
│    Image]        │
│                  │
├─────────────────┤
│  Label Text      │
│ [↻] [✨▾] [⬇]  │  ← Regenerate, Remix dropdown, Download
└─────────────────┘
```

### Files to Create/Edit
1. **Create** `src/features/seller/components/content-studio/RemixMenu.tsx` — dropdown with 3 options + optional context input
2. **Edit** `supabase/functions/generate-product-images/index.ts` — add remix prompt logic
3. **Edit** `src/features/seller/components/content-studio/ProImageGenerationTab.tsx` — integrate RemixMenu, add remix callback

