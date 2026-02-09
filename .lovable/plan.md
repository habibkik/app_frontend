

## Content Studio Gap Analysis and Enhancement Plan

### Already Implemented (No Changes Needed)
- Input panel (sticky left) with product selector, image preview, audience, content type checkboxes, tone, generate button with loading state
- All 5 tabs (Headlines, Copy, Description, Email, Social)
- Headlines: 5 cards with copy, like/unlike heart, regenerate, "Use in Ad"
- Copy: 3 variants (short/medium/long) with character count, edit/save, copy, "Use in Facebook Ad"
- Descriptions: 3 variants with features/benefits badges, edit/save, copy, "Use on Website", "Use on Amazon/OLX"
- Email: 3 subject lines, email body, preview dialog, send test button
- Social: Platform-branded cards (Instagram, TikTok, Facebook, LinkedIn, Twitter/X) with character counts, copy, "Post Directly"
- History section (collapsible) with thumbnails, product name, date, delete
- Action bar: Save as Template, Load Template, Export ZIP, Share
- AI generation via edge function (generate-marketing-content)
- Template save/load/delete via content_templates table

### Missing Features to Add

#### 1. Social Tab - Display Hashtags and Extras
Currently hashtag data exists in the social caption objects but is not rendered in the UI. Same for TikTok sound suggestions.
- **Instagram**: Render hashtag pills/badges below caption
- **TikTok**: Render hashtags + "Suggested Sounds" section
- **Facebook**: Show engagement question separately
- **LinkedIn**: Show CTA separately
- **Twitter/X**: Show hashtag badge

#### 2. Email Tab - Edit Capability
The email body currently has no edit toggle (unlike Copy and Description tabs which do). Add:
- Edit button that switches body to a Textarea
- Save button to confirm edits
- Subject line inline editing

#### 3. History - Restore/Preview Action
History items currently only show metadata with a delete button. Add:
- "Restore" button that loads the full generated content back into the output panel
- This requires storing the full `GeneratedContent` object in history items (currently only stores metadata)

#### 4. Real Export ZIP Functionality
Currently `handleExportZip` just shows a toast. Implement actual client-side ZIP generation:
- Bundle all generated content (headlines, copy, descriptions, email, social) into text files
- Use Blob API to create a downloadable ZIP-like bundle (or a single JSON/text file since adding a ZIP library is heavy)
- Alternatively, export as a structured `.json` file that can be re-imported

#### 5. Mobile Responsive Tab List
The 5-column tab grid can overflow on small screens. Wrap the TabsList for mobile using `flex-wrap` or horizontal scroll.

### Technical Details

**Files to modify:**
- `src/features/seller/components/ContentStudio.tsx` - All UI enhancements

**Changes by section:**

1. **Social Tab (~lines 1110-1161)**: After each caption, add a section rendering `social.hashtags` as Badge components. For TikTok, if sounds data exists in the AI response, render a "Suggested Sounds" list.

2. **Email Tab (~lines 1046-1104)**: Add edit state tracking for email body (reuse existing `editingStates`/`editedTexts` pattern). Add Edit/Save toggle button next to the body section.

3. **History Items (~lines 99-106, 470-478, 1183-1206)**: Extend `ContentHistoryItem` interface to include `content: GeneratedContent`. Store the full content when adding to history. Add a "Restore" button on each history card that calls `setGeneratedContent(item.content)`.

4. **Export ZIP (~line 576-578)**: Replace stub with real logic that serializes `generatedContent` to a formatted text/JSON file and triggers a browser download via `Blob` + `URL.createObjectURL`.

5. **TabsList (~line 793)**: Change from `grid-cols-5` to responsive: `flex flex-wrap` or `grid grid-cols-3 sm:grid-cols-5` for mobile.

**No new dependencies required** - all changes use existing UI components and browser APIs.

