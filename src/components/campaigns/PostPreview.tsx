import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Repeat2, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostPreviewProps {
  content: string;
  platformId: string;
  platformName: string;
  platformIcon: string;
  imageUrl?: string | null;
}

export function PostPreview({ content, platformId, platformName, platformIcon, imageUrl }: PostPreviewProps) {
  const truncateForPlatform = (text: string, platform: string) => {
    const limits: Record<string, number> = {
      twitter: 280,
      threads: 500,
      pinterest: 500,
      instagram: 2200,
      linkedin: 3000,
      tiktok: 2200,
      youtube: 5000,
      facebook: 63206,
    };
    const limit = limits[platform] || 280;
    if (text.length <= limit) return text;
    return text.slice(0, limit - 3) + "...";
  };

  const displayContent = truncateForPlatform(content, platformId);

  // Platform-specific styling
  const getPreviewStyle = () => {
    switch (platformId) {
      case "twitter":
        return "bg-black text-white";
      case "linkedin":
        return "bg-white text-gray-900 border";
      case "instagram":
        return "bg-white text-gray-900 border";
      case "facebook":
        return "bg-white text-gray-900 border";
      default:
        return "bg-card text-card-foreground border";
    }
  };

  const getActionIcons = () => {
    switch (platformId) {
      case "twitter":
        return (
          <div className="flex items-center justify-between text-gray-500 mt-3">
            <button className="flex items-center gap-1 hover:text-blue-400">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-400">
              <Repeat2 className="h-4 w-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-pink-400">
              <Heart className="h-4 w-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-400">
              <Bookmark className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-1 hover:text-blue-400">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        );
      case "linkedin":
      case "facebook":
        return (
          <div className="flex items-center gap-6 border-t pt-3 mt-3 text-gray-500">
            <button className="flex items-center gap-1 hover:text-blue-600">
              <Heart className="h-4 w-4" />
              <span className="text-xs">Like</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-600">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Comment</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-600">
              <Share2 className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </button>
          </div>
        );
      case "instagram":
        return (
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              <Heart className="h-6 w-6" />
              <MessageCircle className="h-6 w-6" />
              <Share2 className="h-6 w-6" />
            </div>
            <Bookmark className="h-6 w-6" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl p-4 shadow-sm", getPreviewStyle())}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
          {platformIcon}
        </div>
        <div>
          <p className="font-semibold text-sm">Your Business</p>
          <p className="text-xs text-muted-foreground">@yourbusiness • Just now</p>
        </div>
      </div>

      {/* Content */}
      <div className="text-sm whitespace-pre-wrap break-words">
        {displayContent || (
          <span className="text-muted-foreground italic">Your post preview will appear here...</span>
        )}
      </div>

      {/* Media */}
      {imageUrl ? (
        <div className="mt-3 aspect-video rounded-lg overflow-hidden">
          <img src={imageUrl} alt="Post media" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="mt-3 aspect-video rounded-lg bg-muted/50 flex items-center justify-center border border-dashed">
          <span className="text-xs text-muted-foreground">Media preview</span>
        </div>
      )}

      {/* Platform-specific actions */}
      {getActionIcons()}

      {/* Platform badge */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Preview for {platformName}
        </p>
      </div>
    </motion.div>
  );
}
