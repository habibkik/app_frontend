

## Bulk Demand Signal Detection

A new Seller-mode page that aggregates and visualizes demand signals across social and search platforms (Facebook, TikTok, Instagram, Google, YouTube, Pinterest, X/Twitter) to help sellers identify trending products, rising niches, and geographic demand hotspots.

### What gets built

**1. New page: `/dashboard/demand-signals`**
A full-featured dashboard with:
- Platform selector chips (Facebook, TikTok, Instagram, Google Trends, YouTube, Pinterest, X/Twitter) with multi-select
- "Scan for Signals" button that calls an AI-powered edge function
- Results displayed in 4 sections:
  - **Trending Products** -- cards showing product name, platform source, trend score (0-100), volume indicator, and growth direction
  - **Rising Niches** -- emerging categories with momentum scores and platform breakdown
  - **Geographic Hotspots** -- regions with strongest demand signals (reuses existing map entity types for potential Heat Map integration)
  - **Signal Timeline** -- a line/area chart showing signal strength over time per platform

**2. New edge function: `demand-signal-scan`**
- Accepts: product keywords (optional), selected platforms, user location
- Uses Lovable AI (Gemini 2.5 Flash) to generate realistic demand intelligence based on the user's product catalog and selected platforms
- Returns structured JSON with trending products, niches, geographic hotspots, and time-series data
- No external API keys required

**3. Navigation integration**
- Add "Demand Signals" to seller navigation under the "Intelligence" group with a `Radar` icon

**4. Demo/mock data**
- Pre-populated demo results so the page isn't empty before the user clicks "Scan"
- 20+ signal entries across all 7 platforms

### Files to create/modify

| File | Action |
|------|--------|
| `src/pages/dashboard/DemandSignals.tsx` | Create -- page wrapper |
| `src/features/seller/components/DemandSignalsDashboard.tsx` | Create -- main component with platform selector, scan button, results grid, timeline chart |
| `src/data/demoDemandSignals.ts` | Create -- demo data (20+ signals across platforms) |
| `supabase/functions/demand-signal-scan/index.ts` | Create -- edge function using Lovable AI |
| `src/features/dashboard/config/navigation.ts` | Edit -- add "Demand Signals" nav item to seller Intelligence group |
| `src/app/Router.tsx` | Edit -- add route `/dashboard/demand-signals` |

### Technical details

**DemandSignal type:**
```text
{
  id: string
  platform: "facebook" | "tiktok" | "instagram" | "google" | "youtube" | "pinterest" | "twitter"
  signalType: "trending_product" | "rising_niche" | "geographic_hotspot"
  name: string
  category: string
  trendScore: number        // 0-100
  volume: "high" | "medium" | "low"
  growth: "surging" | "rising" | "stable" | "declining"
  region?: string
  geoLocation?: GeoLocation
  confidence: number        // 0-100
  detectedAt: string        // ISO timestamp
  keywords: string[]
  engagementMetrics?: {
    mentions: number
    hashtags: number
    searchVolume: number
  }
}
```

**Edge function approach:**
- POST body: `{ platforms: string[], keywords?: string[], userProducts?: string[] }`
- Calls Lovable AI Gateway (Gemini 2.5 Flash) with a structured prompt
- Returns `{ signals: DemandSignal[], summary: string, scannedAt: string }`

**UI layout:**
- Top: platform chips + keyword input + "Scan" button
- Summary cards row: Total Signals, Surging Trends, Top Platform, Top Region
- Tab view: Trending Products | Rising Niches | Geographic Hotspots | Timeline
- Each tab shows filtered, sorted cards with platform badges and trend indicators

