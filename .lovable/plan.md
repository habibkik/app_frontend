
# ContentStudio Component Implementation Plan

## Overview
Create a comprehensive AI-powered content generation studio for sellers. This component will enable users to generate marketing content (headlines, ad copy, descriptions, emails, and social media posts) for their products using AI, with a professional two-panel layout featuring settings on the left and generated content tabs on the right.

## Component Location
**New File**: `src/features/seller/components/ContentStudio.tsx`

## Architecture

The component will follow the existing patterns found in:
- `ContentGenerationPanel.tsx` - For content generation logic and AI integration
- `AISuggestionsPanel.tsx` - For caption generation patterns
- `PostComposer.tsx` - For social media patterns
- `MarketInsightsPanel.tsx` - For card layouts and styling

## Component Structure

```text
ContentStudio
├── Left Panel (Sticky, ~320px)
│   └── ContentSettingsCard
│       ├── ProductSelector (dropdown)
│       ├── ProductImagePreview (thumbnail)
│       ├── TargetAudienceSelect (dropdown)
│       ├── ContentTypeCheckboxes (5 options)
│       ├── ToneSelector (dropdown)
│       └── GenerateButton (large, primary)
│
├── Right Panel (Main content, flex-1)
│   └── Tabs
│       ├── HeadlinesTab
│       │   └── HeadlineCard[] (5 cards)
│       │       ├── HeadlineText (large font)
│       │       ├── CopyButton
│       │       ├── UseInAdButton
│       │       ├── LikeButton (heart toggle)
│       │       └── RegenerateButton
│       │
│       ├── CopyTab
│       │   └── AdCopyCard[] (short/medium/long)
│       │       ├── CopyText
│       │       ├── CharacterCount
│       │       ├── EditButton (toggle textarea)
│       │       ├── CopyToClipboard
│       │       └── UseInFacebookAd
│       │
│       ├── DescriptionTab
│       │   └── DescriptionCard[] (short/medium/long)
│       │       ├── DescriptionText (editable)
│       │       ├── CopyButton
│       │       ├── UseOnWebsite
│       │       └── UseOnAmazon/OLX
│       │
│       ├── EmailTab
│       │   ├── SubjectLines[] (3 variations)
│       │   ├── EmailBodyTemplate
│       │   ├── EditButtons
│       │   ├── PreviewButton (modal)
│       │   └── SendTestButton
│       │
│       └── SocialTab
│           └── PlatformCard[] (Instagram, TikTok, Facebook, LinkedIn, Twitter)
│               ├── PlatformIcon + Name
│               ├── Caption (styled per platform)
│               ├── CharLimit indicator
│               ├── CopyButton
│               └── PostDirectlyButton
│
├── History Section (Collapsible, bottom)
│   └── RecentContentGrid
│       └── HistoryItem[]
│           ├── Thumbnail
│           ├── ProductName
│           ├── ContentType
│           ├── Date
│           ├── RestoreButton
│           └── DeleteButton
│
└── ActionBar (Bottom right, sticky)
    ├── SaveAsTemplateButton
    ├── ExportZipButton
    └── ShareWithTeamButton
```

## State Management

Local component state using useState:
- `selectedProduct`: Product ID
- `targetAudience`: Audience type
- `contentTypes`: Set of selected content types
- `tone`: Selected tone
- `isGenerating`: Loading state
- `generatedContent`: Object containing all generated content per tab
- `editingStates`: Track which cards are in edit mode
- `likedHeadlines`: Set of liked headline IDs
- `historyItems`: Array of previously generated content
- `showHistory`: Boolean for collapsible

## Types to Add

```typescript
interface ContentProduct {
  id: string;
  name: string;
  imageUrl?: string;
  category: string;
}

type TargetAudience = "ecommerce" | "wholesale" | "retailers" | "b2b" | "other";
type ContentType = "ad_copy" | "description" | "email" | "social" | "landing";
type ContentTone = "professional" | "friendly" | "humorous" | "urgent";

interface GeneratedHeadline {
  id: string;
  text: string;
  liked: boolean;
}

interface GeneratedAdCopy {
  id: string;
  variant: "short" | "medium" | "long";
  text: string;
  characterCount: number;
}

interface GeneratedDescription {
  id: string;
  variant: "short" | "medium" | "long";
  text: string;
  features?: string[];
  benefits?: string[];
}

interface GeneratedEmail {
  subjectLines: string[];
  body: string;
  hook: string;
  valueProp: string;
  cta: string;
}

interface SocialCaption {
  platform: "instagram" | "tiktok" | "facebook" | "linkedin" | "twitter";
  caption: string;
  hashtags?: string[];
  characterCount: number;
  characterLimit: number;
}

interface ContentHistoryItem {
  id: string;
  productId: string;
  productName: string;
  productThumbnail?: string;
  contentType: ContentType;
  generatedAt: Date;
  content: any;
}

interface GeneratedContent {
  headlines: GeneratedHeadline[];
  adCopy: GeneratedAdCopy[];
  descriptions: GeneratedDescription[];
  email: GeneratedEmail | null;
  social: SocialCaption[];
}
```

## UI Components Used

From existing UI library:
- `Card`, `CardHeader`, `CardTitle`, `CardContent` - Layout
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - Tab navigation
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` - Dropdowns
- `Checkbox` - Content type selection
- `Button` - Actions
- `Textarea` - Editable content
- `Badge` - Labels and counts
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` - History section
- `ScrollArea` - Scrollable areas
- `Separator` - Visual dividers
- `Dialog` - Email preview modal

Lucide Icons:
- `Wand2`, `Sparkles` - AI generation
- `Copy`, `Check` - Copy actions
- `Heart` - Like/favorite
- `RefreshCw` - Regenerate
- `Edit`, `Save` - Edit mode
- `Download`, `Share2`, `FileArchive` - Export actions
- `Mail`, `Eye` - Email preview
- `Send` - Post directly
- `History`, `Trash2` - History actions
- `ChevronDown`, `ChevronUp` - Collapsible
- Platform icons via custom SVGs or text identifiers

## Styling Details

**Color Scheme** (vibrant, inspiring):
- Primary actions: Blue (`bg-primary`)
- Generate button: Large, gradient blue background
- Social platform colors:
  - Instagram: Pink/Purple gradient
  - TikTok: Black/Cyan
  - Facebook: Blue
  - LinkedIn: Blue professional
  - Twitter/X: Black
- Success states: Emerald green
- Warning states: Yellow/Orange
- Character limits: Red when exceeded

**Layout**:
- Two-column responsive (stacks on mobile)
- Left panel: sticky, 320px width on desktop
- Right panel: flex-1, min-width 0
- Cards with subtle shadows and borders
- Smooth animations using framer-motion

## Mock Content Examples

**Headlines**:
```
1. "The Ultimate [Product] - Now 30% Off"
2. "Why 10,000+ Customers Choose [Brand]"
3. "[Product] That Actually Works - Guaranteed"
4. "Transform Your [Use Case] Today"
5. "Premium [Product] at Unbeatable Prices"
```

**Ad Copy (Short)**:
```
"Best-selling [product]. Fast shipping. Guaranteed quality. Order now!"
```

**Social Captions**:
```
Instagram: "✨ Elevate your [use case] with our premium [product]! 🚀 
#QualityFirst #Innovation #MustHave"

Twitter: "Looking for reliable [product]? 
✓ Fast shipping
✓ Quality guaranteed
Shop now → [link]"
```

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/features/seller/components/ContentStudio.tsx` | Create | Main component (~900 lines) |
| `src/features/seller/index.ts` | Edit | Add ContentStudio export |

## Implementation Details

### 1. Input Panel (Left, Sticky)

```typescript
// Product selector with mock data
const mockProducts = [
  { id: "1", name: "Servo Motor XR-500", imageUrl: "/placeholder.svg", category: "Motors" },
  { id: "2", name: "Hydraulic Pump HP-200", imageUrl: "/placeholder.svg", category: "Pumps" },
  { id: "3", name: "CNC Controller Board", imageUrl: "/placeholder.svg", category: "Electronics" },
];

// Target audiences
const audiences = [
  { value: "ecommerce", label: "E-commerce Shoppers" },
  { value: "wholesale", label: "Wholesale Buyers" },
  { value: "retailers", label: "Retailers" },
  { value: "b2b", label: "Corporate/B2B" },
  { value: "other", label: "Other" },
];

// Content types with icons
const contentTypeOptions = [
  { id: "ad_copy", label: "Ad copy (short)", icon: Megaphone },
  { id: "description", label: "Product description (long)", icon: FileText },
  { id: "email", label: "Email campaign", icon: Mail },
  { id: "social", label: "Social media posts", icon: Share2 },
  { id: "landing", label: "Landing page copy", icon: Globe },
];

// Tones
const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "humorous", label: "Humorous" },
  { value: "urgent", label: "Urgent/FOMO" },
];
```

### 2. Tab Content Structure

Each tab will have consistent card patterns:
- Header with title and action buttons
- Content area with text
- Footer with metadata (character count, platform info)
- Hover states for interactivity
- Animation on generation

### 3. AI Generation (Mock for now)

Initially will use mock/simulated generation:
```typescript
const generateContent = async () => {
  setIsGenerating(true);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Set mock generated content based on selected types
  setGeneratedContent({
    headlines: mockHeadlines,
    adCopy: mockAdCopy,
    descriptions: mockDescriptions,
    email: mockEmail,
    social: mockSocialCaptions,
  });
  
  setIsGenerating(false);
};
```

Future integration can use existing `useAICaptions` hook pattern or `generateProductContent` from MiroMind.

### 4. History Section

Collapsible section at bottom:
- Uses `Collapsible` from Radix UI
- Grid layout for history items
- Local storage persistence option
- Click to restore content
- Delete functionality

### 5. Actions Bar

Fixed position at bottom right:
- Save as Template: Opens dialog to name template
- Export as ZIP: Creates downloadable archive (simulated)
- Share with Team: Opens share dialog

## Responsive Behavior

- **Desktop (1024px+)**: Two-column layout, left sticky
- **Tablet (768px-1023px)**: Stacked layout, settings above tabs
- **Mobile (<768px)**: Full-width stacked, simplified tabs

## Integration Points

1. **Export in seller/index.ts**:
```typescript
export { ContentStudio } from "./components/ContentStudio";
```

2. **Future AI Integration**: Can connect to existing edge functions or create new `generate-content` edge function

3. **Social Publishing**: "Post directly" buttons can integrate with existing `useSocialPosting` hook

## Animations

Using framer-motion (already in dependencies):
- Fade in for generated content
- Slide animations for tab changes
- Scale animations for like button
- Smooth collapse for history section
