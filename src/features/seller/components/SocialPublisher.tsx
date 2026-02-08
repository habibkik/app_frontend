import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Send, Calendar as CalendarIcon, Clock, Eye, Save, Copy, Edit, Trash2,
  Sparkles, Link2, FlaskConical, CheckCircle2, AlertCircle, Globe, Upload,
  FileText, ChevronDown, ChevronRight, X, RotateCcw,
  BarChart3, Heart, MessageSquare, Share2, MousePointerClick,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostPreview } from "@/components/campaigns/PostPreview";
import { useSocialPosting } from "@/hooks/useSocialPosting";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useContentStudioStore, type StudioContentItem } from "@/stores/contentStudioStore";

// ── Types ────────────────────────────────────────────────────────────────────

interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  charLimit: number;
  colorClass: string;
}

interface UTMParams {
  campaign: string;
  medium: string;
  source: string;
}

interface VariantContent {
  content: string;
  mediaUrl: string;
}

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: string | null;
  status: "scheduled" | "posted" | "draft" | "failed";
  createdAt: string;
  totalImpressions?: number;
  totalClicks?: number;
  totalLikes?: number;
  totalShares?: number;
  totalComments?: number;
  engagementRate?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS: PlatformConfig[] = [
  { id: "facebook", name: "Facebook", icon: "📘", charLimit: 63206, colorClass: "bg-blue-600" },
  { id: "instagram", name: "Instagram", icon: "📸", charLimit: 2200, colorClass: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { id: "tiktok", name: "TikTok", icon: "🎵", charLimit: 2200, colorClass: "bg-gray-900 dark:bg-gray-700" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", charLimit: 3000, colorClass: "bg-blue-700" },
  { id: "twitter", name: "Twitter/X", icon: "𝕏", charLimit: 280, colorClass: "bg-gray-900 dark:bg-gray-700" },
  { id: "whatsapp", name: "WhatsApp", icon: "💬", charLimit: 700, colorClass: "bg-green-600" },
];

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Dubai", "Asia/Kolkata",
  "Asia/Shanghai", "Asia/Tokyo", "Australia/Sydney",
];

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  posted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const buildUtmUrl = (baseUrl: string, params: UTMParams): string => {
  try {
    const url = new URL(baseUrl);
    if (params.campaign) url.searchParams.set("utm_campaign", params.campaign);
    if (params.medium) url.searchParams.set("utm_medium", params.medium);
    if (params.source) url.searchParams.set("utm_source", params.source);
    return url.toString();
  } catch {
    return baseUrl;
  }
};

const generateCampaignId = () =>
  `CMP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

// ── Component ────────────────────────────────────────────────────────────────

export function SocialPublisher() {
  const { toast } = useToast();
  const { posting, publishPost } = useSocialPosting();
  const studioItems = useContentStudioStore((s) => s.savedItems);

  // Content
  const [contentSource, setContentSource] = useState<"studio" | "custom" | "upload">("custom");
  const [selectedStudioItem, setSelectedStudioItem] = useState<string>("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  // Platforms
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // Scheduling
  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("scheduled");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");

  // UTM
  const [trackEngagement, setTrackEngagement] = useState(false);
  const [utmParams, setUtmParams] = useState<UTMParams>({ campaign: "", medium: "social", source: "" });
  const [utmOpen, setUtmOpen] = useState(false);

  // A/B Testing
  const [abOpen, setAbOpen] = useState(false);
  const [abTestingEnabled, setAbTestingEnabled] = useState(false);
  const [variantB, setVariantB] = useState<VariantContent>({ content: "", mediaUrl: "" });
  const [splitTraffic, setSplitTraffic] = useState(true);

  // Modals
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<"a" | "b">("a");
  const [lastCampaignId, setLastCampaignId] = useState("");

  // Posts
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load posts from DB on mount
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from("scheduled_posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) throw error;
        if (data) {
          setScheduledPosts(
            data.map((d: any) => ({
              id: d.id,
              content: d.content,
              platforms: d.platforms,
              scheduledAt: d.scheduled_at,
              status: d.status as ScheduledPost["status"],
              createdAt: d.created_at,
              totalImpressions: d.total_impressions ?? 0,
              totalClicks: d.total_clicks ?? 0,
              totalLikes: d.total_likes ?? 0,
              totalShares: d.total_shares ?? 0,
              totalComments: d.total_comments ?? 0,
              engagementRate: d.engagement_rate ?? 0,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load posts:", err);
      }
    };
    loadPosts();
  }, []);

  // Derived
  const utmPreviewUrl = useMemo(
    () => buildUtmUrl("https://yoursite.com/product", utmParams),
    [utmParams],
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleCopyUtm = () => {
    navigator.clipboard.writeText(utmPreviewUrl);
    toast({ title: "Copied!", description: "UTM link copied to clipboard" });
  };

  const handleSchedule = async () => {
    if (!content.trim()) {
      toast({ title: "Missing content", description: "Please enter some content to post", variant: "destructive" });
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast({ title: "No platforms", description: "Please select at least one platform", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const campaignId = generateCampaignId();

    try {
      if (scheduleType === "now") {
        const result = await publishPost(content, selectedPlatforms);
        if (result.success) {
          const newPost: ScheduledPost = {
            id: campaignId,
            content,
            platforms: selectedPlatforms,
            scheduledAt: null,
            status: "posted",
            createdAt: new Date().toISOString(),
          };
          setScheduledPosts((prev) => [newPost, ...prev]);
        }
      } else {
        if (!scheduledDate) {
          toast({ title: "Missing date", description: "Please select a date for scheduling", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const dateTime = new Date(scheduledDate);
        dateTime.setHours(hours, minutes, 0, 0);

        const { error } = await supabase.from("scheduled_posts").insert({
          content,
          platforms: selectedPlatforms,
          scheduled_at: dateTime.toISOString(),
          status: "scheduled",
          user_id: (await supabase.auth.getUser()).data.user?.id ?? "",
        });

        if (error) throw error;

        const newPost: ScheduledPost = {
          id: campaignId,
          content,
          platforms: selectedPlatforms,
          scheduledAt: dateTime.toISOString(),
          status: "scheduled",
          createdAt: new Date().toISOString(),
        };
        setScheduledPosts((prev) => [newPost, ...prev]);
      }

      setLastCampaignId(campaignId);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Schedule error:", err);
      toast({ title: "Error", description: err.message || "Failed to schedule posts", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!content.trim()) {
      toast({ title: "Missing content", description: "Please enter content before saving", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("scheduled_posts").insert({
        content,
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ["draft"],
        status: "draft",
        user_id: (await supabase.auth.getUser()).data.user?.id ?? "",
      });
      if (error) throw error;

      const newPost: ScheduledPost = {
        id: generateCampaignId(),
        content,
        platforms: selectedPlatforms,
        scheduledAt: null,
        status: "draft",
        createdAt: new Date().toISOString(),
      };
      setScheduledPosts((prev) => [newPost, ...prev]);
      toast({ title: "Draft saved", description: "Your post has been saved as a draft" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save draft", variant: "destructive" });
    }
  };

  const handleReset = () => {
    setContent("");
    setMediaUrl("");
    setSelectedPlatforms([]);
    setScheduleType("scheduled");
    setScheduledDate(undefined);
    setScheduledTime("12:00");
    setAbTestingEnabled(false);
    setVariantB({ content: "", mediaUrl: "" });
    setTrackEngagement(false);
    setUtmParams({ campaign: "", medium: "social", source: "" });
    setShowSuccessModal(false);
  };

  const handleCancelPost = (id: string) => {
    setScheduledPosts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Cancelled", description: "Post has been removed" });
  };

  const openEditModal = (target: "a" | "b") => {
    setEditTarget(target);
    setShowEditModal(true);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── 1. Content Selection ──────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={contentSource} onValueChange={(v: any) => {
            setContentSource(v);
            if (v !== "studio") setSelectedStudioItem("");
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select content source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="studio">From Content Studio</SelectItem>
              <SelectItem value="custom">Custom content</SelectItem>
              <SelectItem value="upload">Upload image / video</SelectItem>
            </SelectContent>
          </Select>

          {contentSource === "studio" && (
            <div className="space-y-3">
              {studioItems.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No content generated yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Go to Content Studio to generate marketing content first.</p>
                </div>
              ) : (
                <>
                  <Label className="text-xs text-muted-foreground">Select generated content</Label>
                  <div className="grid gap-2 max-h-[240px] overflow-y-auto">
                    {studioItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedStudioItem(item.id);
                          // Auto-fill content with the first headline + social captions
                          const parts = [
                            item.headlines[0] || "",
                            "",
                            item.adCopy.medium || item.adCopy.short || "",
                          ].filter(Boolean);
                          setContent(parts.join("\n\n"));
                          toast({ title: "Content loaded", description: `Loaded content for "${item.productName}"` });
                        }}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                          selectedStudioItem === item.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border hover:border-primary/30",
                        )}
                      >
                        <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(item.generatedAt), "PPp")} · {item.headlines.length} headlines · {item.socialCaptions.length} captions
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedStudioItem && (
                    <div className="flex gap-2 flex-wrap">
                      {(() => {
                        const item = studioItems.find((i) => i.id === selectedStudioItem);
                        if (!item) return null;
                        return (
                          <>
                            <Button variant="outline" size="sm" onClick={() => {
                              setContent(item.headlines.join("\n"));
                              toast({ title: "Loaded headlines" });
                            }}>
                              Load headlines
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                              setContent(item.adCopy.long || item.adCopy.medium || item.adCopy.short);
                              toast({ title: "Loaded ad copy" });
                            }}>
                              Load ad copy
                            </Button>
                            {item.socialCaptions.map((cap) => {
                              const platformMatch = PLATFORMS.find(
                                (p) => p.id === cap.platform.toLowerCase()
                              );
                              const icon = platformMatch?.icon ?? "📝";
                              const label = platformMatch?.name ?? cap.platform;
                              const text = cap.hashtags?.length
                                ? `${cap.caption}\n\n${cap.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}`
                                : cap.caption;
                              return (
                                <Button
                                  key={cap.platform}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setContent(text);
                                    toast({ title: `Loaded ${label} caption` });
                                  }}
                                >
                                  {icon} {label} caption
                                </Button>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {contentSource === "upload" && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click or drag to upload media</p>
            </div>
          )}

          <Textarea
            placeholder="Write your post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />

          {content && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{content.length} characters</span>
              <Button variant="ghost" size="sm" onClick={() => openEditModal("a")}>
                <Edit className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 2. Platform Selector ──────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PLATFORMS.map((p) => {
              const selected = selectedPlatforms.includes(p.id);
              return (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => togglePlatform(p.id)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-primary/30",
                  )}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.charLimit.toLocaleString()} chars</p>
                  </div>
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => togglePlatform(p.id)}
                    className="pointer-events-none"
                  />
                </motion.button>
              );
            })}
          </div>

          {selectedPlatforms.length > 0 && content && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Character limits:</p>
              {selectedPlatforms.map((pid) => {
                const p = PLATFORMS.find((x) => x.id === pid)!;
                const over = content.length > p.charLimit;
                return (
                  <div key={pid} className="flex items-center justify-between text-xs">
                    <span>{p.icon} {p.name}</span>
                    <span className={cn(over ? "text-destructive font-medium" : "text-muted-foreground")}>
                      {content.length}/{p.charLimit}
                      {over && " ⚠️"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 3. Scheduling ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="post-now"
              checked={scheduleType === "now"}
              onCheckedChange={(c) => setScheduleType(c ? "now" : "scheduled")}
            />
            <Label htmlFor="post-now" className="text-sm font-medium cursor-pointer">
              Post immediately
            </Label>
          </div>

          <AnimatePresence>
            {scheduleType === "scheduled" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("justify-start text-left font-normal", !scheduledDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(d) => d < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Time */}
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Timezone */}
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setScheduledDate(tomorrow);
                  setScheduledTime("10:00");
                  toast({ title: "AI Suggestion", description: "Best time: Tomorrow at 10:00 AM based on engagement patterns" });
                }}>
                  <Sparkles className="h-4 w-4 text-primary" />
                  Suggest best time
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ── 4. UTM Tracking (Collapsible) ─────────────────────────────── */}
      <Collapsible open={utmOpen} onOpenChange={setUtmOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Analytics & UTM Tracking
                </span>
                {utmOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="track-engagement" className="text-sm">Track engagement</Label>
                <Switch id="track-engagement" checked={trackEngagement} onCheckedChange={setTrackEngagement} />
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Campaign</Label>
                  <Input
                    placeholder="spring_sale_2025"
                    value={utmParams.campaign}
                    onChange={(e) => setUtmParams((p) => ({ ...p, campaign: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Medium</Label>
                  <Select value={utmParams.medium} onValueChange={(v) => setUtmParams((p) => ({ ...p, medium: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="cpc">CPC</SelectItem>
                      <SelectItem value="display">Display</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Source</Label>
                  <Input
                    placeholder="facebook"
                    value={utmParams.source}
                    onChange={(e) => setUtmParams((p) => ({ ...p, source: e.target.value }))}
                  />
                </div>
              </div>

              {(utmParams.campaign || utmParams.source) && (
                <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                  <code className="flex-1 text-xs break-all text-muted-foreground">{utmPreviewUrl}</code>
                  <Button variant="ghost" size="icon" onClick={handleCopyUtm}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── 5. A/B Testing (Collapsible) ──────────────────────────────── */}
      <Collapsible open={abOpen} onOpenChange={setAbOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  A/B Testing
                </span>
                {abOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Enable A/B testing</Label>
                <Switch checked={abTestingEnabled} onCheckedChange={setAbTestingEnabled} />
              </div>

              {abTestingEnabled && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Variant A */}
                    <div className="rounded-xl border p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Variant A (Original)</Badge>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal("a")}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {content || "No content yet"}
                      </p>
                    </div>

                    {/* Variant B */}
                    <div className="rounded-xl border border-dashed p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-primary/10 text-primary border-primary/20">Variant B</Badge>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal("b")}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {variantB.content || "Click edit to create variant B"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox id="split" checked={splitTraffic} onCheckedChange={(c) => setSplitTraffic(!!c)} />
                    <Label htmlFor="split" className="text-sm cursor-pointer">Split traffic 50/50</Label>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Testing for 3 days, then auto-select winner based on engagement
                  </p>
                </motion.div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── 6. Action Buttons ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => setShowPreviewModal(true)}
          disabled={!content || selectedPlatforms.length === 0}
        >
          <Eye className="h-4 w-4 mr-1.5" />
          Preview all posts
        </Button>

        <Button
          className="bg-gradient-primary text-primary-foreground flex-1 sm:flex-none"
          onClick={handleSchedule}
          disabled={isSubmitting || posting || !content || selectedPlatforms.length === 0}
        >
          {isSubmitting || posting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {scheduleType === "now" ? "Posting..." : "Scheduling..."}
            </span>
          ) : (
            <>
              <Send className="h-4 w-4 mr-1.5" />
              {scheduleType === "now" ? "Post now" : "Schedule posts"}
            </>
          )}
        </Button>

        <Button variant="outline" onClick={handleSaveDraft} disabled={!content}>
          <Save className="h-4 w-4 mr-1.5" />
          Save as draft
        </Button>
      </div>

      {/* ── 7. Scheduled Posts List ────────────────────────────────────── */}
      {scheduledPosts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Scheduled Posts & Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3">
                {scheduledPosts.map((post) => {
                  const hasEngagement = (post.totalImpressions ?? 0) > 0 || (post.totalLikes ?? 0) > 0;
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border p-3 space-y-2"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {post.platforms.map((pid) => {
                              const p = PLATFORMS.find((x) => x.id === pid);
                              return p ? <span key={pid} className="text-base" title={p.name}>{p.icon}</span> : null;
                            })}
                            <Badge variant="outline" className={cn("text-xs", STATUS_STYLES[post.status])}>
                              {post.status}
                            </Badge>
                            {post.scheduledAt && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(post.scheduledAt), "PPp")}
                              </span>
                            )}
                          </div>
                        </div>
                        {(post.status === "scheduled" || post.status === "draft") && (
                          <Button variant="ghost" size="icon" onClick={() => handleCancelPost(post.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      {/* Engagement Metrics Row */}
                      {(post.status === "posted" || hasEngagement) && (
                        <div className="flex items-center gap-4 pt-1 border-t border-border/50">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Impressions">
                            <Eye className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">{(post.totalImpressions ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Clicks">
                            <MousePointerClick className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">{(post.totalClicks ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Likes">
                            <Heart className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">{(post.totalLikes ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Comments">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">{(post.totalComments ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Shares">
                            <Share2 className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">{(post.totalShares ?? 0).toLocaleString()}</span>
                          </div>
                          {(post.engagementRate ?? 0) > 0 && (
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {(post.engagementRate ?? 0).toFixed(1)}% engagement
                            </Badge>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Previews</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPlatforms.map((pid) => {
              const p = PLATFORMS.find((x) => x.id === pid)!;
              return (
                <PostPreview
                  key={pid}
                  content={content}
                  platformId={p.id}
                  platformName={p.name}
                  platformIcon={p.icon}
                />
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Content Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTarget === "a" ? "Edit Content" : "Edit Variant B"}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            rows={6}
            value={editTarget === "a" ? content : variantB.content}
            onChange={(e) => {
              if (editTarget === "a") setContent(e.target.value);
              else setVariantB((v) => ({ ...v, content: e.target.value }));
            }}
          />
          <Button onClick={() => setShowEditModal(false)}>Done</Button>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="text-center sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </motion.div>
            <h2 className="text-xl font-semibold">
              {scheduleType === "now" ? "Posts Published!" : "Posts Scheduled!"}
            </h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Campaign: <span className="font-mono text-foreground">{lastCampaignId}</span></p>
              <p>Platforms: {selectedPlatforms.length}</p>
              {scheduleType === "scheduled" && scheduledDate && (
                <p>{format(scheduledDate, "PPP")} at {scheduledTime} ({timezone})</p>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Post another
              </Button>
              <Button onClick={() => setShowSuccessModal(false)}>
                View scheduled posts
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
