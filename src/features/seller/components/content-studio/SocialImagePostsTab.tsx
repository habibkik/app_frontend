import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ImageIcon, Send } from "lucide-react";
import { toast } from "sonner";
import { useContentStudioStore } from "@/stores/contentStudioStore";
import type { SocialImagePost, GeneratedImage } from "./types";
import { Instagram, Facebook, Linkedin, Twitter } from "lucide-react";

const PlatformIcon = ({ platform, className }: { platform: string; className?: string }) => {
  switch (platform) {
    case "instagram": return <Instagram className={className} />;
    case "facebook": return <Facebook className={className} />;
    case "linkedin": return <Linkedin className={className} />;
    case "twitter": return <Twitter className={className} />;
    case "tiktok": return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    );
    default: return null;
  }
};

interface Props {
  posts: SocialImagePost[];
  images: GeneratedImage[];
}

export const SocialImagePostsTab: React.FC<Props> = ({ posts, images }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const setPendingPublisherPost = useContentStudioStore((s) => s.setPendingPublisherPost);
  const setPendingBatchPosts = useContentStudioStore((s) => s.setPendingBatchPosts);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getImage = (imageId: string) => images.find((i) => i.id === imageId);

  const buildFullText = (post: SocialImagePost) =>
    `${post.hook}\n\n${post.caption}\n\n${post.cta}\n\n${post.hashtags.map((h) => `#${h}`).join(" ")}`;

  const handleSendToPublisher = (post: SocialImagePost) => {
    setPendingPublisherPost({
      content: buildFullText(post),
      platform: post.platform,
    });
    toast.success(`Sending ${post.platform} post to Publisher`);
    navigate("/dashboard/publisher");
  };

  const handleSendAllToPublisher = () => {
    if (posts.length === 0) return;
    const batchPosts = posts.map((post) => ({
      content: buildFullText(post),
      platform: post.platform,
    }));
    setPendingBatchPosts(batchPosts);
    toast.success("Sending all posts as a batch campaign to Publisher");
    navigate("/dashboard/publisher");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold">Social Media Posts with Image</h3>
          <p className="text-sm text-muted-foreground">
            5 platform-optimized posts with attached generated images.
          </p>
        </div>
        {posts.length > 0 && (
          <Button size="sm" onClick={handleSendAllToPublisher}>
            <Send className="h-3 w-3 mr-1" /> Send All to Publisher
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => {
          const img = getImage(post.imageId);
          const fullText = buildFullText(post);
          return (
            <Card key={post.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={post.platform} className="h-4 w-4" />
                  <CardTitle className="text-sm capitalize">{post.platform}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {img?.imageUrl ? (
                  <img
                    src={img.imageUrl}
                    alt={`${post.platform} post`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">Hook</Badge>
                  <p className="text-sm font-medium">{post.hook}</p>
                </div>
                <p className="text-sm text-muted-foreground">{post.caption}</p>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-xs">CTA</Badge>
                  <p className="text-sm font-semibold text-primary">{post.cta}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map((h) => (
                    <Badge key={h} variant="outline" className="text-xs">
                      #{h}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleCopy(fullText, post.id)}
                  >
                    {copiedId === post.id ? (
                      <><Check className="h-3 w-3 mr-1" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3 mr-1" /> Copy</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSendToPublisher(post)}
                  >
                    <Send className="h-3 w-3 mr-1" /> Publish
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
