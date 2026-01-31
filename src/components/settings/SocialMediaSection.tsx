import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Share2, 
  Check, 
  X, 
  ExternalLink,
  RefreshCw,
  Settings,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  username?: string;
  features: {
    posting: boolean;
    messaging: boolean;
    analytics: boolean;
  };
  apiKey?: string;
  apiSecret?: string;
}

const initialPlatforms: SocialPlatform[] = [
  {
    id: "twitter",
    name: "Twitter / X",
    icon: "𝕏",
    connected: false,
    features: { posting: true, messaging: true, analytics: true },
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "f",
    connected: false,
    features: { posting: true, messaging: true, analytics: true },
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📷",
    connected: false,
    features: { posting: true, messaging: true, analytics: true },
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "in",
    connected: false,
    features: { posting: true, messaging: true, analytics: true },
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "♪",
    connected: false,
    features: { posting: true, messaging: false, analytics: true },
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "▶",
    connected: false,
    features: { posting: true, messaging: false, analytics: true },
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "📌",
    connected: false,
    features: { posting: true, messaging: false, analytics: true },
  },
  {
    id: "threads",
    name: "Threads",
    icon: "@",
    connected: false,
    features: { posting: true, messaging: false, analytics: false },
  },
];

export function SocialMediaSection() {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(initialPlatforms);
  const [configuringPlatform, setConfiguringPlatform] = useState<SocialPlatform | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const handleConnect = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      setConfiguringPlatform(platform);
      setApiKey(platform.apiKey || "");
      setApiSecret(platform.apiSecret || "");
    }
  };

  const handleDisconnect = (platformId: string) => {
    setPlatforms(prev => 
      prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: false, username: undefined, apiKey: undefined, apiSecret: undefined }
          : p
      )
    );
    toast({
      title: "Disconnected",
      description: "Social media account has been disconnected",
    });
  };

  const handleSaveConnection = () => {
    if (!configuringPlatform) return;

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key",
        variant: "destructive",
      });
      return;
    }

    setPlatforms(prev => 
      prev.map(p => 
        p.id === configuringPlatform.id 
          ? { 
              ...p, 
              connected: true, 
              username: "@connected_user",
              apiKey,
              apiSecret,
            }
          : p
      )
    );

    setConfiguringPlatform(null);
    setApiKey("");
    setApiSecret("");
    
    toast({
      title: "Connected!",
      description: `${configuringPlatform.name} has been connected successfully`,
    });
  };

  const toggleFeature = (platformId: string, feature: keyof SocialPlatform["features"]) => {
    setPlatforms(prev => 
      prev.map(p => 
        p.id === platformId 
          ? { ...p, features: { ...p.features, [feature]: !p.features[feature] } }
          : p
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Media Integrations
          </CardTitle>
          <CardDescription>
            Connect your social media accounts to post content and manage messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                    {platform.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{platform.name}</h4>
                    {platform.connected ? (
                      <p className="text-sm text-success flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {platform.username}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {platform.connected && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleConnect(platform.id)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                  {platform.connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(platform.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(platform.id)}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Settings</CardTitle>
          <CardDescription>
            Enable or disable specific features for each connected platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platforms.filter(p => p.connected).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Connect a social media account to configure features
              </p>
            ) : (
              platforms.filter(p => p.connected).map(platform => (
                <div key={platform.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{platform.icon}</span>
                    <h4 className="font-medium">{platform.name}</h4>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${platform.id}-posting`}>Auto Posting</Label>
                      <Switch
                        id={`${platform.id}-posting`}
                        checked={platform.features.posting}
                        onCheckedChange={() => toggleFeature(platform.id, "posting")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${platform.id}-messaging`}>Messaging</Label>
                      <Switch
                        id={`${platform.id}-messaging`}
                        checked={platform.features.messaging}
                        onCheckedChange={() => toggleFeature(platform.id, "messaging")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${platform.id}-analytics`}>Analytics</Label>
                      <Switch
                        id={`${platform.id}-analytics`}
                        checked={platform.features.analytics}
                        onCheckedChange={() => toggleFeature(platform.id, "analytics")}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={!!configuringPlatform} onOpenChange={() => setConfiguringPlatform(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Connect {configuringPlatform?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your API credentials to connect your {configuringPlatform?.name} account.
              You can find these in your {configuringPlatform?.name} developer portal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key / Consumer Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-secret">API Secret / Consumer Secret</Label>
              <Input
                id="api-secret"
                type="password"
                placeholder="Enter your API secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <a 
                href={`https://developer.${configuringPlatform?.id}.com`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Get API credentials <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfiguringPlatform(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConnection}>
              <Check className="h-4 w-4 mr-2" />
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
