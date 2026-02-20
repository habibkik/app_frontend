

## Website Builder -- Connected to All Existing Features

Transform the placeholder Website Builder page into a functional block-based storefront editor that pulls data from every major system: Products, Content Studio, Market Intelligence, Landing Page themes, and Order Forms.

### Architecture Overview

The Website Builder will be a **block-based page editor** where users compose a storefront from pre-built sections. Rather than building a drag-and-drop visual editor from scratch (which would be extremely complex), we build a **template-driven configurator** with live preview -- similar to the existing Landing Page tab in Content Studio but elevated to a full multi-page storefront.

### Data Connections

| Source | What it provides |
|--------|-----------------|
| `products` table | Product catalog grid with name, price, image, description |
| `analysisStore` (sellerResults) | Market intelligence: pricing recommendations, competitor insights, demand trends |
| `contentStudioStore` | Generated images, social posts, email campaigns, content scores |
| `landing_page_themes` table | Saved theme templates for consistent branding |
| `content_orders` table | Order form submissions (reuses existing OrderForm component) |
| `scheduled_posts` table | Social proof: recent post activity count |
| Content Studio's `buildLandingPageHtml` | Reuses the HTML builder pattern for storefront generation |

### What Gets Built

**1. Website Builder Store** (`src/stores/websiteBuilderStore.ts`)
- Zustand store holding: site config (name, tagline, logo URL), selected theme, enabled blocks with order, per-block settings
- Block types: `hero`, `product-catalog`, `about`, `testimonials`, `faq`, `contact`, `order-form`, `social-proof`, `market-stats`
- Persistence via Zustand persist middleware (localStorage)

**2. Database Table: `websites`**
- Stores published website configurations per user
- Columns: `id`, `user_id`, `name`, `slug`, `config_json` (JSONB -- full block config), `theme_json` (JSONB), `published_html`, `is_published`, `created_at`, `updated_at`
- RLS: All operations scoped to `auth.uid() = user_id`
- Trigger: `update_updated_at_column` on update

**3. Main Page Component** (`src/pages/dashboard/WebsiteBuilder.tsx`)
- Replace the placeholder with full `DashboardLayout` + `WebsiteBuilder` component
- Header with site name, save/publish buttons

**4. Website Builder Component** (`src/features/seller/components/website-builder/WebsiteBuilder.tsx`)
- Three-panel layout:
  - Left sidebar: Block palette (available blocks to add)
  - Center: Live HTML preview in iframe (desktop/mobile toggle)
  - Right sidebar: Block settings for the selected block
- Top bar: Site name input, theme selector (reuses `landing_page_themes`), Save Draft, Publish buttons

**5. Block System**
- Each block type has a config interface and an HTML renderer
- Blocks file: `src/features/seller/components/website-builder/blocks.ts`
  - `hero`: Title, subtitle, CTA text, background image (pulls from Content Studio generated images)
  - `product-catalog`: Auto-pulls from `products` table, displays grid with name, image, price
  - `about`: Editable rich text (textarea), optional image
  - `testimonials`: Uses competitor differentiation data from `analysisStore` as social proof
  - `faq`: Reuses FAQ data structure from Content Studio landing page
  - `contact`: Name, email, phone, message form
  - `order-form`: Embeds the existing `OrderForm` component's HTML output
  - `social-proof`: Shows post count, engagement stats from `scheduled_posts`
  - `market-stats`: Displays market price range, demand trend, competitor count from `analysisStore`

**6. Block Configurator Panel** (`src/features/seller/components/website-builder/BlockConfigurator.tsx`)
- Dynamic form that changes based on selected block type
- Hero: edit title, subtitle, CTA, pick image from Content Studio
- Product Catalog: toggle columns (2/3/4), show/hide price, filter by category
- About: textarea for content
- Each config change triggers live preview rebuild

**7. Block Palette** (`src/features/seller/components/website-builder/BlockPalette.tsx`)
- List of available block types with icons and descriptions
- Click to add, drag to reorder (reuses the drag pattern from LandingPageTab)
- Toggle blocks on/off, delete blocks

**8. HTML Generator** (`src/features/seller/components/website-builder/generateStorefrontHtml.ts`)
- Takes site config + blocks + theme + products data
- Produces self-contained HTML with inline CSS (same pattern as `buildLandingPageHtml`)
- Includes SEO meta tags (title, description, Open Graph)
- Mobile-responsive CSS
- Embeds product catalog with images and prices
- Includes order form HTML with action pointing to a future endpoint

**9. Theme Integration**
- Reuses `LandingPageTheme` type and `LandingPageCustomizer` component
- Loads saved themes from `landing_page_themes` table
- Theme applies to all blocks consistently

**10. Publish Flow**
- Save draft: Upserts to `websites` table (config_json + theme_json)
- Publish: Generates final HTML, uploads to `landing-pages` storage bucket, updates `published_html` and `is_published` in DB
- Shows published URL with copy button (reuses pattern from LandingPageTab)

### Files to Create

| File | Purpose |
|------|---------|
| `src/stores/websiteBuilderStore.ts` | Zustand store for site config, blocks, and editor state |
| `src/features/seller/components/website-builder/WebsiteBuilder.tsx` | Main builder component with 3-panel layout |
| `src/features/seller/components/website-builder/BlockPalette.tsx` | Available blocks sidebar |
| `src/features/seller/components/website-builder/BlockConfigurator.tsx` | Right-panel block settings editor |
| `src/features/seller/components/website-builder/blocks.ts` | Block type definitions, default configs, and HTML renderers |
| `src/features/seller/components/website-builder/generateStorefrontHtml.ts` | Full HTML generator combining blocks + theme + data |
| `src/features/seller/components/website-builder/types.ts` | Types for blocks, site config, editor state |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/dashboard/WebsiteBuilder.tsx` | Replace placeholder with DashboardLayout + WebsiteBuilder |
| `src/features/seller/index.ts` | Export WebsiteBuilder components |

### Database Changes

New table `websites`:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | NOT NULL |
| name | text | NOT NULL, default 'My Store' |
| slug | text | NOT NULL |
| config_json | jsonb | NOT NULL, default '{}' -- blocks, order, per-block settings |
| theme_json | jsonb | NOT NULL, default '{}' -- LandingPageTheme |
| published_html | text | Nullable -- last published HTML |
| is_published | boolean | NOT NULL, default false |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

RLS policies: SELECT, INSERT, UPDATE, DELETE all scoped to `auth.uid() = user_id`.
Trigger: `update_updated_at_column` on UPDATE.

### Technical Details

**Block Data Flow:**

```text
Products DB ──┐
              ├──> generateStorefrontHtml() ──> iframe srcDoc
analysisStore ┤                                    │
              ├──> (theme from landing_page_themes) │
contentStore ─┘                                    │
                                                   ▼
                                            Publish to Storage
                                                   │
                                                   ▼
                                            Save to websites table
```

**Product Catalog Block:**
- Fetches products from Supabase `products` table on mount
- Renders a responsive grid with product cards (image, name, price)
- Configurable: columns count, show/hide price, category filter

**Live Preview Rebuild:**
- Every config/block/theme change calls `generateStorefrontHtml()` 
- Debounced at 300ms to avoid excessive rebuilds
- Result set as `srcDoc` on the preview iframe

**Save/Load Workflow:**
- On mount, check `websites` table for existing site by user_id
- If found, load config_json and theme_json into store
- Save button upserts to the table
- Publish button generates HTML, uploads to storage, updates DB

### Implementation Order

1. Create database table `websites` with RLS
2. Create types and block definitions
3. Create the Zustand store
4. Create the HTML generator
5. Build BlockPalette and BlockConfigurator components
6. Build the main WebsiteBuilder component
7. Update the page file and exports
8. Test end-to-end

