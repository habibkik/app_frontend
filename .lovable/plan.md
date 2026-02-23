

## Replace "AI Product Images" with "Pro Photography" and Unify Image Usage

### What Changes

**1. Remove the old "Images" tab, keep only "Pro Photography"**

The `TABS` array in `ContentStudio.tsx` currently has both `"images"` (5 basic AI images) and `"pro-images"` (20 pro photography images). We will:
- Remove the `"images"` tab entry from `TABS`
- Remove the `<TabsContent value="images">` block
- Remove the `ImageGenerationTab` import
- Set default active tab to `"pro-images"`
- Update the `ContentStudioTab` type in `types.ts` to remove `"images"`

**2. Auto-set reference image from Market Intelligence upload**

In `ProImageGenerationTab.tsx`, the reference image already falls back to `analysisStore.currentImage`. We will make this the primary source:
- On mount, if `analysisStore.currentImage` exists and no `referenceImageUrl` is set, auto-populate it
- Show a clear indicator: "Using image from Market Intelligence analysis"

**3. Create a unified image pool for all downstream tabs**

Currently, `SocialImagePostsTab`, `EmailCampaignTab`, and `LandingPageTab` receive `images` (the 5 basic images) as props. We will:
- Create a helper function `getAllAvailableImages()` in `ContentStudio.tsx` that merges `store.proImages` (filtered to those with URLs) as the primary image source
- Pass this merged array to `SocialImagePostsTab`, `EmailCampaignTab`, and `LandingPageTab` instead of `store.images`
- Update `buildLandingPageHtml` calls to use the merged images (hero = `studio-hero`, product = `packshot-front`, etc.)

**4. Update social post generation to use pro images**

In `generateSocialPosts()`, update `imageId` assignments:
- Instagram -> `ugc-outdoor` (UGC style)
- Facebook -> `studio-hero` (professional)
- TikTok -> `ugc-action` (action shot)
- LinkedIn -> `packshot-front` (clean product shot)
- Twitter -> `usage-commute` (lifestyle)

**5. Update email campaign generation to use pro images**

In `generateEmailCampaigns()`, update `imageId` assignments:
- Launch Announcement -> `studio-hero`
- Early Bird Offer -> `packshot-front`
- Social Proof -> `ugc-social`
- Last Chance -> `studio-dramatic`
- VIP Access -> `studio-lifestyle`

**6. Update landing page builder to prefer pro images**

In `buildLandingPageHtml()`, update image selection:
- Hero image: look for `studio-hero` first, then `landing`
- Product image: look for `packshot-front` first, then `ecommerce`

**7. Update kit generation flow**

In `handleGenerateKit()`:
- Remove "Generating images" step (old 5 basic images)
- Keep "Generating pro photography" as the first and primary image step
- Auto-use `analysisStore.currentImage` as the reference image
- After pro images are generated, run social/landing/email steps using pro images

**8. Update demo data**

In `handleLoadDemoData()`:
- Remove `store.setImages(demoImages)` for old 5 images
- Keep pro image demo data
- Update social post and email demo `imageId` references to pro image IDs

### Files Changed

| File | Change |
|---|---|
| `src/features/seller/components/content-studio/types.ts` | Remove `"images"` from `ContentStudioTab` |
| `src/features/seller/components/ContentStudio.tsx` | Remove Images tab, update image references, merge pro images into downstream tabs, update kit generation |
| `src/features/seller/components/content-studio/ProImageGenerationTab.tsx` | Auto-populate reference from Market Intelligence on mount |

### No Breaking Changes

- `SocialImagePostsTab`, `EmailCampaignTab`, `LandingPageTab` all accept `GeneratedImage[]` -- the pro images use the same type with the extra `section` field, so no interface changes needed
- The `images` prop name stays the same, just the data source changes
- Export functionality updated to include pro images instead of basic images

