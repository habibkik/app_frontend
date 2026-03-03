

## Plan: Add Description Field to Image Upload

### What
Add an optional text description/context field to the Universal Image Upload component. After the user selects an image, a textarea appears where they can describe the product (e.g., "stainless steel industrial valve, DN50, PN16"). This description is passed as `additionalContext` to the AI analysis APIs to improve accuracy.

### Changes

**Edit `src/components/shared/UniversalImageUpload.tsx`**:
1. Add a `productDescription` state variable
2. After the image preview (before the analyze button), insert a `Textarea` with a placeholder like "Describe your product to improve results (e.g., material, size, specifications...)"
3. Pass `productDescription` as `additionalContext` in the analysis request object sent to all three mode APIs
4. Clear the description when the image is cleared

The textarea will appear in the preview state (after image is selected, before analysis starts), sitting between the image and the action buttons. It will be optional — users can still analyze with just an image.

