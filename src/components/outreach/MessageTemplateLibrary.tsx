import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Mail, MessageCircle, Linkedin, Instagram, Phone, Send,
  Copy, Pencil, Plus, Search, Star, Target, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface MessageTemplate {
  id: string;
  channel: string;
  channelIcon: React.ElementType;
  category: string;
  name: string;
  subject?: string;
  body: string;
  variables: string[];
  performance: { openRate: number; replyRate: number };
  bestFor: string;
  tips: string;
  characterLimit?: number;
}

const defaultTemplates: MessageTemplate[] = [
  {
    id: "et1", channel: "Email", channelIcon: Mail, category: "Cold Outreach",
    name: "Pain Point Opening", subject: "Struggling with {pain_point}?",
    body: `Hi {first_name},

I noticed {company_name} has been {observation_about_them}.

Many {industry} companies face {specific_pain_point}, which often leads to {negative_consequence}.

We helped {similar_company} solve this exact problem and they saw {specific_result} within {timeframe}.

Would you be open to a 15-minute call to see if we could help {company_name} achieve similar results?

Best,
{your_name}
{your_title} | {your_company}`,
    variables: ["first_name", "company_name", "observation_about_them", "industry", "specific_pain_point", "negative_consequence", "similar_company", "specific_result", "timeframe", "your_name", "your_title", "your_company"],
    performance: { openRate: 72, replyRate: 18 }, bestFor: "First touch with identified pain point",
    tips: "Research the prospect for 2 minutes before sending. Reference something specific.",
  },
  {
    id: "et2", channel: "Email", channelIcon: Mail, category: "Cold Outreach",
    name: "Social Proof Lead", subject: "How {similar_company} achieved {result}",
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
    performance: { openRate: 65, replyRate: 22 }, bestFor: "When you have strong case studies",
    tips: "Use a case study from the same industry as the prospect.",
  },
  {
    id: "et3", channel: "Email", channelIcon: Mail, category: "Follow-up",
    name: "Gentle Follow-up #1", subject: "Re: {previous_subject}",
    body: `Hi {first_name},

Just floating this back to the top of your inbox.

I know you're busy, so I'll keep it short — would a 10-minute call this week work to explore if {value_proposition}?

If the timing isn't right, totally understand. Just let me know.

{your_name}`,
    variables: ["first_name", "previous_subject", "value_proposition", "your_name"],
    performance: { openRate: 68, replyRate: 14 }, bestFor: "3-4 days after first email with no reply",
    tips: "Keep follow-ups shorter than the original. Add new value each time.",
  },
  {
    id: "et4", channel: "Email", channelIcon: Mail, category: "Follow-up",
    name: "Breakup Email (Final)", subject: "Should I close your file?",
    body: `Hi {first_name},

I've reached out a few times and haven't heard back, which is totally fine.

I don't want to be a pest, so this will be my last message. If {value_proposition} ever becomes a priority, my door is always open.

Wishing {company_name} continued success!

{your_name}

P.S. — No hard feelings. Sometimes the timing just isn't right. 😊`,
    variables: ["first_name", "value_proposition", "company_name", "your_name"],
    performance: { openRate: 76, replyRate: 24 }, bestFor: "Final email in sequence — surprisingly high reply rate",
    tips: "Breakup emails often get the highest reply rates. The 'loss aversion' trigger works.",
  },
  {
    id: "wt1", channel: "WhatsApp", channelIcon: MessageCircle, category: "Introduction",
    name: "Warm Introduction",
    body: `Hi {first_name}! 👋

I'm {your_name} from {your_company}.

I came across {company_name} and was really impressed by {specific_compliment}.

We specialize in helping {industry} companies {key_benefit}, and I thought there might be a fit.

Would you be open to a quick chat? No pressure at all! 😊`,
    variables: ["first_name", "your_name", "your_company", "company_name", "specific_compliment", "industry", "key_benefit"],
    performance: { openRate: 95, replyRate: 35 }, bestFor: "First WhatsApp message to warm/known contacts",
    tips: "Keep it conversational. Use 1-2 emojis max. Don't be too formal.",
  },
  {
    id: "wt2", channel: "WhatsApp", channelIcon: MessageCircle, category: "Follow-up",
    name: "Value-Add Follow-up",
    body: `Hey {first_name} 👋

Following up on my earlier message. I thought you might find this interesting:

📊 {relevant_insight_or_stat}

We've been helping companies like {similar_company} tackle this. Happy to share more details if you're curious!`,
    variables: ["first_name", "relevant_insight_or_stat", "similar_company"],
    performance: { openRate: 92, replyRate: 28 }, bestFor: "Second touch on WhatsApp — add value, don't just ask",
    tips: "Share a stat, article, or insight relevant to their industry.",
  },
  {
    id: "lt1", channel: "LinkedIn", channelIcon: Linkedin, category: "Connection Request",
    name: "Personalized Connection Note",
    body: `Hi {first_name}, I noticed your work on {specific_project_or_post}. As someone in {related_field}, I'd love to connect and exchange ideas about {shared_interest}. Looking forward to learning from your experience!`,
    variables: ["first_name", "specific_project_or_post", "related_field", "shared_interest"],
    performance: { openRate: 100, replyRate: 45 }, bestFor: "Connection request — must be under 300 characters",
    tips: "ALWAYS reference something specific. Generic notes get ignored.", characterLimit: 300,
  },
  {
    id: "lt2", channel: "LinkedIn", channelIcon: Linkedin, category: "After Connection",
    name: "Post-Connection Value Message",
    body: `Thanks for connecting, {first_name}! 🙌

I've been following {company_name}'s growth in {industry} — impressive trajectory.

I work with {audience_description} to help them {specific_outcome}. Recently helped {case_study_company} achieve {result}.

Would you be open to a 15-min chat to see if there's alignment? If not, happy just to stay connected!`,
    variables: ["first_name", "company_name", "industry", "audience_description", "specific_outcome", "case_study_company", "result"],
    performance: { openRate: 85, replyRate: 28 }, bestFor: "First message after someone accepts connection — wait 24-48 hours",
    tips: "Don't pitch immediately on connection. Wait at least 1 day.",
  },
  {
    id: "it1", channel: "Instagram", channelIcon: Instagram, category: "DM Outreach",
    name: "Genuine Compliment + Bridge",
    body: `Hey {first_name}! 👋

Love your content about {topic} — especially {specific_post_or_reel}. Really resonated with me.

I work with {audience} to help them {benefit}. Thought there might be a cool synergy.

Would love to chat if you're open to it! No worries if not 😊`,
    variables: ["first_name", "topic", "specific_post_or_reel", "audience", "benefit"],
    performance: { openRate: 88, replyRate: 22 }, bestFor: "Instagram DM to content creators, influencers, or business owners",
    tips: "Engage with 2-3 of their posts BEFORE sending a DM. Build familiarity.",
  },
  {
    id: "st1", channel: "SMS", channelIcon: Phone, category: "Follow-up",
    name: "Quick Check-in",
    body: `Hi {first_name}, it's {your_name} from {your_company}. Following up on my email about {topic}. Would a quick 10-min call work this week? Reply STOP to opt out.`,
    variables: ["first_name", "your_name", "your_company", "topic"],
    performance: { openRate: 98, replyRate: 15 }, bestFor: "SMS follow-up after email — always include opt-out",
    tips: "Keep SMS under 160 characters if possible. Always include opt-out.",
  },
];

const CHANNELS = ["All", "Email", "WhatsApp", "LinkedIn", "Instagram", "SMS"];
const CATEGORIES = ["All", "Cold Outreach", "Follow-up", "Introduction", "Connection Request", "After Connection", "DM Outreach"];

const channelColors: Record<string, string> = {
  Email: "bg-primary/10 text-primary", WhatsApp: "bg-emerald-500/10 text-emerald-600",
  LinkedIn: "bg-blue-600/10 text-blue-600", Instagram: "bg-pink-500/10 text-pink-600",
  SMS: "bg-violet-500/10 text-violet-600",
};

export function MessageTemplateLibrary() {
  const [channel, setChannel] = useState("All");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [customTemplates, setCustomTemplates] = useLocalStorage<MessageTemplate[]>("outreach-custom-templates", []);
  const [editBody, setEditBody] = useState("");
  const [editSubject, setEditSubject] = useState("");

  // Create custom template state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newChannel, setNewChannel] = useState("Email");
  const [newCategory, setNewCategory] = useState("Cold Outreach");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");

  const allTemplates = useMemo(() => {
    const customs = customTemplates.map((t) => ({
      ...t,
      channelIcon: { Email: Mail, WhatsApp: MessageCircle, LinkedIn: Linkedin, Instagram: Instagram, SMS: Phone }[t.channel] || Mail,
    }));
    return [...defaultTemplates, ...customs];
  }, [customTemplates]);

  const filtered = useMemo(() => {
    return allTemplates.filter((t) => {
      if (channel !== "All" && t.channel !== channel) return false;
      if (category !== "All" && t.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.channel.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allTemplates, channel, category, search]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Template copied to clipboard!");
  };

  const handleSaveEdit = () => {
    if (!editingTemplate) return;
    const idx = customTemplates.findIndex((t) => t.id === editingTemplate.id);
    if (idx >= 0) {
      const updated = [...customTemplates];
      updated[idx] = { ...updated[idx], body: editBody, subject: editSubject || undefined };
      setCustomTemplates(updated);
    } else {
      setCustomTemplates([...customTemplates, { ...editingTemplate, id: `custom-${editingTemplate.id}`, body: editBody, subject: editSubject || undefined }]);
    }
    setEditingTemplate(null);
    toast.success("Template saved!");
  };

  const handleCreateTemplate = () => {
    if (!newName.trim() || !newBody.trim()) return;
    const newTemplate: MessageTemplate = {
      id: `custom-${Date.now()}`, channel: newChannel, channelIcon: Mail, category: newCategory,
      name: newName, subject: newSubject || undefined, body: newBody,
      variables: (newBody.match(/\{(\w+)\}/g) || []).map((v) => v.slice(1, -1)),
      performance: { openRate: 0, replyRate: 0 }, bestFor: "Custom template", tips: "",
    };
    setCustomTemplates([...customTemplates, newTemplate]);
    setNewName(""); setNewChannel("Email"); setNewCategory("Cold Outreach"); setNewSubject(""); setNewBody("");
    setCreateOpen(false);
    toast.success("Custom template created!");
  };

  const renderBody = (body: string) => {
    return body.split(/(\{[\w_]+\})/).map((part, i) =>
      part.startsWith("{") && part.endsWith("}") ? (
        <span key={i} className="rounded bg-primary/10 text-primary px-1 py-0.5 text-xs font-mono">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates by name, channel, or category..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Create Template</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Custom Template</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Channel</Label><Select value={newChannel} onValueChange={setNewChannel}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent>{CHANNELS.filter((c) => c !== "All").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs">Category</Label><Select value={newCategory} onValueChange={setNewCategory}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.filter((c) => c !== "All").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div><Label className="text-xs">Template Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. My Cold Email" /></div>
                <div><Label className="text-xs">Subject (Email only)</Label><Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Subject line..." /></div>
                <div><Label className="text-xs">Body (use &#123;variable_name&#125; for variables)</Label><Textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="Hi {first_name}..." rows={8} /></div>
                <Button onClick={handleCreateTemplate} className="w-full">Save Template</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">{filtered.length} template{filtered.length !== 1 ? "s" : ""} found</p>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((t) => {
          const isExpanded = expanded === t.id;
          const Icon = t.channelIcon;
          return (
            <Card key={t.id} className="border-border/50 transition-all hover:shadow-md">
              <CardContent className="p-4">
                {/* Collapsed Header */}
                <button className="w-full text-left" onClick={() => setExpanded(isExpanded ? null : t.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-1.5 rounded ${channelColors[t.channel] || "bg-muted"}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium truncate">{t.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t.category}</Badge>
                          {t.performance.openRate > 70 && <Badge className="bg-amber-500/10 text-amber-600 text-[10px] px-1.5 py-0 border-0">⭐ High Open</Badge>}
                          {t.performance.replyRate > 20 && <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] px-1.5 py-0 border-0">🎯 High Reply</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{t.performance.openRate}% open</p>
                        <p className="text-xs font-medium">{t.performance.replyRate}% reply</p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Body */}
                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-border/30 pt-3">
                    {t.subject && (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Subject</p>
                        <p className="text-sm bg-muted/50 rounded px-2 py-1.5 font-mono text-xs">{renderBody(t.subject)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Message Body</p>
                      <div className="text-sm bg-muted/50 rounded px-3 py-2 whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-64 overflow-y-auto">
                        {renderBody(t.body)}
                      </div>
                    </div>
                    {t.characterLimit && (
                      <p className="text-[10px] text-muted-foreground">Character limit: {t.body.length}/{t.characterLimit}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-primary/5 rounded p-2">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Best For</p>
                        <p className="text-xs">{t.bestFor}</p>
                      </div>
                      {t.tips && (
                        <div className="bg-amber-500/5 rounded p-2">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">💡 Tips</p>
                          <p className="text-xs">{t.tips}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={() => copyToClipboard(t.body)}>
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={() => {
                        setEditingTemplate(t);
                        setEditBody(t.body);
                        setEditSubject(t.subject || "");
                      }}>
                        <Pencil className="h-3 w-3" /> Customize
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Send className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No templates match your filters</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(o) => !o && setEditingTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Customize Template</DialogTitle></DialogHeader>
          {editingTemplate && (
            <div className="space-y-3 pt-2">
              {editingTemplate.subject !== undefined && (
                <div><Label className="text-xs">Subject</Label><Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} /></div>
              )}
              <div><Label className="text-xs">Body</Label><Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={10} className="font-mono text-xs" /></div>
              <Button onClick={handleSaveEdit} className="w-full">Save Customization</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
