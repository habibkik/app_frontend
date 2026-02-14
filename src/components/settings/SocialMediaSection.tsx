import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Check, X, ExternalLink, Loader2, ChevronDown, ChevronRight, Info } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  telegram: "https://t.me/BotFather",
};

const platformSetupGuides: Record<string, { steps: string[]; tips?: string }> = {
  facebook: {
    steps: [
      "Go to developers.facebook.com and log in with your Facebook account",
      "Click 'My Apps' → 'Create App' → Name it '[Your Business] Trade Bot' → Select 'Business' type",
      "Add 'Messenger' and 'Instagram Graph API' products to your app",
      "Go to your Facebook Page → Settings → About → Copy your Page ID",
      "In the developer portal, go to Tools → Access Token Debugger → Get User Token",
      "Select your Page and copy the generated token (valid 60 days)",
      "Paste the Page ID and Access Token in the form below",
    ],
    tips: "The token expires after 60 days. You'll need to regenerate it periodically.",
  },
  instagram: {
    steps: [
      "Ensure your Instagram account is a Business or Creator account (Settings → Account → Switch to Professional)",
      "Link your Instagram to a Facebook Page (Settings → Linked Accounts → Facebook)",
      "Go to Meta Business Suite (business.facebook.com) → Settings → Instagram accounts",
      "Copy your Instagram Business Account ID from the settings",
      "Use the same Facebook Access Token from your Facebook app setup",
      "Paste Account ID and Access Token below",
    ],
    tips: "Instagram API uses Facebook's token. Set up Facebook first for easier integration.",
  },
  twitter: {
    steps: [
      "Go to developer.twitter.com and sign up for a developer account",
      "Create a new Project and App in the developer portal",
      "Under 'Keys and Tokens', generate Consumer Keys (API Key & Secret)",
      "Generate Access Token and Access Token Secret",
      "Copy all 4 credentials and paste them below",
    ],
    tips: "Apply for Elevated access if you need higher rate limits.",
  },
  whatsapp: {
    steps: [
      "Go to business.whatsapp.com and sign up for WhatsApp Business",
      "Verify your business phone number",
      "In Meta Developers portal, add 'WhatsApp Business Messaging API' to your app",
      "Copy your Phone Number ID from the WhatsApp settings",
      "Generate an API Access Token (valid 60 days)",
      "Create message templates for automated outreach (requires Meta approval)",
      "Paste Phone Number ID and Access Token below",
    ],
    tips: "WhatsApp requires pre-approved message templates for bulk messaging. Plan templates ahead.",
  },
  tiktok: {
    steps: [
      "Go to developers.tiktok.com and create a developer account",
      "Create a new app and request 'TikTok Shop' scope access",
      "Set up TikTok Shop via Creator Center → Shops (if selling)",
      "Generate your API credentials from the developer portal",
      "Paste the Access Token below",
    ],
    tips: "TikTok Shop API access may require manual approval. Some posting features need Creator status.",
  },
  linkedin: {
    steps: [
      "Go to linkedin.com/developers/apps and create a new app",
      "Request the 'Share on LinkedIn' and 'Sign In with LinkedIn' permissions",
      "Under Auth tab, generate an OAuth 2.0 Access Token",
      "Copy and paste the token below",
    ],
  },
  youtube: {
    steps: [
      "Go to console.cloud.google.com and create a new project",
      "Enable the YouTube Data API v3",
      "Go to Credentials → Create OAuth 2.0 Client ID",
      "Generate and copy the Access Token",
      "Paste the token below",
    ],
  },
  pinterest: {
    steps: [
      "Go to developers.pinterest.com and create a new app",
      "Request access to the Pinterest API",
      "Generate an Access Token from your app settings",
      "Paste the token below",
    ],
  },
  telegram: {
    steps: [
      "Open Telegram and search for @BotFather",
      "Send /start then /newbot to create a new bot",
      "Choose a name (e.g., '[Company] Trade Bot') and username",
      "BotFather will give you a Bot Token — copy it",
      "Paste the Bot Token below",
    ],
    tips: "Your bot can send messages to customers who start a conversation with it first.",
  },
};

export function SocialMediaSection() {
  const { platforms, loading, connecting, connectPlatform, disconnectPlatform } = useSocialCredentials();
  const [configuringPlatform, setConfiguringPlatform] = useState<SocialPlatform | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showGuide, setShowGuide] = useState(true);

  const handleConnect = (platform: SocialPlatform) => {
    setConfiguringPlatform(platform);
    setCredentials({});
    setShowGuide(true);
  };

  const handleDisconnect = async (platformId: string) => {
    await disconnectPlatform(platformId);
  };

  const handleSaveConnection = async () => {
    if (!configuringPlatform) return;
    const missingFields = configuringPlatform.requiredFields.filter(
      (field) => !credentials[field.key]?.trim()
    );
    if (missingFields.length > 0) return;

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
          <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" />Social Media Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (<Skeleton key={i} className="h-20 w-full" />))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const guide = configuringPlatform ? platformSetupGuides[configuringPlatform.id] : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" />Social Media Integrations</CardTitle>
          <CardDescription>Connect your social media accounts to post content and manage messages from your own accounts</CardDescription>
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
                        <Check className="h-3 w-3" />{platform.username}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {platform.connected ? (
                    <Button variant="outline" size="sm" onClick={() => handleDisconnect(platform.id)}>
                      <X className="h-4 w-4 mr-1" />Disconnect
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleConnect(platform)}>Connect</Button>
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
            <CardDescription>These accounts are ready for posting and messaging</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {platforms.filter((p) => p.connected).map((platform) => (
                <Badge key={platform.id} variant="secondary" className="text-sm py-1 px-3">
                  <span className="mr-2">{platform.icon}</span>
                  {platform.name}
                  {platform.username && <span className="ml-1 text-muted-foreground">({platform.username})</span>}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Dialog with Setup Guide */}
      <Dialog open={!!configuringPlatform} onOpenChange={() => setConfiguringPlatform(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
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

          {/* Setup Guide */}
          {guide && (
            <Collapsible open={showGuide} onOpenChange={setShowGuide}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-sm mb-2 h-auto py-2">
                  <span className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Setup Guide — How to get your credentials
                  </span>
                  {showGuide ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
                  {guide.steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <p className="text-sm text-muted-foreground">{step}</p>
                    </div>
                  ))}
                  {guide.tips && (
                    <div className="mt-3 p-3 border rounded bg-background text-sm text-muted-foreground">
                      💡 <strong>Tip:</strong> {guide.tips}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="space-y-4">
            {configuringPlatform?.requiredFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type="password"
                  placeholder={field.placeholder}
                  value={credentials[field.key] || ""}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))}
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
                Open {configuringPlatform?.name} Developer Portal
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfiguringPlatform(null)}>Cancel</Button>
            <Button onClick={handleSaveConnection} disabled={connecting}>
              {connecting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting...</>
              ) : (
                <><Check className="h-4 w-4 mr-2" />Connect</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
