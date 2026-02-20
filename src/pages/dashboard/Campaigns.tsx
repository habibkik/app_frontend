import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Megaphone, Send, Calendar, Plus, Sparkles, Loader2, Settings, AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "@/features/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useSocialCredentials } from "@/hooks/useSocialCredentials";
import { useSocialPosting } from "@/hooks/useSocialPosting";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MarketingFlowBanner } from "@/features/seller/components/MarketingFlowBanner";

import { 
  PostComposer, 
  PlatformSelector, 
  PostScheduler, 
  PostPreview,
  ScheduledPostsList,
  type Platform,
  type ScheduledPost,
} from "@/components/campaigns";

export default function CampaignsPage() {
  const { platforms: connectedPlatforms, loading: loadingPlatforms, getConnectedPlatforms } = useSocialCredentials();
  const { posting, publishPost } = useSocialPosting();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("compose");
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  // Load posts from DB
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
          .limit(50);
        if (error) throw error;
        if (data) {
          setScheduledPosts(
            data.map((d: any) => ({
              id: d.id,
              content: d.content,
              platforms: (d.platforms || []).map((pid: string) => ({ id: pid, name: pid, icon: "" })),
              scheduledAt: d.scheduled_at ? new Date(d.scheduled_at) : new Date(),
              status: d.status as ScheduledPost["status"],
              createdAt: new Date(d.created_at),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load campaign posts:", err);
      }
    };
    loadPosts();
  }, []);

  const platforms: Platform[] = connectedPlatforms.map(p => ({
    id: p.id, name: p.name, icon: p.icon, connected: p.connected,
  }));

  const postingPlatforms = connectedPlatforms
    .filter(p => p.features.posting)
    .map(p => ({ id: p.id, name: p.name, icon: p.icon, connected: p.connected }));

  const connectedCount = getConnectedPlatforms().filter(p => p.features.posting).length;
  const previewPlatform = platforms.find(p => selectedPlatforms.includes(p.id)) || platforms[0];

  const handleTogglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) ? prev.filter(id => id !== platformId) : [...prev, platformId]
    );
  };

  const handleCreatePost = async () => {
    if (scheduleType === "now") {
      const result = await publishPost(postContent, selectedPlatforms);
      if (result.success) {
        setPostContent("");
        setSelectedPlatforms([]);
      }
    } else {
      if (!scheduledDate) return;
      const [hours, minutes] = scheduledTime.split(":").map(Number);
      const dateTime = new Date(scheduledDate);
      dateTime.setHours(hours, minutes, 0, 0);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase.from("scheduled_posts").insert({
          content: postContent,
          platforms: selectedPlatforms,
          scheduled_at: dateTime.toISOString(),
          status: "scheduled",
          user_id: user.id,
        });
        if (error) throw error;

        const newPost: ScheduledPost = {
          id: Date.now().toString(),
          content: postContent,
          platforms: selectedPlatforms.map(id => {
            const platform = platforms.find(p => p.id === id)!;
            return { id: platform.id, name: platform.name, icon: platform.icon };
          }),
          scheduledAt: dateTime,
          status: "scheduled",
          createdAt: new Date(),
        };
        setScheduledPosts(prev => [newPost, ...prev]);
        setPostContent("");
        setSelectedPlatforms([]);
        setScheduleType("now");
        setScheduledDate(undefined);
        toast({ title: "Post scheduled", description: "Your post has been saved to the database." });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await supabase.from("scheduled_posts").delete().eq("id", postId);
      setScheduledPosts(prev => prev.filter(p => p.id !== postId));
    } catch {
      setScheduledPosts(prev => prev.filter(p => p.id !== postId));
    }
  };

  const handleEditPost = (post: ScheduledPost) => {
    setPostContent(post.content);
    setSelectedPlatforms(post.platforms.map(p => p.id));
    setScheduleType("scheduled");
    setScheduledDate(post.scheduledAt);
    setActiveTab("compose");
    handleDeletePost(post.id);
  };

  const handlePublishNow = async (postId: string) => {
    const post = scheduledPosts.find(p => p.id === postId);
    if (post) {
      const platformIds = post.platforms.map(p => p.id);
      const result = await publishPost(post.content, platformIds);
      if (result.success) {
        await supabase.from("scheduled_posts").update({ status: "posted" }).eq("id", postId);
        setScheduledPosts(prev => prev.map(p => p.id === postId ? { ...p, status: "published" as const } : p));
      } else {
        setScheduledPosts(prev => prev.map(p => p.id === postId ? { ...p, status: "failed" as const } : p));
      }
    }
  };

  if (loadingPlatforms) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <MarketingFlowBanner />

        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-foreground flex items-center gap-2"
            >
              <Megaphone className="h-6 w-6" />
              Marketing & Campaigns
            </motion.h1>
            <p className="text-muted-foreground mt-1">
              Create and schedule posts across all your connected platforms
            </p>
          </div>
          <Button onClick={() => setActiveTab("compose")}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {connectedCount === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No platforms connected</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Connect your social media accounts in Settings to start posting.</span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Go to Settings
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scheduled ({scheduledPosts.filter(p => p.status === "scheduled").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Create Post</CardTitle>
                    <CardDescription>
                      Write your content and select platforms to publish
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <PostComposer
                      content={postContent}
                      onContentChange={setPostContent}
                      maxLength={280}
                      selectedPlatforms={selectedPlatforms}
                    />
                    <Separator />
                    <PlatformSelector
                      platforms={postingPlatforms}
                      selectedPlatforms={selectedPlatforms}
                      onTogglePlatform={handleTogglePlatform}
                    />
                    <Separator />
                    <PostScheduler
                      scheduleType={scheduleType}
                      scheduledDate={scheduledDate}
                      scheduledTime={scheduledTime}
                      onScheduleTypeChange={setScheduleType}
                      onDateChange={setScheduledDate}
                      onTimeChange={setScheduledTime}
                    />
                    <Button 
                      size="lg" className="w-full"
                      onClick={handleCreatePost}
                      disabled={!postContent.trim() || selectedPlatforms.length === 0 || posting || (scheduleType === "scheduled" && !scheduledDate)}
                    >
                      {posting ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing...</>
                      ) : scheduleType === "now" ? (
                        <><Send className="h-4 w-4 mr-2" /> Publish Now</>
                      ) : (
                        <><Calendar className="h-4 w-4 mr-2" /> Schedule Post</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">Preview</h3>
                {previewPlatform ? (
                  <PostPreview
                    content={postContent}
                    platformId={previewPlatform.id}
                    platformName={previewPlatform.name}
                    platformIcon={previewPlatform.icon}
                  />
                ) : (
                  <Card className="p-6 text-center text-muted-foreground">
                    <p>Select a platform to see preview</p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scheduled Posts</CardTitle>
                <CardDescription>Manage your upcoming scheduled posts</CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduledPostsList
                  posts={scheduledPosts.filter(p => p.status === "scheduled")}
                  onDelete={handleDeletePost}
                  onEdit={handleEditPost}
                  onPublishNow={handlePublishNow}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
