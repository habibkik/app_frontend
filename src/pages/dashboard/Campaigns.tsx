import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Megaphone, 
  Send, 
  Calendar,
  Plus,
  Sparkles,
  Loader2,
  Settings,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "@/features/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSocialCredentials } from "@/hooks/useSocialCredentials";
import { useSocialPosting } from "@/hooks/useSocialPosting";

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
  
  const [activeTab, setActiveTab] = useState("compose");
  
  // Post composer state
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");
  
  // Scheduled posts state (local for now - could be enhanced to use database)
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  // Map social credentials platforms to campaign platforms format
  const platforms: Platform[] = connectedPlatforms.map(p => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    connected: p.connected,
  }));

  // Filter to only platforms that support posting
  const postingPlatforms = connectedPlatforms
    .filter(p => p.features.posting)
    .map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      connected: p.connected,
    }));

  // Get connected platforms count
  const connectedCount = getConnectedPlatforms().filter(p => p.features.posting).length;

  // Get selected platform for preview
  const previewPlatform = platforms.find(p => selectedPlatforms.includes(p.id)) || platforms[0];

  const handleTogglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleCreatePost = async () => {
    if (scheduleType === "now") {
      // Publish immediately using the real posting hook
      const result = await publishPost(postContent, selectedPlatforms);
      
      if (result.success) {
        // Reset form on success
        setPostContent("");
        setSelectedPlatforms([]);
        setScheduleType("now");
        setScheduledDate(undefined);
      }
    } else {
      // Schedule post for later
      if (!scheduledDate) return;

      const newPost: ScheduledPost = {
        id: Date.now().toString(),
        content: postContent,
        platforms: selectedPlatforms.map(id => {
          const platform = platforms.find(p => p.id === id)!;
          return { id: platform.id, name: platform.name, icon: platform.icon };
        }),
        scheduledAt: new Date(`${scheduledDate.toDateString()} ${scheduledTime}`),
        status: "scheduled",
        createdAt: new Date(),
      };

      setScheduledPosts(prev => [newPost, ...prev]);
      
      // Reset form
      setPostContent("");
      setSelectedPlatforms([]);
      setScheduleType("now");
      setScheduledDate(undefined);
    }
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

  const handlePublishNow = async (postId: string) => {
    const post = scheduledPosts.find(p => p.id === postId);
    if (post) {
      const platformIds = post.platforms.map(p => p.id);
      const result = await publishPost(post.content, platformIds);
      
      if (result.success) {
        setScheduledPosts(prev => 
          prev.map(p => p.id === postId ? { ...p, status: "published" as const } : p)
        );
      } else {
        setScheduledPosts(prev => 
          prev.map(p => p.id === postId ? { ...p, status: "failed" as const } : p)
        );
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

        {/* No connected platforms warning */}
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
                      {connectedCount > 0 && (
                        <span className="ml-1">
                          ({connectedCount} platform{connectedCount !== 1 ? "s" : ""} connected)
                        </span>
                      )}
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

                    {/* Platform Selector - using real connected platforms */}
                    <PlatformSelector
                      platforms={postingPlatforms}
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
                      disabled={
                        !postContent.trim() || 
                        selectedPlatforms.length === 0 || 
                        posting ||
                        (scheduleType === "scheduled" && !scheduledDate)
                      }
                    >
                      {posting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : scheduleType === "now" ? (
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
                  {selectedPlatforms.length > 1 && previewPlatform && (
                    <span className="text-xs text-muted-foreground">
                      Showing {previewPlatform.name}
                    </span>
                  )}
                </div>

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

                {selectedPlatforms.length > 1 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedPlatforms.map(id => {
                      const platform = platforms.find(p => p.id === id);
                      if (!platform) return null;
                      return (
                        <Button
                          key={id}
                          variant={previewPlatform?.id === id ? "secondary" : "ghost"}
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
