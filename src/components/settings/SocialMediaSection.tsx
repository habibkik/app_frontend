import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Check, X, ExternalLink, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useSocialCredentials, SocialPlatform } from "@/hooks/useSocialCredentials";
import { Skeleton } from "@/components/ui/skeleton";

const developerPortalUrls: Record<string, string> = {
  twitter: "https://developer.twitter.com/en/portal/dashboard",
  facebook: "https://developers.facebook.com/apps",
  instagram: "https://developers.facebook.com/apps",
  linkedin: "https://www.linkedin.com/developers/apps",
  whatsapp: "https://developers.facebook.com/apps",
  tiktok: "https://developers.tiktok.com",
  youtube: "https://console.cloud.google.com/apis/credentials",
  pinterest: "https://developers.pinterest.com/apps",
};

export function SocialMediaSection() {
  const { platforms, loading, connecting, connectPlatform, disconnectPlatform } = useSocialCredentials();
  const [configuringPlatform, setConfiguringPlatform] = useState<SocialPlatform | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const handleConnect = (platform: SocialPlatform) => {
    setConfiguringPlatform(platform);
    setCredentials({});
  };

  const handleDisconnect = async (platformId: string) => {
    await disconnectPlatform(platformId);
  };

  const handleSaveConnection = async () => {
    if (!configuringPlatform) return;

    // Validate required fields
    const missingFields = configuringPlatform.requiredFields.filter(
      (field) => !credentials[field.key]?.trim()
    );

    if (missingFields.length > 0) {
      return; // The inputs will show validation states
    }

    const result = await connectPlatform(configuringPlatform.id, credentials);
    if (result.success) {
      setConfiguringPlatform(null);
      setCredentials({});
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Media Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Media Integrations
          </CardTitle>
          <CardDescription>
            Connect your social media accounts to post content and manage messages from your own accounts
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
                      <p className="text-sm text-primary flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {platform.username}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                    <Button size="sm" onClick={() => handleConnect(platform)}>
                      Connect
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connected Platforms Summary */}
      {platforms.some((p) => p.connected) && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>
              These accounts are ready for posting and messaging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {platforms
                .filter((p) => p.connected)
                .map((platform) => (
                  <Badge key={platform.id} variant="secondary" className="text-sm py-1 px-3">
                    <span className="mr-2">{platform.icon}</span>
                    {platform.name}
                    {platform.username && (
                      <span className="ml-1 text-muted-foreground">({platform.username})</span>
                    )}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Dialog */}
      <Dialog open={!!configuringPlatform} onOpenChange={() => setConfiguringPlatform(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{configuringPlatform?.icon}</span>
              Connect {configuringPlatform?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your API credentials to connect your {configuringPlatform?.name} account.
              Your credentials are stored securely and only you can access them.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {configuringPlatform?.requiredFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type="password"
                  placeholder={field.placeholder}
                  value={credentials[field.key] || ""}
                  onChange={(e) =>
                    setCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
              </div>
            ))}

            <div className="text-sm text-muted-foreground pt-2">
              <a
                href={developerPortalUrls[configuringPlatform?.id || ""] || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Get API credentials from {configuringPlatform?.name} Developer Portal
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfiguringPlatform(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConnection} disabled={connecting}>
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
