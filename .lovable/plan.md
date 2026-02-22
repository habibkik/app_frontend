

## Use Content Studio Images in AI Landing Page Generator

### Overview
When generating a landing page, automatically pull in AI-generated product images from the Content Studio and assign them to the appropriate blocks (hero background, solution image, about image). A new "Content Studio Assets" section in the generator dialog will show available images and let the user pick which ones to use.

### What Changes

**1. Pull Content Studio images into the generator**
The `AILandingGenerator` component will import `useContentStudioStore` and read the `images` array. Any image with a non-null `imageUrl` will be shown as available assets in a new visual section within the dialog.

**2. New "Available Assets" section in the dialog**
Between the "Data Source" selector and the form fields, a collapsible section will show:
- Thumbnails of all generated Content Studio images (filtered to those with `imageUrl !== null`)
- Each thumbnail shows its label (Social Media, Advertising, Landing Page, E-commerce, Email Marketing)
- A note saying "These images will be automatically assigned to your landing page blocks"
- If no images are available, a subtle hint: "Generate product images in Content Studio first for richer landing pages"

**3. Auto-assign images to generated blocks**
After the AI generates the block structure, the code will automatically:
- Use the "Landing Page" image (`id: "landing"`) as the hero `backgroundImageUrl`
- Use the "E-commerce" image (`id: "ecommerce"`) as the solution block `imageUrl`
- Use the "Advertising" image (`id: "ad"`) as the about block `imageUrl`
- If specific images aren't available, fall back to any available image, then to empty string

**4. Video note (future-ready)**
Since video generation is marked "Coming Soon" in the Content Studio (no actual video URLs exist), the assets section will include a small disabled badge saying "Video: Coming Soon" so the user knows it will be integrated once available. No video logic is added now -- it would be dead code.

### Technical Details

**File: `src/features/seller/components/website-builder/AILandingGenerator.tsx`**

Changes:
- Import `useContentStudioStore` from `@/stores/contentStudioStore`
- Import `ImageIcon` from lucide-react
- Read `images` from the content studio store: `const studioImages = useContentStudioStore((s) => s.images)`
- Filter to available images: `const availableImages = studioImages.filter(img => img.imageUrl)`
- Add a new UI section after the auto-filled banner showing image thumbnails in a horizontal scroll grid
- In `handleGenerate`, after building the `blocks` array, assign image URLs:
  - Find the hero block and set `config.backgroundImageUrl` to the "landing" image URL (or first available)
  - Find the solution block and set `config.imageUrl` to the "ecommerce" image URL (or second available)
  - Find the about block and set `config.imageUrl` to the "ad" image URL (or third available)
- Also pass `contentImages` array (URLs + labels) in the edge function request body so the AI can reference image contexts in its copy generation

**No other files need changes** -- the content studio store already exposes all needed data, and the block types already have `imageUrl`/`backgroundImageUrl` fields.

### Image Assignment Logic

```text
Content Studio Image ID -> Block Assignment
"landing"               -> Hero backgroundImageUrl
"ecommerce"             -> Solution imageUrl  
"ad"                    -> About imageUrl
"social"                -> Social Proof (if block exists)
"email"                 -> Offer/Pricing background (fallback)
```

If fewer images are available, the first available image is reused across blocks rather than leaving them empty.
