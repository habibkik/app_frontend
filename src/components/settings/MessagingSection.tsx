import { useState } from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Check, 
  X, 
  ExternalLink,
  Settings,
  Phone,
  MessageCircle,
  Bot,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MessagingPlatform {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  config?: {
    apiKey?: string;
    phoneNumber?: string;
    accountSid?: string;
    webhookUrl?: string;
  };
}

const initialPlatforms: MessagingPlatform[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Connect WhatsApp Business API for customer messaging",
    icon: "💬",
    connected: false,
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS and voice messaging platform",
    icon: "📱",
    connected: false,
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    description: "Create and manage Telegram bots",
    icon: "✈️",
    connected: false,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team communication and notifications",
    icon: "#",
    connected: false,
  },
  {
    id: "discord",
    name: "Discord",
    description: "Community messaging and webhooks",
    icon: "🎮",
    connected: false,
  },
  {
    id: "intercom",
    name: "Intercom",
    description: "Customer messaging platform",
    icon: "💭",
    connected: false,
  },
];

interface AutoResponseSettings {
  enabled: boolean;
  greetingMessage: string;
  awayMessage: string;
  responseDelay: number;
}

export function MessagingSection() {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<MessagingPlatform[]>(initialPlatforms);
  const [configuringPlatform, setConfiguringPlatform] = useState<MessagingPlatform | null>(null);
  const [autoResponse, setAutoResponse] = useState<AutoResponseSettings>({
    enabled: false,
    greetingMessage: "Hello! Thanks for reaching out. How can I help you today?",
    awayMessage: "We're currently away. We'll get back to you as soon as possible.",
    responseDelay: 5,
  });

  // Form state
  const [apiKey, setApiKey] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleConnect = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      setConfiguringPlatform(platform);
      setApiKey(platform.config?.apiKey || "");
      setPhoneNumber(platform.config?.phoneNumber || "");
      setAccountSid(platform.config?.accountSid || "");
      setWebhookUrl(platform.config?.webhookUrl || "");
    }
  };

  const handleDisconnect = (platformId: string) => {
    setPlatforms(prev => 
      prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: false, config: undefined }
          : p
      )
    );
    toast({
      title: "Disconnected",
      description: "Messaging platform has been disconnected",
    });
  };

  const handleSaveConnection = () => {
    if (!configuringPlatform) return;

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key or token",
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
              config: { apiKey, phoneNumber, accountSid, webhookUrl },
            }
          : p
      )
    );

    setConfiguringPlatform(null);
    resetForm();
    
    toast({
      title: "Connected!",
      description: `${configuringPlatform.name} has been connected successfully`,
    });
  };

  const resetForm = () => {
    setApiKey("");
    setPhoneNumber("");
    setAccountSid("");
    setWebhookUrl("");
  };

  const handleTestMessage = () => {
    toast({
      title: "Test Message Sent",
      description: "Check your messaging platform for the test message",
    });
  };

  const getConfigFields = (platformId: string) => {
    switch (platformId) {
      case "whatsapp":
        return ["apiKey", "phoneNumber"];
      case "twilio":
        return ["accountSid", "apiKey", "phoneNumber"];
      case "telegram":
        return ["apiKey"];
      case "slack":
        return ["apiKey", "webhookUrl"];
      case "discord":
        return ["webhookUrl"];
      case "intercom":
        return ["apiKey"];
      default:
        return ["apiKey"];
    }
  };

  return (
    <div className="space-y-6">
      {/* Messaging Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messaging Platforms
          </CardTitle>
          <CardDescription>
            Connect messaging platforms for WhatsApp, SMS, and team notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 border rounded-lg ${
                  platform.connected ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                      {platform.icon}
                    </div>
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {platform.name}
                        {platform.connected && (
                          <Badge variant="outline" className="bg-success/10 text-success text-xs">
                            Active
                          </Badge>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground">{platform.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {platform.connected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleConnect(platform.id)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(platform.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
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

      {/* Auto-Response Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Auto-Response Settings
          </CardTitle>
          <CardDescription>
            Configure automatic responses for incoming messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Auto-Response</Label>
              <p className="text-sm text-muted-foreground">
                Automatically respond to incoming messages
              </p>
            </div>
            <Switch
              checked={autoResponse.enabled}
              onCheckedChange={(checked) => 
                setAutoResponse(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {autoResponse.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="greeting">Greeting Message</Label>
                <Textarea
                  id="greeting"
                  placeholder="Hello! How can I help you?"
                  value={autoResponse.greetingMessage}
                  onChange={(e) => 
                    setAutoResponse(prev => ({ ...prev, greetingMessage: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="away">Away Message</Label>
                <Textarea
                  id="away"
                  placeholder="We're currently away..."
                  value={autoResponse.awayMessage}
                  onChange={(e) => 
                    setAutoResponse(prev => ({ ...prev, awayMessage: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delay">Response Delay (seconds)</Label>
                <Input
                  id="delay"
                  type="number"
                  min={0}
                  max={60}
                  value={autoResponse.responseDelay}
                  onChange={(e) => 
                    setAutoResponse(prev => ({ ...prev, responseDelay: parseInt(e.target.value) || 0 }))
                  }
                  className="w-24"
                />
              </div>
            </motion.div>
          )}

          {platforms.some(p => p.connected) && (
            <div className="pt-4 border-t">
              <Button onClick={handleTestMessage} variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Test Message
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={!!configuringPlatform} onOpenChange={() => setConfiguringPlatform(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Configure {configuringPlatform?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your {configuringPlatform?.name} API credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {configuringPlatform && getConfigFields(configuringPlatform.id).includes("accountSid") && (
              <div className="space-y-2">
                <Label htmlFor="account-sid">Account SID</Label>
                <Input
                  id="account-sid"
                  placeholder="Enter your Account SID"
                  value={accountSid}
                  onChange={(e) => setAccountSid(e.target.value)}
                />
              </div>
            )}

            {configuringPlatform && getConfigFields(configuringPlatform.id).includes("apiKey") && (
              <div className="space-y-2">
                <Label htmlFor="msg-api-key">
                  {configuringPlatform.id === "telegram" ? "Bot Token" : "API Key / Auth Token"}
                </Label>
                <Input
                  id="msg-api-key"
                  type="password"
                  placeholder="Enter your API key or token"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            )}

            {configuringPlatform && getConfigFields(configuringPlatform.id).includes("phoneNumber") && (
              <div className="space-y-2">
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            )}

            {configuringPlatform && getConfigFields(configuringPlatform.id).includes("webhookUrl") && (
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <a 
                href="#" 
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                How to get API credentials <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfiguringPlatform(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConnection}>
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
