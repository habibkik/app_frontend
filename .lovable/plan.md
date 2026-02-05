

# SocialPublisher Component Implementation Plan

## Overview
Create a comprehensive social media publishing component at `src/features/seller/components/SocialPublisher.tsx` that provides content selection, multi-platform publishing, scheduling, UTM tracking, A/B testing, and post management. This component integrates with the existing campaign infrastructure (PlatformSelector, PostScheduler, PostPreview, useSocialPosting hook, and the scheduled_posts database table).

## Component Location
**New File**: `src/features/seller/components/SocialPublisher.tsx`

## Architecture

```text
SocialPublisher
|
+-- Content Selection (Top)
|   +-- Source dropdown (Content Studio / Custom / Upload)
|   +-- Content preview with edit modal
|
+-- Platform Selector (Middle)
|   +-- Checkbox grid for 6 platforms (FB, IG, TikTok, LinkedIn, X, WhatsApp)
|   +-- Per-platform: account name, char limit, preview
|
+-- Scheduling Section
|   +-- Date picker, time picker, timezone selector
|   +-- "Post immediately" checkbox
|   +-- "Best time" AI suggestion button
|
+-- Analytics & UTM (Collapsible)
|   +-- Track engagement toggle
|   +-- UTM parameter builder (campaign, medium, source)
|   +-- Preview URL + copy button
|
+-- A/B Testing (Collapsible)
|   +-- Create variant button
|   +-- Variant A / B cards with edit
|   +-- Split traffic toggle
|   +-- Auto-select winner info
|
+-- Action Buttons (Bottom)
|   +-- Preview all posts (modal)
|   +-- Schedule posts (primary)
|   +-- Save as draft
|
+-- Success Modal (after scheduling)
|   +-- Campaign ID, platform count, time
|   +-- Navigation buttons
|
+-- Scheduled Posts List (Bottom section)
|   +-- Cards with thumbnail, platforms, status, actions
```

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/features/seller/components/SocialPublisher.tsx` | Create | Full SocialPublisher component |
| `src/features/seller/index.ts` | Edit | Add SocialPublisher export |

## Technical Details

### State Management

Local useState for all component state:
- `contentSource`: "studio" / "custom" / "upload"
- `content`: string (the caption/copy text)
- `mediaUrl`: optional string for image/video
- `selectedPlatforms`: string[] of platform IDs
- `scheduleType`: "now" / "scheduled"
- `scheduledDate`, `scheduledTime`, `timezone`
- `trackEngagement`: boolean
- `utmParams`: { campaign, medium, source }
- `abTestingEnabled`: boolean
- `variantB`: { content, mediaUrl } for the B variant
- `splitTraffic`: boolean (50/50)
- `showPreviewModal`, `showSuccessModal`, `showEditModal`
- `scheduledPosts`: array of past/upcoming posts (mock data initially)

### Platforms Configuration

```typescript
const platforms = [
  { id: "facebook", name: "Facebook", icon: "📘", charLimit: 63206, color: "bg-blue-600" },
  { id: "instagram", name: "Instagram", icon: "📸", charLimit: 2200, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { id: "tiktok", name: "TikTok", icon: "🎵", charLimit: 2200, color: "bg-black" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", charLimit: 3000, color: "bg-blue-700" },
  { id: "twitter", name: "Twitter/X", icon: "𝕏", charLimit: 280, color: "bg-black" },
  { id: "whatsapp", name: "WhatsApp", icon: "💬", charLimit: 700, color: "bg-green-500" },
];
```

### Integration Points

1. **useSocialPosting hook**: Used for "Post immediately" action via the existing `social-post` edge function
2. **PostPreview component**: Reused from `src/components/campaigns/PostPreview.tsx` for platform-specific previews in the preview modal
3. **Calendar/Popover**: Reused existing Shadcn date picker pattern with `pointer-events-auto`
4. **scheduled_posts table**: Used for saving scheduled/draft posts via Supabase client
5. **ContentStudio**: Content can be sourced from ContentStudio generated content

### UTM Builder Logic

```typescript
const buildUtmUrl = (baseUrl: string, params: UTMParams) => {
  const url = new URL(baseUrl);
  if (params.campaign) url.searchParams.set("utm_campaign", params.campaign);
  if (params.medium) url.searchParams.set("utm_medium", params.medium);
  if (params.source) url.searchParams.set("utm_source", params.source);
  return url.toString();
};
```

### Scheduling Flow

1. User fills content and selects platforms
2. Chooses "Post immediately" or schedules date/time
3. On "Schedule posts" click:
   - If immediate: calls `useSocialPosting.publishPost()`
   - If scheduled: inserts into `scheduled_posts` table via Supabase client
4. Shows success modal with campaign details
5. Post appears in Scheduled Posts List at the bottom

### A/B Testing (UI-only for now)

- Toggle enables variant B creation
- Side-by-side card display for variants A and B
- Each variant has its own content editor and media slot
- "Split traffic 50/50" checkbox
- Display text: "Testing for 3 days, then auto-select winner"
- Future backend integration can handle actual split testing

### UI Components Used

From existing library:
- Card, Tabs, Select, Checkbox, Button, Textarea, Badge
- Calendar, Popover, Dialog, Switch, Input, Label
- Collapsible, ScrollArea, Separator
- AlertDialog (for cancel confirmation)

Icons (Lucide):
- Send, Calendar, Clock, Eye, Save, Copy, Edit, Trash2
- Facebook, Instagram, Linkedin, Twitter
- Sparkles (AI best time), Link2 (UTM), FlaskConical (A/B test)
- CheckCircle2, AlertCircle, Globe, Upload, FileText

### Responsive Design

- Desktop: Multi-column layout where UTM/A/B testing sit alongside scheduling
- Tablet: Stacked sections
- Mobile: Full-width single column, simplified platform grid

### Styling

- Platform-specific colors on selection cards
- Gradient primary button for "Schedule posts"
- Status badges: blue (scheduled), green (posted), yellow (draft), red (failed)
- Smooth framer-motion animations for section reveals and post list items
- Collapsible sections for UTM and A/B testing to reduce visual clutter

