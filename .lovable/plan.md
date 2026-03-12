

## Store Builder Upgrade — Phased Plan

This is a large transformation. I'll break it into **4 phases** to keep each change testable and avoid breaking the existing builder.

---

### Phase 1: Standard Site ↔ E-Commerce Toggle + New E-Commerce Blocks (This implementation)

**1A. Site Mode Toggle in WebsiteBuilder header**
- Add `storeMode: "standard" | "ecommerce"` to `websiteBuilderStore.ts`
- Render a toggle switch in the top bar: `[Standard Site] ↔ [E-Commerce Store]`
- When switching to e-commerce, auto-inject e-commerce blocks (Product Grid, Cart Widget, Checkout, Reviews) if not already present
- When switching to standard, hide (not delete) e-commerce-only blocks

**1B. New Block Types (types.ts + blocks.ts)**
Add 4 new block types to the existing system:
- `product-detail` — Image carousel placeholder, variant selector (size/color badges), price display, Add to Cart button
- `shopping-cart` — Slide-out cart summary with item list, quantity controls, subtotal
- `checkout-form` — Shipping address, billing info, payment method selector (Stripe/PayPal mockup)
- `customer-reviews` — Star rating display, review cards with author/date
- `order-tracking` — Status timeline (Processing → Shipped → Delivered)

Each gets: type definition, default config, BLOCK_META entry, category "E-commerce", and HTML generation in `generateStorefrontHtml.ts`.

**1C. BlockPalette filtering**
- When `storeMode === "ecommerce"`, show all blocks
- When `storeMode === "standard"`, hide e-commerce-only blocks from the "Add" section (product-detail, shopping-cart, checkout-form, order-tracking, customer-reviews)

**1D. generateStorefrontHtml.ts updates**
- Add HTML render functions for each new block type with inline CSS
- Shopping cart renders as a floating button + slide-out panel
- Checkout form renders as a multi-field form with payment icons
- Reviews render as star-rated cards
- Order tracking renders as a horizontal timeline

---

### Phase 2: Enhanced Orders & Stock Dashboard

**Upgrade `OrdersStock.tsx`:**
- Add `status` field to orders (Pending/Shipped/Delivered) with colored badges (Yellow/Blue/Green)
- Add `stock_count` to products table, red highlight when < 5
- Add KPI cards: Total Revenue, AOV (revenue/orders), Conversion Rate (mock), Active Orders
- Add Order detail view modal
- Rename sidebar entry to "Commerce Manager"

---

### Phase 3: Connect Store Settings Modal

**New component: `ConnectStoreModal.tsx`**
- Three options: Standalone (our engine), Connect WooCommerce, Connect Shopify
- WooCommerce option: API Key + Store URL inputs + "Sync Products" button
- Shopify option: Store URL + API Key inputs
- Store selection persisted in `websiteBuilderStore`
- Accessible from Website Builder header via a "Connect Store" button

---

### Phase 4: Visual Polish

- Neon green accent for Add to Cart buttons and active e-commerce states
- Glassmorphism CSS (`backdrop-blur`, semi-transparent backgrounds) on modals and cards
- Already have mobile preview toggle — ensure new blocks render responsively

---

### Files to Create/Edit (Phase 1 — immediate implementation)

| Action | File |
|--------|------|
| Edit | `src/features/seller/components/website-builder/types.ts` — add 5 new block types + configs |
| Edit | `src/features/seller/components/website-builder/blocks.ts` — add BLOCK_META + defaults for new blocks |
| Edit | `src/stores/websiteBuilderStore.ts` — add `storeMode` state + toggle action |
| Edit | `src/features/seller/components/website-builder/WebsiteBuilder.tsx` — add toggle switch in header |
| Edit | `src/features/seller/components/website-builder/BlockPalette.tsx` — filter blocks by mode |
| Edit | `src/features/seller/components/website-builder/generateStorefrontHtml.ts` — render new block types |

No database changes needed for Phase 1 — all blocks generate static HTML preview.

