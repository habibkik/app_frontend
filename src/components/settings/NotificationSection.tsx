import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone, Monitor } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  email: {
    newMessage: boolean;
    rfqUpdates: boolean;
    supplierAlerts: boolean;
    weeklyReport: boolean;
    marketing: boolean;
  };
  push: {
    newMessage: boolean;
    rfqUpdates: boolean;
    supplierAlerts: boolean;
  };
  sms: {
    urgentAlerts: boolean;
    rfqDeadlines: boolean;
  };
}

export function NotificationSection() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      newMessage: true,
      rfqUpdates: true,
      supplierAlerts: true,
      weeklyReport: true,
      marketing: false,
    },
    push: {
      newMessage: true,
      rfqUpdates: true,
      supplierAlerts: false,
    },
    sms: {
      urgentAlerts: true,
      rfqDeadlines: false,
    },
  });

  const updateSetting = (
    category: keyof NotificationSettings,
    key: string,
    value: boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved",
    });
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose what emails you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Messages</Label>
              <p className="text-sm text-muted-foreground">
                Receive an email when you get a new message
              </p>
            </div>
            <Switch
              checked={settings.email.newMessage}
              onCheckedChange={(checked) => updateSetting("email", "newMessage", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>RFQ Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about RFQ status changes
              </p>
            </div>
            <Switch
              checked={settings.email.rfqUpdates}
              onCheckedChange={(checked) => updateSetting("email", "rfqUpdates", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Supplier Alerts</Label>
              <p className="text-sm text-muted-foreground">
                New supplier matches and price updates
              </p>
            </div>
            <Switch
              checked={settings.email.supplierAlerts}
              onCheckedChange={(checked) => updateSetting("email", "supplierAlerts", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Report</Label>
              <p className="text-sm text-muted-foreground">
                Summary of your activity and insights
              </p>
            </div>
            <Switch
              checked={settings.email.weeklyReport}
              onCheckedChange={(checked) => updateSetting("email", "weeklyReport", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing & Tips</Label>
              <p className="text-sm text-muted-foreground">
                Product updates, tips, and special offers
              </p>
            </div>
            <Switch
              checked={settings.email.marketing}
              onCheckedChange={(checked) => updateSetting("email", "marketing", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Browser and desktop notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Messages</Label>
              <p className="text-sm text-muted-foreground">
                Show a notification for new messages
              </p>
            </div>
            <Switch
              checked={settings.push.newMessage}
              onCheckedChange={(checked) => updateSetting("push", "newMessage", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>RFQ Updates</Label>
              <p className="text-sm text-muted-foreground">
                Real-time RFQ status notifications
              </p>
            </div>
            <Switch
              checked={settings.push.rfqUpdates}
              onCheckedChange={(checked) => updateSetting("push", "rfqUpdates", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Supplier Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Instant alerts for supplier updates
              </p>
            </div>
            <Switch
              checked={settings.push.supplierAlerts}
              onCheckedChange={(checked) => updateSetting("push", "supplierAlerts", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Text message alerts for critical updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Urgent Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Critical updates that require immediate attention
              </p>
            </div>
            <Switch
              checked={settings.sms.urgentAlerts}
              onCheckedChange={(checked) => updateSetting("sms", "urgentAlerts", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>RFQ Deadlines</Label>
              <p className="text-sm text-muted-foreground">
                Reminders for approaching RFQ deadlines
              </p>
            </div>
            <Switch
              checked={settings.sms.rfqDeadlines}
              onCheckedChange={(checked) => updateSetting("sms", "rfqDeadlines", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
