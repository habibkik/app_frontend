import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Megaphone, 
  Send, 
  Calendar,
  Plus,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { DashboardLayout } from "@/features/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

import { 
  PostComposer, 
  PlatformSelector, 
  PostScheduler, 
  PostPreview,
  ScheduledPostsList,
  type Platform,
  type ScheduledPost,
} from "@/components/campaigns";

// Initialize platforms - these would come from Settings/SocialMediaSection in a real app
const initialPlatforms: Platform[] = [
  { id: "twitter", name: "Twitter / X", icon: "𝕏", connected: true },
  { id: "facebook", name: "Facebook", icon: "f", connected: true },
  { id: "instagram", name: "Instagram", icon: "📷", connected: false },
  { id: "linkedin", name: "LinkedIn", icon: "in", connected: true },
  { id: "tiktok", name: "TikTok", icon: "♪", connected: false },
  { id: "youtube", name: "YouTube", icon: "▶", connected: false },
  { id: "pinterest", name: "Pinterest", icon: "📌", connected: false },
  { id: "threads", name: "Threads", icon: "@", connected: false },
];

// Sample scheduled posts
const sampleScheduledPosts: ScheduledPost[] = [
  {
    id: "1",
    content: "🚀 Excited to announce our new product line! Check out the latest innovations that will transform your workflow. #Innovation #NewProduct",
    platforms: [
      { id: "twitter", name: "Twitter / X", icon: "𝕏" },
      { id: "linkedin", name: "LinkedIn", icon: "in" },
    ],
    scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
    status: "scheduled",
    createdAt: new Date(),
  },
  {
    id: "2",
    content: "Behind the scenes look at our team working on something amazing! 🎬 Stay tuned for more updates.",
    platforms: [
      { id: "facebook", name: "Facebook", icon: "f" },
    ],
    scheduledAt: new Date(Date.now() + 172800000), // 2 days
    status: "scheduled",
    createdAt: new Date(),
  },
];

export default function CampaignsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("compose");
  
  // Post composer state
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter"]);
  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");
  
  // Scheduled posts state
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(sampleScheduledPosts);
  const [platforms] = useState<Platform[]>(initialPlatforms);

  // Get selected platform for preview
  const previewPlatform = platforms.find(p => selectedPlatforms.includes(p.id)) || platforms[0];

  const handleTogglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) {
      toast({
        title: "Content required",
        description: "Please write something before posting",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Select platforms",
        description: "Please select at least one platform to post to",
        variant: "destructive",
      });
      return;
    }

    if (scheduleType === "scheduled" && !scheduledDate) {
      toast({
        title: "Schedule required",
        description: "Please select a date to schedule your post",
        variant: "destructive",
      });
      return;
    }

    // Create new post
    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      content: postContent,
      platforms: selectedPlatforms.map(id => {
        const platform = platforms.find(p => p.id === id)!;
        return { id: platform.id, name: platform.name, icon: platform.icon };
      }),
      scheduledAt: scheduleType === "now" 
        ? new Date() 
        : new Date(`${scheduledDate!.toDateString()} ${scheduledTime}`),
      status: scheduleType === "now" ? "published" : "scheduled",
      createdAt: new Date(),
    };

    if (scheduleType === "now") {
      toast({
        title: "Post published!",
        description: `Your post has been published to ${selectedPlatforms.length} platform(s)`,
      });
    } else {
      setScheduledPosts(prev => [newPost, ...prev]);
      toast({
        title: "Post scheduled!",
        description: `Your post will be published on ${scheduledDate!.toLocaleDateString()} at ${scheduledTime}`,
      });
    }

    // Reset form
    setPostContent("");
    setSelectedPlatforms(["twitter"]);
    setScheduleType("now");
    setScheduledDate(undefined);
  };

  const handleDeletePost = (postId: string) => {
    setScheduledPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleEditPost = (post: ScheduledPost) => {
    setPostContent(post.content);
    setSelectedPlatforms(post.platforms.map(p => p.id));
    setScheduleType("scheduled");
    setScheduledDate(post.scheduledAt);
    setScheduledTime(post.scheduledAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    setActiveTab("compose");
    
    // Remove the old post
    setScheduledPosts(prev => prev.filter(p => p.id !== post.id));
  };

  const handlePublishNow = (postId: string) => {
    const post = scheduledPosts.find(p => p.id === postId);
    if (post) {
      setScheduledPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        title: "Post published!",
        description: `Your post has been published to ${post.platforms.length} platform(s)`,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
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

        {/* Main Content */}
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
              {/* Left Column - Composer */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Create Post</CardTitle>
                    <CardDescription>
                      Write your content and select platforms to publish
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Post Composer */}
                    <PostComposer
                      content={postContent}
                      onContentChange={setPostContent}
                      maxLength={280}
                    />

                    <Separator />

                    {/* Platform Selector */}
                    <PlatformSelector
                      platforms={platforms}
                      selectedPlatforms={selectedPlatforms}
                      onTogglePlatform={handleTogglePlatform}
                    />

                    <Separator />

                    {/* Scheduler */}
                    <PostScheduler
                      scheduleType={scheduleType}
                      scheduledDate={scheduledDate}
                      scheduledTime={scheduledTime}
                      onScheduleTypeChange={setScheduleType}
                      onDateChange={setScheduledDate}
                      onTimeChange={setScheduledTime}
                    />

                    {/* Action Button */}
                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={handleCreatePost}
                      disabled={!postContent.trim() || selectedPlatforms.length === 0}
                    >
                      {scheduleType === "now" ? (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Publish Now
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Post
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Preview</h3>
                  {selectedPlatforms.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      Showing {previewPlatform.name}
                    </span>
                  )}
                </div>

                <PostPreview
                  content={postContent}
                  platformId={previewPlatform.id}
                  platformName={previewPlatform.name}
                  platformIcon={previewPlatform.icon}
                />

                {selectedPlatforms.length > 1 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedPlatforms.map(id => {
                      const platform = platforms.find(p => p.id === id);
                      if (!platform) return null;
                      return (
                        <Button
                          key={id}
                          variant={previewPlatform.id === id ? "secondary" : "ghost"}
                          size="sm"
                          className="text-xs"
                          onClick={() => setSelectedPlatforms([id, ...selectedPlatforms.filter(p => p !== id)])}
                        >
                          {platform.icon} {platform.name}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scheduled Posts</CardTitle>
                <CardDescription>
                  Manage your upcoming scheduled posts
                </CardDescription>
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
