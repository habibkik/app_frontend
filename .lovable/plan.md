

## Plan: Replace Demo Images in Content Studio

The current demo data uses a set of Unsplash URLs, many of which are duplicated (e.g., all 5 packshot slots use the same headphones image). The plan is to replace all 20 fallback URLs with fresh, diverse Unsplash images appropriate to each category, and also update the reference image fallback.

### Changes in `src/features/seller/components/ContentStudio.tsx`

**Replace the `fallbackUrls` map (lines 316-337)** with new unique Unsplash URLs:

- **Packshot** (5 images): Clean product-on-white / studio shots from different angles — e.g., electronics, cosmetics, or gadget photography on plain backgrounds.
- **UGC** (5 images): Authentic lifestyle/user-generated style — people using products outdoors, at home, selfies, unboxing moments.
- **Usage** (5 images): Contextual real-life scenarios — morning routine, office desk, commuting, leisure, evening wind-down.
- **Studio** (5 images): High-end commercial photography — hero shots, macro details, styled flat lays, dramatic lighting.

**Replace the reference image fallback** (line 346) with a matching new product photo.

No database or store changes needed — this is purely swapping static image URLs in the demo loader.

