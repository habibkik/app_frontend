## **Plan: Enhanced Outreach Hub — Full Implementation Spec**

### **Context & Goal**

We are upgrading the existing Outreach Hub to match a professional-grade multi-channel outreach platform. The hub already has basic campaign management, sequence templates, automation rules, and metrics. This enhancement adds **6 major features** to close the gaps: conversion funnel analytics, compliance guidance, daily workflow management, lead scoring, advanced automation triggers, and a message template library. Every component must be **fully functional, visually polished, responsive, and use our existing design system (shadcn/ui + Tailwind CSS + Lucide icons).**

---

### **EXISTING FOUNDATION (Do NOT break or remove)**

```
text
```

```
✅ Multi-channel campaigns (Email, WhatsApp, LinkedIn, Instagram, Facebook, Twitter/X, SMS, Telegram)
✅ Campaign objectives (6 types) & supplier tiers (A/B/C)
✅ Sequence templates & timeline builder
✅ Channel strategy guide & psychology triggers
✅ Automation rules (product/channel/interval based)
✅ Metrics dashboard (KPIs, performance table)
✅ History tab with response tracking
```

---

### **ENHANCEMENT 1: Conversion Funnel & Channel Analytics**

**File to Edit:** `src/components/outreach/OutreachMetricsDashboard.tsx`

**1A — Visual Conversion Funnel**  
Add a horizontal or vertical funnel visualization at the top of the Metrics tab showing these stages with counts AND conversion percentages between each stage:

```
TypeScript
```

```
const funnelStages = [
  { stage: "Total Leads", count: 2500, icon: Users, color: "bg-blue-500" },
  { stage: "Messages Sent", count: 2100, icon: Send, color: "bg-indigo-500" },
  { stage: "Opened / Seen", count: 1470, icon: Eye, color: "bg-purple-500" },
  { stage: "Replied", count: 420, icon: MessageSquare, color: "bg-amber-500" },
  { stage: "Meeting Booked", count: 105, icon: Calendar, color: "bg-orange-500" },
  { stage: "Converted / Won", count: 42, icon: Trophy, color: "bg-green-500" },
];
```

- Render as **tapered horizontal bars** (widest at top, narrowest at bottom) OR as connected chevron shapes
- Between each stage show the **drop-off percentage** (e.g., "84% sent rate", "70% open rate", "28.6% reply rate")
- Each bar should have a subtle gradient and the count displayed prominently
- Add a small tooltip or hover card on each stage showing: "vs. last month: +12%" (use mock delta data)
- Make the funnel responsive — stacks vertically on mobile

**1B — Per-Channel Performance Breakdown**  
Below the funnel, add a **grouped bar chart** (use Recharts, already in project) showing per-channel metrics:

```
TypeScript
```

```
const channelPerformance = [
  { channel: "Email", sent: 800, opened: 560, replied: 120, meetings: 30, color: "#3B82F6" },
  { channel: "WhatsApp", sent: 450, opened: 420, replied: 145, meetings: 38, color: "#22C55E" },
  { channel: "LinkedIn", sent: 350, opened: 280, replied: 85, meetings: 22, color: "#0A66C2" },
  { channel: "Instagram", sent: 200, opened: 160, replied: 40, meetings: 8, color: "#E4405F" },
  { channel: "SMS", sent: 180, opened: 170, replied: 20, meetings: 5, color: "#8B5CF6" },
  { channel: "Facebook", sent: 80, opened: 50, replied: 8, meetings: 2, color: "#1877F2" },
  { channel: "Twitter/X", sent: 30, opened: 18, replied: 2, meetings: 0, color: "#000000" },
  { channel: "Telegram", sent: 10, opened: 8, replied: 0, meetings: 0, color: "#26A5E4" },
];
```

- Use a `<BarChart>` with grouped bars (Sent, Opened, Replied, Meetings) per channel
- Add a legend at the top
- Include a **"Best Performing Channel"** badge/highlight on the channel with highest reply rate
- Add a toggle to switch between **absolute numbers** and **percentage rates**

**1C — A/B Test Performance Indicator**  
Add a card section titled "Message Performance Insights":

```
TypeScript
```

```
const messagePerformance = [
  { variant: "Template A - Pain Point Lead", subject: "Struggling with supply chain delays?", openRate: 72, replyRate: 18, channel: "Email", status: "winner" },
  { variant: "Template B - Social Proof Lead", subject: "How [Company] cut costs by 40%", openRate: 65, replyRate: 22, channel: "Email", status: "winner" },
  { variant: "Template C - Direct Ask", subject: "Quick question about your sourcing", openRate: 58, replyRate: 12, channel: "Email", status: "underperforming" },
  { variant: "WhatsApp - Casual Intro", subject: "Hey! Quick question 👋", openRate: 94, replyRate: 35, channel: "WhatsApp", status: "winner" },
  { variant: "LinkedIn - Connection Note", subject: "Noticed your work in...", openRate: 45, replyRate: 28, channel: "LinkedIn", status: "testing" },
];
```

- Display as **cards in a grid** (2-3 columns)
- Each card shows: template name, channel badge, open rate gauge, reply rate gauge
- Status badge: 🏆 "Winner" (green), ⚠️ "Testing" (amber), 🔻 "Underperforming" (red)
- Add a "Recommendation" line: e.g., "Use Template B for Email — 22% reply rate, +83% above average"

---

### **ENHANCEMENT 2: Compliance & Best Practices Panel**

**File to Create:** `src/components/outreach/ComplianceBestPractices.tsx`

Create a **collapsible/accordion panel** to be placed on the Campaigns tab (above or below the campaign list). Use `<Collapsible>` or `<Accordion>` from shadcn/ui.

**Structure:**

```
TypeScript
```

```
const complianceSections = [
  {
    title: "📧 Email Compliance",
    icon: Mail,
    rules: [
      { rule: "CAN-SPAM Act (US)", description: "Must include physical address, unsubscribe link, honest subject lines. Violations: up to $46,517 per email.", severity: "critical" },
      { rule: "GDPR (EU/UK)", description: "Requires explicit consent or legitimate interest. Right to erasure. Must have privacy policy.", severity: "critical" },
      { rule: "CASL (Canada)", description: "Express or implied consent required. Must identify sender clearly.", severity: "high" },
      { rule: "Domain Warm-up", description: "New domains: start with 20 emails/day, increase by 10-20% daily over 2-4 weeks. Use warm-up tools.", severity: "recommended" },
    ]
  },
  {
    title: "📱 WhatsApp Compliance",
    icon: MessageCircle,
    rules: [
      { rule: "Opt-in Required", description: "Users must explicitly opt-in before receiving messages. No cold messaging on WhatsApp Business API.", severity: "critical" },
      { rule: "Template Approval", description: "Marketing templates must be approved by Meta before sending. Allow 24-48 hours.", severity: "high" },
      { rule: "24-Hour Window", description: "Free-form messages only within 24 hours of user's last message. Outside: use approved templates only.", severity: "critical" },
      { rule: "Quality Rating", description: "Maintain high quality rating. Too many blocks/reports = restricted.", severity: "high" },
    ]
  },
  {
    title: "💼 LinkedIn Compliance",
    icon: Linkedin,
    rules: [
      { rule: "Connection Limit", description: "Maximum ~100 connection requests per week. Exceeding triggers restrictions or account ban.", severity: "critical" },
      { rule: "Message Limit", description: "InMail: 50/month (Premium). Regular messages: unlimited to connections only.", severity: "high" },
      { rule: "Profile View Limit", description: "~80-150 profile views per day on Sales Navigator. Pace throughout the day.", severity: "recommended" },
      { rule: "No Automation Detection", description: "LinkedIn actively detects automation tools. Use human-like delays (30-90 sec between actions).", severity: "critical" },
    ]
  },
  {
    title: "📸 Instagram & Facebook",
    icon: Instagram,
    rules: [
      { rule: "DM Limits", description: "New accounts: 20-30 DMs/day. Established: 50-80/day. Exceeding triggers temp ban.", severity: "high" },
      { rule: "ManyChat Compliance", description: "Automated DMs must be triggered by user action (comment, keyword). No unsolicited bulk DMs.", severity: "critical" },
      { rule: "Content Guidelines", description: "No misleading claims, no engagement bait that violates community guidelines.", severity: "high" },
    ]
  },
  {
    title: "📲 SMS Compliance",
    icon: Phone,
    rules: [
      { rule: "TCPA (US)", description: "Prior express written consent required. Must include opt-out. Violations: $500-$1,500 per message.", severity: "critical" },
      { rule: "10DLC Registration", description: "US SMS requires 10DLC campaign registration. Unregistered numbers get filtered.", severity: "critical" },
    ]
  },
];
```

**Best Practices Badges Section** — Below the compliance accordion, add a grid of **best practice cards** with status indicators:

```
TypeScript
```

```
const bestPractices = [
  { practice: "Personalize 20%+ of message", icon: UserCheck, status: "active", tip: "Use first name, company name, recent activity, or mutual connection in every message" },
  { practice: "Warm up email domains", icon: Flame, status: "active", tip: "Use Instantly or Warmbox to warm domains for 2-4 weeks before outreach" },
  { practice: "Mobile-friendly content", icon: Smartphone, status: "active", tip: "Keep subject lines <40 chars, preview text <90 chars, single CTA" },
  { practice: "Send at optimal times", icon: Clock, status: "active", tip: "Email: Tue-Thu 8-10am. WhatsApp: 10am-12pm. LinkedIn: 7-9am" },
  { practice: "A/B test everything", icon: FlaskConical, status: "active", tip: "Test subject lines, opening lines, CTAs. Minimum 50 sends per variant" },
  { practice: "Follow up 4-7 times", icon: Repeat, status: "active", tip: "80% of deals close after 5+ touchpoints. Space 2-4 days apart." },
  { practice: "Multi-channel approach", icon: Layers, status: "active", tip: "Use 3+ channels per prospect. Email + LinkedIn + WhatsApp = highest conversion." },
  { practice: "Clean list monthly", icon: Trash2, status: "warning", tip: "Remove bounced emails, disconnected numbers, unresponsive leads every 30 days" },
];
```

- Each badge should be a small card with icon, practice name, status dot (green=active, amber=needs attention), and expandable tip on click
- Make the entire panel visually distinctive with a **subtle blue/indigo border or background** to signal "reference material"

---

### **ENHANCEMENT 3: Daily Workflow Checklist**

**File to Create:** `src/components/outreach/DailyWorkflowChecklist.tsx`

Create an **interactive daily checklist** component, placed on the Campaigns tab (as a collapsible side panel or top section).

**Data Structure:**

```
TypeScript
```

```
interface ChecklistItem {
  id: string;
  task: string;
  description: string;
  timeBlock: "morning" | "midday" | "afternoon" | "weekly";
  icon: LucideIcon;
  priority: "high" | "medium" | "low";
  estimatedMinutes: number;
}

const dailyChecklist: ChecklistItem[] = [
  // MORNING BLOCK
  { id: "m1", task: "Check unified inbox for replies", description: "Review all channel inboxes — prioritize warm leads and time-sensitive replies", timeBlock: "morning", icon: Inbox, priority: "high", estimatedMinutes: 15 },
  { id: "m2", task: "Respond to warm leads", description: "Reply within 5 minutes to any interested prospects. Speed = conversion.", timeBlock: "morning", icon: Zap, priority: "high", estimatedMinutes: 20 },
  { id: "m3", task: "Review analytics dashboard", description: "Check open rates, reply rates, bounce rates. Flag any anomalies.", timeBlock: "morning", icon: BarChart3, priority: "medium", estimatedMinutes: 10 },

  // MIDDAY BLOCK
  { id: "d1", task: "Launch new outreach sequences", description: "Start today's batch of new sequences across all active channels.", timeBlock: "midday", icon: Rocket, priority: "high", estimatedMinutes: 20 },
  { id: "d2", task: "Add new leads to database", description: "Import new leads from Apollo, LinkedIn, referrals. Verify emails.", timeBlock: "midday", icon: UserPlus, priority: "medium", estimatedMinutes: 25 },
  { id: "d3", task: "Social media engagement", description: "Like, comment, share posts from prospects on LinkedIn/Instagram/Twitter. Build visibility.", timeBlock: "midday", icon: Heart, priority: "medium", estimatedMinutes: 15 },

  // AFTERNOON BLOCK
  { id: "a1", task: "A/B test new message templates", description: "Create variants of top-performing templates. Change subject lines, CTAs, or opening hooks.", timeBlock: "afternoon", icon: FlaskConical, priority: "medium", estimatedMinutes: 20 },
  { id: "a2", task: "Clean bounced & invalid contacts", description: "Remove hard bounces, invalid WhatsApp numbers, and disconnected LinkedIn profiles.", timeBlock: "afternoon", icon: Trash2, priority: "low", estimatedMinutes: 15 },
  { id: "a3", task: "Update CRM pipeline", description: "Move leads through stages. Update notes, next actions, and lead scores.", timeBlock: "afternoon", icon: KanbanSquare, priority: "medium", estimatedMinutes: 15 },

  // WEEKLY BLOCK
  { id: "w1", task: "Review weekly performance metrics", description: "Compare this week vs last. Identify winning channels, templates, and segments.", timeBlock: "weekly", icon: TrendingUp, priority: "high", estimatedMinutes: 30 },
  { id: "w2", task: "Optimize underperforming channels", description: "Pause or adjust channels with <5% reply rate. Reallocate budget to winners.", timeBlock: "weekly", icon: Settings, priority: "high", estimatedMinutes: 25 },
  { id: "w3", task: "Team sync meeting", description: "Share insights, blockers, and wins. Align on next week's outreach focus.", timeBlock: "weekly", icon: Users, priority: "high", estimatedMinutes: 30 },
];
```

**UI Requirements:**

- Group tasks by time block with visual headers: 🌅 Morning, ☀️ Midday, 🌇 Afternoon, 📅 Weekly
- Each task is a **checkbox card** — when checked, it gets a strikethrough + green check + subtle fade
- Show **progress bar** at the top: "6/12 tasks completed today (50%)"
- Show **estimated time remaining**: "~1h 45min remaining"
- **Persist state in localStorage** with key `outreach-checklist-${YYYY-MM-DD}` — resets daily automatically
- Weekly tasks persist with key `outreach-checklist-week-${week-number}`
- Add a **"Reset Day"** button and a **streak counter** ("🔥 5-day streak!")
- Priority indicators: 🔴 High, 🟡 Medium, 🟢 Low (small dot next to task)
- Responsive — single column on mobile

---

### **ENHANCEMENT 4: Lead Scoring on Supplier Cards**

**File to Edit:** `src/components/outreach/OutreachSupplierDiscoveryCard.tsx`

**Add a computed lead priority score** to each supplier card:

```
TypeScript
```

```
function calculateLeadScore(supplier: Supplier): { score: number; label: string; color: string } {
  let score = 0;

  // Rating (0-25 points)
  score += (supplier.rating / 5) * 25;

  // Certifications (0-20 points)
  score += Math.min(supplier.certifications?.length * 5, 20);

  // AI Discovered flag (15 points)
  if (supplier.isAIDiscovered) score += 15;

  // Response history (0-20 points)
  if (supplier.lastResponseTime === "within_1h") score += 20;
  else if (supplier.lastResponseTime === "within_24h") score += 12;
  else if (supplier.lastResponseTime === "within_week") score += 5;

  // Engagement signals (0-20 points)
  if (supplier.openedLastEmail) score += 8;
  if (supplier.clickedLink) score += 7;
  if (supplier.visitedProfile) score += 5;

  // Determine label
  if (score >= 80) return { score, label: "🔥 Hot Lead", color: "bg-red-100 text-red-800 border-red-300" };
  if (score >= 60) return { score, label: "🟡 Warm Lead", color: "bg-amber-100 text-amber-800 border-amber-300" };
  if (score >= 40) return { score, label: "🟢 Nurture", color: "bg-green-100 text-green-800 border-green-300" };
  return { score, label: "🔵 Cold", color: "bg-blue-100 text-blue-800 border-blue-300" };
}
```

**UI Changes to Card:**

- Add a **score badge** in the top-right corner of each supplier card showing the score number inside a circular progress indicator
- Add the **lead label badge** ("🔥 Hot Lead") below the supplier name
- Add **tag pills** showing segments: e.g., "Verified", "Fast Responder", "Certified", "AI Found"
- If score >= 80, add a subtle **pulsing glow animation** on the card border (red/orange glow)
- Add a small **"Score Breakdown"** expandable section showing how points were calculated

---

### **ENHANCEMENT 5: Enhanced Automation Trigger Workflows**

**File to Edit:** `src/components/outreach/AutomationRulesPanel.tsx`

Add a new section titled **"Smart Trigger Workflows"** below existing automation rules. These are **visual workflow cards** (display/config only — preparing for future backend integration).

```
TypeScript
```

```
const triggerWorkflows = [
  {
    id: "tw1",
    name: "Reply Received → Pause & Notify",
    trigger: "When a prospect replies to any message",
    triggerIcon: MessageSquareReply,
    actions: [
      { action: "Pause active sequence for this contact", icon: PauseCircle },
      { action: "Send Slack/email notification to assigned rep", icon: Bell },
      { action: "Move lead to 'Engaged' stage in pipeline", icon: ArrowRight },
      { action: "Log interaction in CRM with reply content", icon: FileText },
    ],
    status: "active",
    color: "border-green-500",
    priority: "critical",
  },
  {
    id: "tw2",
    name: "Sequence Complete — No Reply → Nurture",
    trigger: "When full sequence completes with zero replies",
    triggerIcon: XCircle,
    actions: [
      { action: "Wait 30 days (cooling period)", icon: Clock },
      { action: "Move to 'Nurture' segment", icon: FolderInput },
      { action: "Add to monthly newsletter list", icon: Mail },
      { action: "Schedule re-engagement sequence in 60 days", icon: CalendarClock },
    ],
    status: "active",
    color: "border-amber-500",
    priority: "high",
  },
  {
    id: "tw3",
    name: "Meeting Booked → Confirm & Prepare",
    trigger: "When a prospect books a meeting via calendar link",
    triggerIcon: CalendarCheck,
    actions: [
      { action: "Send confirmation email with agenda", icon: Mail },
      { action: "Send WhatsApp reminder 1 hour before", icon: MessageCircle },
      { action: "Create meeting prep doc with prospect info", icon: FileText },
      { action: "Notify sales team in Slack", icon: Bell },
    ],
    status: "active",
    color: "border-blue-500",
    priority: "critical",
  },
  {
    id: "tw4",
    name: "Lead Score Exceeds Threshold → Fast Track",
    trigger: "When lead score crosses 80 points (Hot Lead)",
    triggerIcon: TrendingUp,
    actions: [
      { action: "Alert senior sales rep immediately", icon: AlertTriangle },
      { action: "Prioritize in outreach queue", icon: ArrowUpCircle },
      { action: "Send personalized high-value message", icon: Star },
      { action: "Add to VIP tracking dashboard", icon: Eye },
    ],
    status: "active",
    color: "border-red-500",
    priority: "critical",
  },
  {
    id: "tw5",
    name: "Email Bounced → Clean & Re-route",
    trigger: "When an email hard bounces",
    triggerIcon: AlertCircle,
    actions: [
      { action: "Mark email as invalid in CRM", icon: XCircle },
      { action: "Search for alternative email (Apollo/Hunter)", icon: Search },
      { action: "Switch to LinkedIn or WhatsApp channel", icon: RefreshCw },
      { action: "Update lead quality score (-10 points)", icon: MinusCircle },
    ],
    status: "active",
    color: "border-gray-500",
    priority: "medium",
  },
  {
    id: "tw6",
    name: "Prospect Opens 3+ Times → Strike While Hot",
    trigger: "When prospect opens same email 3 or more times",
    triggerIcon: Eye,
    actions: [
      { action: "Send immediate follow-up within 1 hour", icon: Zap },
      { action: "Boost lead score by +15 points", icon: TrendingUp },
      { action: "Notify rep: 'High intent signal detected'", icon: Bell },
      { action: "Add to 'Hot Prospects' segment", icon: Flame },
    ],
    status: "active",
    color: "border-orange-500",
    priority: "high",
  },
];
```

**UI for Each Workflow Card:**

- Card layout with colored left border (based on `color`)
- **Header**: Trigger icon + workflow name + status toggle (on/off switch, visual only)
- **Trigger section**: "WHEN:" + trigger description in a highlighted box
- **Actions section**: "THEN:" + numbered list of actions, each with its icon
- **Priority badge** in top-right corner
- Cards arranged in a **2-column grid** on desktop, single column on mobile
- Add a **"+ Create Custom Workflow"** button at the bottom (opens an empty card template, for future use)

---

### **ENHANCEMENT 6: Message Template Library**

**File to Create:** `src/components/outreach/MessageTemplateLibrary.tsx`

**Add a new "Templates" tab** to the Outreach Hub tab navigation.

```
TypeScript
```

```
const messageTemplates = [
  // EMAIL TEMPLATES
  {
    id: "et1",
    channel: "Email",
    channelIcon: Mail,
    category: "Cold Outreach",
    name: "Pain Point Opening",
    subject: "Struggling with {pain_point}?",
    body: `Hi {first_name},

I noticed {company_name} has been {observation_about_them}.

Many {industry} companies face {specific_pain_point}, which often leads to {negative_consequence}.

We helped {similar_company} solve this exact problem and they saw {specific_result} within {timeframe}.

Would you be open to a 15-minute call to see if we could help {company_name} achieve similar results?

Best,
{your_name}
{your_title} | {your_company}`,
    variables: ["first_name", "company_name", "observation_about_them", "industry", "specific_pain_point", "negative_consequence", "similar_company", "specific_result", "timeframe", "your_name", "your_title", "your_company"],
    performance: { openRate: 72, replyRate: 18 },
    bestFor: "First touch with identified pain point",
    tips: "Research the prospect for 2 minutes before sending. Reference something specific.",
  },
  {
    id: "et2",
    channel: "Email",
    channelIcon: Mail,
    category: "Cold Outreach",
    name: "Social Proof Lead",
    subject: "How {similar_company} achieved {result}",
    body: `Hi {first_name},

{similar_company} was facing the same challenges as {company_name} — {shared_challenge}.

After working with us, they achieved:
• {result_1}
• {result_2}
• {result_3}

I'd love to share how we did it and explore if it makes sense for {company_name}.

Worth a quick chat this week?

{your_name}`,
    variables: ["first_name", "similar_company", "company_name", "shared_challenge", "result_1", "result_2", "result_3", "your_name"],
    performance: { openRate: 65, replyRate: 22 },
    bestFor: "When you have strong case studies",
    tips: "Use a case study from the same industry as the prospect.",
  },
  {
    id: "et3",
    channel: "Email",
    channelIcon: Mail,
    category: "Follow-up",
    name: "Gentle Follow-up #1",
    subject: "Re: {previous_subject}",
    body: `Hi {first_name},

Just floating this back to the top of your inbox.

I know you're busy, so I'll keep it short — would a 10-minute call this week work to explore if {value_proposition}?

If the timing isn't right, totally understand. Just let me know.

{your_name}`,
    variables: ["first_name", "previous_subject", "value_proposition", "your_name"],
    performance: { openRate: 68, replyRate: 14 },
    bestFor: "3-4 days after first email with no reply",
    tips: "Keep follow-ups shorter than the original. Add new value each time.",
  },
  {
    id: "et4",
    channel: "Email",
    channelIcon: Mail,
    category: "Follow-up",
    name: "Breakup Email (Final)",
    subject: "Should I close your file?",
    body: `Hi {first_name},

I've reached out a few times and haven't heard back, which is totally fine.

I don't want to be a pest, so this will be my last message. If {value_proposition} ever becomes a priority, my door is always open.

Wishing {company_name} continued success!

{your_name}

P.S. — No hard feelings. Sometimes the timing just isn't right. 😊`,
    variables: ["first_name", "value_proposition", "company_name", "your_name"],
    performance: { openRate: 76, replyRate: 24 },
    bestFor: "Final email in sequence — surprisingly high reply rate",
    tips: "Breakup emails often get the highest reply rates. The 'loss aversion' trigger works.",
  },

  // WHATSAPP TEMPLATES
  {
    id: "wt1",
    channel: "WhatsApp",
    channelIcon: MessageCircle,
    category: "Introduction",
    name: "Warm Introduction",
    body: `Hi {first_name}! 👋

I'm {your_name} from {your_company}.

I came across {company_name} and was really impressed by {specific_compliment}.

We specialize in helping {industry} companies {key_benefit}, and I thought there might be a fit.

Would you be open to a quick chat? No pressure at all! 😊`,
    variables: ["first_name", "your_name", "your_company", "company_name", "specific_compliment", "industry", "key_benefit"],
    performance: { openRate: 95, replyRate: 35 },
    bestFor: "First WhatsApp message to warm/known contacts",
    tips: "Keep it conversational. Use 1-2 emojis max. Don't be too formal.",
  },
  {
    id: "wt2",
    channel: "WhatsApp",
    channelIcon: MessageCircle,
    category: "Follow-up",
    name: "Value-Add Follow-up",
    body: `Hey {first_name} 👋

Following up on my earlier message. I thought you might find this interesting:

📊 {relevant_insight_or_stat}

We've been helping companies like {similar_company} tackle this. Happy to share more details if you're curious!`,
    variables: ["first_name", "relevant_insight_or_stat", "similar_company"],
    performance: { openRate: 92, replyRate: 28 },
    bestFor: "Second touch on WhatsApp — add value, don't just ask",
    tips: "Share a stat, article, or insight relevant to their industry.",
  },

  // LINKEDIN TEMPLATES
  {
    id: "lt1",
    channel: "LinkedIn",
    channelIcon: Linkedin,
    category: "Connection Request",
    name: "Personalized Connection Note",
    body: `Hi {first_name}, I noticed your work on {specific_project_or_post}. As someone in {related_field}, I'd love to connect and exchange ideas about {shared_interest}. Looking forward to learning from your experience!`,
    variables: ["first_name", "specific_project_or_post", "related_field", "shared_interest"],
    performance: { openRate: 100, replyRate: 45 },
    bestFor: "Connection request — must be under 300 characters",
    tips: "ALWAYS reference something specific. Generic notes get ignored.",
    characterLimit: 300,
  },
  {
    id: "lt2",
    channel: "LinkedIn",
    channelIcon: Linkedin,
    category: "After Connection",
    name: "Post-Connection Value Message",
    body: `Thanks for connecting, {first_name}! 🙌

I've been following {company_name}'s growth in {industry} — impressive trajectory.

I work with {audience_description} to help them {specific_outcome}. Recently helped {case_study_company} achieve {result}.

Would you be open to a 15-min chat to see if there's alignment? If not, happy just to stay connected!`,
    variables: ["first_name", "company_name", "industry", "audience_description", "specific_outcome", "case_study_company", "result"],
    performance: { openRate: 85, replyRate: 28 },
    bestFor: "First message after someone accepts connection — wait 24-48 hours",
    tips: "Don't pitch immediately on connection. Wait at least 1 day.",
  },

  // INSTAGRAM TEMPLATES
  {
    id: "it1",
    channel: "Instagram",
    channelIcon: Instagram,
    category: "DM Outreach",
    name: "Genuine Compliment + Bridge",
    body: `Hey {first_name}! 👋

Love your content about {topic} — especially {specific_post_or_reel}. Really resonated with me.

I work with {audience} to help them {benefit}. Thought there might be a cool synergy.

Would love to chat if you're open to it! No worries if not 😊`,
    variables: ["first_name", "topic", "specific_post_or_reel", "audience", "benefit"],
    performance: { openRate: 88, replyRate: 22 },
    bestFor: "Instagram DM to content creators, influencers, or business owners",
    tips: "Engage with 2-3 of their posts BEFORE sending a DM. Build familiarity.",
  },

  // SMS TEMPLATE
  {
    id: "st1",
    channel: "SMS",
    channelIcon: Phone,
    category: "Follow-up",
    name: "Quick Check-in",
    body: `Hi {first_name}, it's {your_name} from {your_company}. Following up on my email about {topic}. Would a quick 10-min call work this week? Reply STOP to opt out.`,
    variables: ["first_name", "your_name", "your_company", "topic"],
    performance: { openRate: 98, replyRate: 15 },
    bestFor: "SMS follow-up after email — always include opt-out",
    tips: "Keep SMS under 160 characters if possible. Always include opt-out.",
  },
];
```

**UI Requirements:**

- **Tab layout or filter bar** at top: All | Email | WhatsApp | LinkedIn | Instagram | SMS | Telegram
- **Search bar** with placeholder "Search templates by name, channel, or category..."
- **Category filter** dropdown: All | Cold Outreach | Follow-up | Introduction | Connection Request | DM Outreach
- Templates displayed as **expandable cards** in a grid (2 columns desktop, 1 mobile)
- **Card collapsed view**: Channel icon + badge, template name, category tag, performance stats (open rate / reply rate as small gauges or percentages)
- **Card expanded view**: Full message body in a styled code/message block with highlighted `{variables}`, "Best For" note, "Tips" note, character count (for LinkedIn)
- **"📋 Copy to Clipboard"** button on each template — copies the body text. Show toast notification "Template copied!"
- **"✏️ Customize"** button — opens a modal where user can edit the template text (changes persist in localStorage)
- **Performance badges**: If openRate > 70% show "⭐ High Open Rate", if replyRate > 20% show "🎯 High Reply Rate"
- Add a **"+ Create Custom Template"** button that opens a form with: channel selector, category, name, subject (for email), body textarea, save to localStorage

---

### **FILES SUMMARY**

**Files to Create (3):**

```
text
```

```
src/components/outreach/ComplianceBestPractices.tsx
src/components/outreach/DailyWorkflowChecklist.tsx
src/components/outreach/MessageTemplateLibrary.tsx
```

**Files to Edit (4):**

```
text
```

```
src/pages/dashboard/OutreachHub.tsx
  → Add "Templates" tab to tab navigation
  → Import & render ComplianceBestPractices on Campaigns tab
  → Import & render DailyWorkflowChecklist on Campaigns tab
  → Route Templates tab to MessageTemplateLibrary component

src/components/outreach/OutreachMetricsDashboard.tsx
  → Add conversion funnel visualization (Enhancement 1A)
  → Add per-channel bar chart (Enhancement 1B)
  → Add A/B test performance cards (Enhancement 1C)

src/components/outreach/OutreachSupplierDiscoveryCard.tsx
  → Add lead score calculation function
  → Add score badge, lead label, tag pills, hot lead glow

src/components/outreach/AutomationRulesPanel.tsx
  → Add "Smart Trigger Workflows" section with 6 workflow cards
  → Add visual trigger → action flow cards
```

### **DESIGN GUIDELINES**

- Use **shadcn/ui** components throughout (Card, Badge, Button, Tabs, Accordion, Checkbox, Progress, Tooltip, Dialog, Toast)
- Use **Tailwind CSS** for all styling — no inline styles
- Use **Lucide React icons** only
- Use **Recharts** for all charts (already in project)
- Maintain **consistent color scheme** with existing app
- All components must be **fully responsive** (mobile-first)
- Add **smooth transitions** and hover effects for interactive elements
- Use **TypeScript** with proper typing for all components
- **localStorage** for persisting checklist state and custom templates
- Add **loading states** and **empty states** where appropriate
- All mock data should be **realistic and professional** — as provided above

### **IMPLEMENTATION ORDER**

1. First: Message Template Library (new tab — isolated, no conflicts)
2. Second: Compliance Panel + Workflow Checklist (new components on Campaigns tab)
3. Third: Metrics Dashboard enhancements (editing existing)
4. Fourth: Supplier card lead scoring (editing existing)
5. Fifth: Automation trigger workflows (editing existing)

Build all 6 enhancements completely. Do not skip any section. Every piece of data provided above should appear in the UI. Make it look like a **premium SaaS product**.