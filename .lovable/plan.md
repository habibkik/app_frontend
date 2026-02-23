

## Use Pro Photography Images Across Publisher and Website Builder

### Problem
The Social Publisher and Website Builder still reference the old `store.images` (5 legacy marketing images) instead of the new `store.proImages` (20 pro photography images). This means generated pro images are not available when scheduling posts or building websites.

### Changes

**1. Social Publisher (`src/features/seller/components/SocialPublisher.tsx`)**

- **Line 120**: Change `useContentStudioStore((s) => s.images)` to `useContentStudioStore((s) => s.proImages)` so the preview modal can find matching images from the pro photography set
- **Line 1157**: The preview modal already looks up images by matching `socialPost.imageId` against the images array -- since social posts now use pro image IDs (e.g., `ugc-outdoor`, `studio-hero`), this will automatically work once we point to `proImages`
- **Add a new content source option**: "From Pro Photography" that shows a grid of available pro images (those with URLs) so users can pick one to attach to any post
- **Batch campaign image support**: When sending social posts from Content Studio as a batch, include the matching pro image URL for each platform post

**2. Website Builder (`src/features/seller/components/website-builder/WebsiteBuilder.tsx`)**

- **Line 30**: Change `useContentStudioStore((s) => s.images)` to `useContentStudioStore((s) => s.proImages)` to pull from the pro photography set
- **Auto-populate block images**: After loading pro images, automatically assign them to relevant blocks:
  - Hero block background: use `studio-hero` image
  - About block image: use `studio-lifestyle` image  
  - Solution block image: use `packshot-front` image
- **Add a "Use Pro Images" button** in the toolbar that fills all image-capable blocks with the best matching pro image

**3. Content Studio social post flow update (`src/features/seller/components/content-studio/SocialImagePostsTab.tsx`)**

- When sending a post to the Publisher, include the matched pro image URL in the pending post data so the Publisher can display it
- Update `setPendingPublisherPost` to include an `imageUrl` field
- Update `setPendingBatchPosts` to include `imageUrl` for each post

**4. Store update (`src/stores/contentStudioStore.ts`)**

- Extend `pendingPublisherPost` type to include optional `imageUrl: string`
- Extend `pendingBatchPosts` items to include optional `imageUrl: string`

### Technical Details

| File | Change |
|---|---|
| `src/stores/contentStudioStore.ts` | Add `imageUrl?: string` to pending post types |
| `src/features/seller/components/content-studio/SocialImagePostsTab.tsx` | Include pro image URL when sending to Publisher |
| `src/features/seller/components/SocialPublisher.tsx` | Switch from `s.images` to `s.proImages`, add pro image picker in content source, consume `imageUrl` from pending posts |
| `src/features/seller/components/website-builder/WebsiteBuilder.tsx` | Switch from `s.images` to `s.proImages`, add auto-fill logic for block images |

### How It Works After Changes

1. User generates pro images in Content Studio
2. In **Publisher**: selecting "From Content Studio (Generated)" shows social posts with their matched pro images visible in previews. Users can also pick any pro image to attach to custom posts.
3. In **Website Builder**: pro images are available to populate hero backgrounds, about sections, and solution blocks -- either automatically or via a toolbar button.
