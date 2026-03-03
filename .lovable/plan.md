

## Plan: AI-Powered Daily Workflow with User Validation

### Concept

Transform the static checklist into an **AI-driven workflow engine**. For each task, the user clicks "Run with AI" — the AI analyzes current outreach data and generates an actionable report/recommendation. The user reviews the AI output and clicks "Approve & Complete" to mark it done, or "Reject" to dismiss. No task is marked complete without explicit user validation.

### Architecture

```text
User clicks "▶ Run" on task
        ↓
Frontend calls edge function: POST /workflow-ai-task
  { taskId: "m1", context: { campaigns, metrics } }
        ↓
Edge function → Lovable AI (Gemini Flash)
  System prompt per task type → structured analysis
        ↓
Returns { summary, recommendations[], actions[] }
        ↓
UI shows AI result in expandable card
        ↓
User clicks "✅ Approve" or "✗ Dismiss"
        ↓
Task marked complete (localStorage persists)
```

### Files to Create

**1. `supabase/functions/workflow-ai-task/index.ts`**
- Edge function that receives a `taskId` and context data (campaign stats, supplier counts, channel performance)
- Maps each task ID to a specific AI prompt:
  - `m1` (Check inbox) → Summarize pending replies, prioritize by lead score
  - `m2` (Respond to warm leads) → Draft suggested responses for top warm leads
  - `m3` (Review analytics) → Generate analytics summary with anomalies flagged
  - `d1` (Launch sequences) → Recommend which suppliers to target today and which channels
  - `d2` (Add leads) → Suggest lead sources and segment recommendations
  - `d3` (Social engagement) → Generate engagement actions (which posts to like/comment)
  - `a1` (A/B test) → Suggest template variants based on performance data
  - `a2` (Clean contacts) → Identify candidates for cleanup with rationale
  - `a3` (Update pipeline) → Suggest pipeline stage changes
  - `w1-w3` (Weekly) → Weekly summary, channel optimization suggestions, meeting agenda
- Uses `LOVABLE_API_KEY` with `google/gemini-3-flash-preview`
- Returns structured JSON: `{ summary: string, recommendations: string[], suggestedActions: { label: string, detail: string }[] }`
- Handles 429/402 errors gracefully

**2. Rewrite `src/components/outreach/DailyWorkflowChecklist.tsx`**

New UI per task item:
- **Idle state**: Task name + description + "▶ Run AI" button (replaces simple checkbox)
- **Loading state**: Skeleton/spinner with "AI analyzing..." text
- **Result state**: Expandable card showing:
  - AI summary paragraph
  - Bullet list of recommendations
  - Suggested actions as small action chips
  - Two buttons: "✅ Approve & Complete" (marks done) and "✗ Dismiss" (closes result, task stays pending)
- **Completed state**: Green check, strikethrough, shows "Approved" badge with timestamp
- Users can still manually check off tasks without AI (small "Skip" link)
- Progress bar, streak counter, and time remaining persist as-is
- AI results stored in component state (not persisted — fresh each day)

### Files to Edit

**3. `src/pages/dashboard/OutreachHub.tsx`**
- Pass campaign data to `DailyWorkflowChecklist` as props so AI has context to analyze
- Add props: `campaigns`, `rules` from the outreach store

**4. `supabase/config.toml`** — won't edit directly (auto-managed), but the edge function needs `verify_jwt = false`

### Data Flow

The checklist component will build a context object from props:
```typescript
const aiContext = {
  totalCampaigns: campaigns.length,
  draftCount: campaigns.filter(c => c.status === "draft").length,
  sentCount: campaigns.filter(c => c.status === "sent" || c.status === "approved").length,
  responsesReceived: campaigns.filter(c => c.response_received).length,
  channelBreakdown: { email: X, linkedin: Y, ... },
  topSuppliers: [...first 5 supplier names],
};
```

This context is sent to the edge function along with the task ID, giving the AI real data to analyze.

### Implementation Order
1. Create edge function `workflow-ai-task`
2. Rewrite `DailyWorkflowChecklist.tsx` with AI integration + validation UI
3. Update `OutreachHub.tsx` to pass campaign data as props

