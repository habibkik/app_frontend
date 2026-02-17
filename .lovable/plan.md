
# Fix Broken Translation Keys: Restructure JSON Nesting

## Problem
All page-level translations (suppliers, componentSupply, heatMap, feasibility, conversations, competitors, savedSuppliers, analytics, gtm, imageUpload, notifications, profileSection, security, apiKeys, emailIntegration, messaging, socialMedia) are incorrectly nested **inside** the root-level `componentSupply` key.

The code references them as `t("pages.componentSupply.title")`, `t("pages.suppliers.title")`, etc., but there is **no `"pages"` key** in the JSON. This means every `t("pages.xxx")` call returns the raw key string instead of the translated value -- which is exactly what you're seeing.

### Current JSON structure (broken):
```text
{
  "componentSupply": {          <-- root level
    "qty": "Qty",               <-- flat keys (used as componentSupply.qty - these work)
    "selected": "Selected",
    ...
    "noTeamInfo": "...",
    "suppliers": {              <-- WRONG: nested inside componentSupply
      "title": "Suppliers"      <-- actual path: componentSupply.suppliers.title
    },
    "componentSupply": {        <-- WRONG: nested inside itself
      "title": "Components"     <-- actual path: componentSupply.componentSupply.title
    },
    "savedSuppliers": { ... },
    "heatMap": { ... },
    ... (all page sections)
  }
}
```

### Required JSON structure (fixed):
```text
{
  "componentSupply": {
    "qty": "Qty",
    "selected": "Selected",
    ...
    "noTeamInfo": "..."
  },
  "pages": {                    <-- NEW top-level key
    "suppliers": {
      "title": "Suppliers"      <-- path: pages.suppliers.title (matches code!)
    },
    "componentSupply": {
      "title": "Components"     <-- path: pages.componentSupply.title (matches code!)
    },
    "savedSuppliers": { ... },
    "heatMap": { ... },
    ... (all page sections)
  }
}
```

## Fix (all 4 locale files)

For each file (`en.json`, `fr.json`, `es.json`, `ar.json`):

1. After the last flat key inside `componentSupply` (`"noTeamInfo": "..."`), close the `componentSupply` object with `},`
2. Open a new `"pages": {` key
3. Keep all the nested page sections (`suppliers`, `componentSupply`, `heatMap`, `feasibility`, `conversations`, `competitors`, `savedSuppliers`, `analytics`, `gtm`, `imageUpload`, `supplierModals`, `placeholder`, `mapbox`, `notifications`, `profileSection`, `security`, `apiKeys`, `emailIntegration`, `messaging`, `socialMedia`) inside `pages`
4. Close `pages` with `}`

### Lines affected per file:
- **en.json**: Line 1611 -- insert `},` + `"pages": {` between `noTeamInfo` and `suppliers`
- **fr.json, es.json, ar.json**: Line 1600 -- same change

This is a 2-line insertion per file (8 lines total). No keys, values, or code changes needed.

## Technical Details
- Only 4 files modified: `src/i18n/locales/en.json`, `fr.json`, `es.json`, `ar.json`
- Change is purely structural: closing one brace and opening a new parent key
- All existing translation values remain exactly the same
- All component code (`t("pages.xxx.yyy")`) will immediately resolve correctly
- The flat `componentSupply.*` keys (like `componentSupply.qty`) continue to work as before
