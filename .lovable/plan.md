

## Content Studio - Missing Features Plan

### Current Status
The ContentStudio component already implements ~95% of the requirements. The following gaps remain:

### Missing Feature 1: Landing Page Copy Tab
The "Landing page copy" checkbox exists in content types but there is no corresponding tab or generated content for it. This is the largest gap.

**What to add:**
- A 6th tab "Landing" after Social
- Generated landing page content sections: Hero headline + subheadline, value proposition block, feature highlights, testimonials placeholder, CTA section
- Edit/copy buttons matching the pattern of other tabs
- Update the `GeneratedContent` interface to include `landingPage` data
- Update `generateMockContent` fallback to include landing page content
- Map AI response to landing page format (or generate from existing content)

### Missing Feature 2: Functional "Post Directly" Button
The "Post Directly" button on each Social platform card currently does nothing. It should navigate to the Social Publisher page.

**What to add:**
- Import `useNavigate` from react-router-dom
- On click, navigate to `/dashboard/social-publisher` (or the correct route)

### Missing Feature 3: Functional "Use in Ad" / "Use in Facebook Ad" Buttons
These buttons on Headlines and Copy tabs are non-functional stubs.

**What to add:**
- Copy the text to clipboard and show a toast indicating it's ready to paste into an ad campaign
- Optionally navigate to the Campaigns page with the text pre-loaded

### Missing Feature 4: Description Tab - Benefits Badges
Features are displayed as badges but benefits are not shown, even though the data exists.

**What to add:**
- Render `desc.benefits` as badges alongside features, with a different color variant to distinguish them

### Technical Details

**File to modify:** `src/features/seller/components/ContentStudio.tsx`

**Changes:**

1. **New interface + state** (~line 112-118): Add `landingPage` field to `GeneratedContent`:
   ```
   landingPage: {
     heroHeadline: string;
     heroSubheadline: string;
     valueProposition: string;
     featureHighlights: string[];
     ctaText: string;
   } | null;
   ```

2. **Mock content** (~line 150-262): Add `landingPage` section to `generateMockContent`.

3. **AI mapping** (~line 391-455): Map AI response to landing page format (derive from descriptions + headlines if no dedicated AI field).

4. **Tabs** (~line 861-867): Add `<TabsTrigger value="landing">Landing</TabsTrigger>`.

5. **New TabsContent for Landing** (after Social tab ~line 1313): Render landing page sections with hero, value prop, features list, and CTA -- each with copy/edit buttons.

6. **"Post Directly" button** (~line 1303-1306): Add `onClick` handler using `useNavigate` to route to Social Publisher.

7. **"Use in Ad" button** (~line 910-912): Add `onClick` to copy headline text and show toast.

8. **"Use in Facebook Ad" button** (~line 986-989): Add `onClick` to copy ad copy text and show toast.

9. **Benefits badges** (~line 1012-1018): After features badges, render benefits with `variant="outline"` in a different style (e.g., green-tinted).

**No new dependencies required.** All changes use existing components and react-router-dom (already installed).

