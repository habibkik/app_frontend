
# Seller Dashboard Page

## Overview
Create a dedicated `SellerDashboard.tsx` in `src/features/seller/pages/` with six sections: Welcome Card, Key Actions, Sales Performance Charts, Top Products Table, Competitor Alerts, and Recent Posts. Wire it into the router and update seller navigation so "Dashboard" in seller mode loads this page instead of the generic one.

## Sections

### 1. Welcome Card
- Greets user by first name from `useAuth()` hook (`user.firstName`)
- Three stat mini-cards: Active Products (1,247), Sales This Month ($45,800), Average Rating (4.2 stars)

### 2. Key Actions (4 Cards)
- "Monitor Competitors" links to `/dashboard/competitors`
- "Optimize Pricing" links to `/dashboard/pricing`
- "Create Content" links to `/dashboard/content-studio`
- "Publish Post" links to `/dashboard/publisher`
- Each card has an icon, title, short description, and arrow button

### 3. Sales Performance Chart
- Line chart showing 30-day sales trend using Recharts (already installed)
- Bar chart showing top 5 products by revenue
- Summary badge: "Sales up 15% vs last month"
- Uses mock data defined locally in the file

### 4. Top Performing Products Table
- Table with columns: Product Name, Units Sold, Revenue, Rating
- 5 rows of mock data
- Uses existing `Table` UI components

### 5. Competitor Alerts
- Pulls alerts from `useCompetitorMonitorStore` (already has mock alerts)
- Shows undismissed alerts from last 24h
- Each alert shows competitor name, message, and timestamp
- "View all alerts" link navigates to `/dashboard/competitors`

### 6. Recent Posts
- Queries `scheduled_posts` table from the database for posts with status "published"
- Falls back to mock data if no posts exist
- Shows last 3 posts with platform icons, content preview, and timestamp
- "View analytics" button per post

## Technical Details

### Files to create
- `src/features/seller/pages/SellerDashboard.tsx` -- the full page component

### Files to modify
- `src/app/Router.tsx` -- add route `/dashboard/seller` pointing to SellerDashboard
- `src/features/dashboard/config/navigation.ts` -- change seller mode "Dashboard" link from `/dashboard` to `/dashboard/seller`
- `src/features/seller/index.ts` -- export the new page

### Dependencies used (all already installed)
- `recharts` for charts (LineChart, BarChart)
- `framer-motion` for entry animations
- `lucide-react` for icons
- `date-fns` for relative timestamps
- `useAuth` for user name
- `useCompetitorMonitorStore` for live competitor alerts
- Existing UI components: Card, Button, Table, Badge

### Mock data
All sales/product data will be defined as constants within the file (no new data files). Competitor alerts come from the existing Zustand store.
