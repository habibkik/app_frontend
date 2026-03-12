

## Plan: Make Cairo the default Arabic font everywhere

**Problem**: Line 165 still sets `html[dir="rtl"]` to `'Noto Sans Arabic'`, which overrides the body-level Cairo declaration on some elements. The `html` selector has higher specificity for inherited font on elements that don't match `body`.

**Fix** (single edit in `src/index.css`):
- Change line 165 from `font-family: 'Noto Sans Arabic', 'Inter', sans-serif;` to `font-family: 'Cairo', sans-serif;`

This ensures every element in RTL mode inherits Cairo consistently, matching the body and heading rules already in place.

