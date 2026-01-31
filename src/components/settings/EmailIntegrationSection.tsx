import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Check, 
  X, 
  ExternalLink,
  Settings,
  Send,
  Inbox,
  Clock,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  config?: {
    apiKey?: string;
    domain?: string;
    fromEmail?: string;
    fromName?: string;
  };
}

const initialProviders: EmailProvider[] = [
  {
    id: "resend",
    name: "Resend",
    description: "Modern email API for developers",
    icon: "📧",
    connected: false,
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Email delivery and marketing platform",
    icon: "✉️",
    connected: false,
  },
  {
    id: "mailgun",
    name: "Mailgun",
    description: "Email API service for developers",
    icon: "📬",
    connected: false,
  },
  {
    id: "postmark",
    name: "Postmark",
    description: "Fast and reliable transactional email",
    icon: "📮",
    connected: false,
  },
  {
    id: "ses",
    name: "Amazon SES",
    description: "Scalable email sending service",
    icon: "📨",
    connected: false,
  },
  {
    id: "smtp",
    name: "Custom SMTP",
    description: "Use your own SMTP server",
    icon: "🔧",
    connected: false,
  },
];

interface EmailSettings {
  autoResponder: boolean;
  emailNotifications: boolean;
  dailyDigest: boolean;
  digestTime: string;
}

export function EmailIntegrationSection() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<EmailProvider[]>(initialProviders);
  const [configuringProvider, setConfiguringProvider] = useState<EmailProvider | null>(null);
  const [settings, setSettings] = useState<EmailSettings>({
    autoResponder: false,
    emailNotifications: true,
    dailyDigest: false,
    digestTime: "09:00",
  });

  // Form state
  const [apiKey, setApiKey] = useState("");
  const [domain, setDomain] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");

  const handleConnect = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setConfiguringProvider(provider);
      setApiKey(provider.config?.apiKey || "");
      setDomain(provider.config?.domain || "");
      setFromEmail(provider.config?.fromEmail || "");
      setFromName(provider.config?.fromName || "");
    }
  };

  const handleDisconnect = (providerId: string) => {
    setProviders(prev => 
      prev.map(p => 
        p.id === providerId 
          ? { ...p, connected: false, config: undefined }
          : p
      )
    );
    toast({
      title: "Disconnected",
      description: "Email provider has been disconnected",
    });
  };

  const handleSaveConnection = () => {
    if (!configuringProvider) return;

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key",
        variant: "destructive",
      });
      return;
    }

    setProviders(prev => 
      prev.map(p => 
        p.id === configuringProvider.id 
          ? { 
              ...p, 
              connected: true,
              config: { apiKey, domain, fromEmail, fromName },
            }
          : p
      )
    );

    setConfiguringProvider(null);
    resetForm();
    
    toast({
      title: "Connected!",
      description: `${configuringProvider.name} has been connected successfully`,
    });
  };

  const resetForm = () => {
    setApiKey("");
    setDomain("");
    setFromEmail("");
    setFromName("");
  };

  const handleTestEmail = () => {
    toast({
      title: "Test Email Sent",
      description: "Check your inbox for the test email",
    });
  };

  const connectedProvider = providers.find(p => p.connected);

  return (
    <div className="space-y-6">
      {/* Email Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Providers
          </CardTitle>
          <CardDescription>
            Connect an email service provider to send transactional and marketing emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 border rounded-lg ${
                  provider.connected ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                      {provider.icon}
                    </div>
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {provider.name}
                        {provider.connected && (
                          <Badge variant="outline" className="bg-success/10 text-success text-xs">
                            Active
                          </Badge>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground">{provider.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {provider.connected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleConnect(provider.id)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(provider.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleConnect(provider.id)}
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

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Settings
          </CardTitle>
          <CardDescription>
            Configure email automation and notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Responder</Label>
              <p className="text-sm text-muted-foreground">
                Automatically reply to incoming emails when you're away
              </p>
            </div>
            <Switch
              checked={settings.autoResponder}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, autoResponder: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important updates
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, emailNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Digest</Label>
              <p className="text-sm text-muted-foreground">
                Get a daily summary of activity and insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              {settings.dailyDigest && (
                <Select 
                  value={settings.digestTime} 
                  onValueChange={(value) => setSettings(s => ({ ...s, digestTime: value }))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Switch
                checked={settings.dailyDigest}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, dailyDigest: checked }))}
              />
            </div>
          </div>

          {connectedProvider && (
            <div className="pt-4 border-t">
              <Button onClick={handleTestEmail} variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={!!configuringProvider} onOpenChange={() => setConfiguringProvider(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Configure {configuringProvider?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your {configuringProvider?.name} API credentials to start sending emails.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-api-key">API Key</Label>
              <Input
                id="email-api-key"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            {configuringProvider?.id !== "smtp" && (
              <div className="space-y-2">
                <Label htmlFor="email-domain">Domain (optional)</Label>
                <Input
                  id="email-domain"
                  placeholder="mail.yourdomain.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="from-email">From Email</Label>
              <Input
                id="from-email"
                type="email"
                placeholder="noreply@yourdomain.com"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input
                id="from-name"
                placeholder="Your Company Name"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfiguringProvider(null)}>
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
