
## Add Editable Templates Section to Website Builder

### Overview
Convert templates from static custom HTML into block-based, editable starting points, and add a "Templates" button in the editor toolbar so users can switch templates anytime.

### What Changes

**1. Convert Evolu E-Bike template from custom HTML to blocks**
Currently the Evolu template uses a raw HTML string which disables the block palette and configurator. Instead, it will be converted to use pre-configured blocks (hero, about, testimonials, contact, etc.) with Evolu-specific content, plus the Evolu theme colors. This makes it fully editable via blocks and the "Add Section" feature.

**2. Add a "Templates" button in the editor top bar**
A new button (with a LayoutTemplate icon) will appear next to the Theme button. Clicking it opens a dialog showing all available templates. Selecting one replaces the current blocks and theme (with a confirmation warning).

**3. Remove the `customHtml` concept**
Since all templates will now be block-based, the `customHtml` field and the logic that hides block palette/configurator will be removed. The block palette and configurator will always be visible.

### Technical Details

**File: `src/features/seller/components/website-builder/templates.ts`**
- Remove the `EVOLU_CUSTOM_HTML` string
- Remove `customHtml` from the `WebsiteTemplate` interface
- Convert the Evolu template to use pre-configured blocks array with Evolu-specific content (hero title "Future of E-Bike", about content about engineering, testimonials from riders, FAQ about the bike, contact form)
- Keep the Evolu theme (lime green `#C7FF2F`, dark/light scheme, Space Grotesk font)
- Add 2-3 more block-based templates (e.g., "Minimalist Store", "Bold Showcase") with different block configurations and themes

**File: `src/features/seller/components/website-builder/WebsiteBuilder.tsx`**
- Add a "Templates" button in the toolbar (between Theme and Save)
- Add state `showTemplateDialog` to toggle a template selection dialog
- In the dialog, render the `TemplatePicker` component
- Modify `handleTemplateSelect` to: set blocks from template, set theme, set siteConfig, clear `customHtml` to null, close dialog
- Remove the `isCustomTemplate` variable and the conditional hiding of BlockPalette/BlockConfigurator -- they will always show
- Keep the initial template picker screen for first-time users (when `!store.templateChosen`)

**File: `src/features/seller/components/website-builder/TemplatePicker.tsx`**
- No major changes needed -- it already renders template cards and calls `onSelect`

**File: `src/stores/websiteBuilderStore.ts`**
- Keep `customHtml` field for backward compat but it will always be `null` for new templates
- Update `loadFromDb` to handle legacy sites that might have `customHtml`

**File: `src/features/seller/components/website-builder/types.ts`**
- No changes needed

**File: `src/features/seller/components/website-builder/blocks.ts`**
- No changes needed (already has `createDefaultBlock` for all block types)

### New Templates (all block-based)

1. **Evolu E-Bike** -- Hero ("Future of E-Bike"), About (smart engineering), Testimonials (3 rider quotes), FAQ (battery/warranty), Contact
2. **Minimalist Store** -- Hero (clean minimal), Product Catalog (3 cols), About, Contact
3. **Bold Showcase** -- Hero (bold CTA), Product Catalog (2 cols), Testimonials, Social Proof, Order Form
4. **Blank Canvas** -- Default blocks (already exists)
