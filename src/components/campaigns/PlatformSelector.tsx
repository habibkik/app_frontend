import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  maxLength?: number;
  supportsImages?: boolean;
  supportsVideos?: boolean;
  supportsScheduling?: boolean;
}

interface PlatformSelectorProps {
  platforms: Platform[];
  selectedPlatforms: string[];
  onTogglePlatform: (platformId: string) => void;
}

const platformDefaults: Record<string, Partial<Platform>> = {
  twitter: { maxLength: 280, supportsImages: true, supportsVideos: true, supportsScheduling: true },
  facebook: { maxLength: 63206, supportsImages: true, supportsVideos: true, supportsScheduling: true },
  instagram: { maxLength: 2200, supportsImages: true, supportsVideos: true, supportsScheduling: true },
  linkedin: { maxLength: 3000, supportsImages: true, supportsVideos: true, supportsScheduling: true },
  tiktok: { maxLength: 2200, supportsImages: false, supportsVideos: true, supportsScheduling: true },
  youtube: { maxLength: 5000, supportsImages: false, supportsVideos: true, supportsScheduling: true },
  pinterest: { maxLength: 500, supportsImages: true, supportsVideos: true, supportsScheduling: true },
  threads: { maxLength: 500, supportsImages: true, supportsVideos: true, supportsScheduling: false },
};

export function PlatformSelector({ 
  platforms, 
  selectedPlatforms, 
  onTogglePlatform 
}: PlatformSelectorProps) {
  const connectedPlatforms = platforms.filter(p => p.connected);
  const disconnectedPlatforms = platforms.filter(p => !p.connected);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Post to</h3>
        <Badge variant="secondary" className="text-xs">
          {selectedPlatforms.length} selected
        </Badge>
      </div>

      {connectedPlatforms.length === 0 ? (
        <div className="text-center py-6 border rounded-lg bg-muted/30">
          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No platforms connected yet.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Go to Settings → Social Media to connect your accounts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <TooltipProvider>
            {connectedPlatforms.map((platform, index) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              const defaults = platformDefaults[platform.id] || {};
              
              return (
                <Tooltip key={platform.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onTogglePlatform(platform.id)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <div className="text-2xl">{platform.icon}</div>
                      <span className="text-xs font-medium truncate w-full text-center">
                        {platform.name}
                      </span>
                      
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </motion.div>
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{platform.name}</p>
                      <p>Max {defaults.maxLength || 280} characters</p>
                      <div className="flex gap-2 text-muted-foreground">
                        {defaults.supportsImages && <span>📷 Images</span>}
                        {defaults.supportsVideos && <span>🎬 Videos</span>}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      )}

      {disconnectedPlatforms.length > 0 && connectedPlatforms.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2">Not connected:</p>
          <div className="flex flex-wrap gap-2">
            {disconnectedPlatforms.map((platform) => (
              <Badge key={platform.id} variant="outline" className="text-muted-foreground">
                <span className="mr-1">{platform.icon}</span>
                {platform.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
