
# Platform-Specific Caption Selection

## Overview
Replace the single "Load social caption" button with individual per-platform caption buttons, so users can load the exact caption generated for Instagram, LinkedIn, Facebook, etc.

## Change

**File**: `src/features/seller/components/SocialPublisher.tsx` (lines 378-385)

Replace the single social caption button with a map over all `socialCaptions` in the selected studio item, rendering one button per platform with its icon and name.

### Before
```
Load social caption  (loads first caption only)
```

### After
```
[Instagram caption] [LinkedIn caption] [Facebook caption] [TikTok caption] [Twitter/X caption]
```

Each button:
- Shows the platform emoji icon from the PLATFORMS config (matching by ID) plus "Load [Platform] caption"
- On click, sets the content textarea to that platform's caption text
- Appends hashtags (if present) as a newline-separated list below the caption
- Shows a toast confirming which platform caption was loaded

## Technical Details

- Match `socialCaption.platform` (lowercase) against `PLATFORMS[].id` to find the icon
- If hashtags exist on the caption, append them as `\n\n#tag1 #tag2 ...`
- The buttons render in a `flex gap-2 flex-wrap` container (already in place)
- No new dependencies or files needed -- single edit to lines 378-385
