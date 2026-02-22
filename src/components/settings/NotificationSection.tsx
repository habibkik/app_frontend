import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      title: t("notifications.settingsUpdated"),
      description: t("notifications.settingsUpdatedDesc"),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t("notifications.emailNotifications", "Email Notifications")}
          </CardTitle>
          <CardDescription>{t("notifications.emailNotificationsDesc", "Email Notifications Description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("notifications.newMessages", "New Messages")}</Label>
              <p className="text-sm text-muted-foreground">{t("notifications.newMessagesEmailDesc", "New Messages Email Description")}</p>
            </div>
            <Switch checked={settings.email.newMessage} onCheckedChange={(checked) => updateSetting("email", "newMessage", checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("notifications.rfqUpdates", "RFQ Updates")}</Label>
              <p className="text-sm text-muted-foreground">{t("notifications.rfqUpdatesEmailDesc", "RFQ Updates Email Description")}</p>
            </div>
            <Switch checked={settings.email.rfqUpdates} onCheckedChange={(checked) => updateSetting("email", "rfqUpdates", checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("notifications.supplierAlerts", "Supplier Alerts")}</Label>
              <p className="text-sm text-muted-foreground">{t("notifications.supplierAlertsEmailDesc", "Supplier Alerts Email Description")}</p>
            </div>
            <Switch checked={settings.email.supplierAlerts} onCheckedChange={(checked) => updateSetting("email", "supplierAlerts", checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("notifications.weeklyReport", "Weekly Report")}</Label>
              <p className="text-sm text-muted-foreground">{t("notifications.weeklyReportDesc", "Weekly Report Description")}</p>
            </div>
            <Switch checked={settings.email.weeklyReport} onCheckedChange={(checked) => updateSetting("email", "weeklyReport", checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("notifications.marketingTips", "Marketing Tips")}</Label>
              <p className="text-sm text-muted-foreground">{t("notifications.marketingTipsDesc", "Marketing Tips Description")}</p>
            </div>
            <Switch checked={settings.email.marketing} onCheckedChange={(checked) => updateSetting("email", "marketing", checked)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            {t("notifications.pushNotifications", "Push Notifications")}
          </CardTitle>
          <CardDescription>{t("notifications.pushNotificationsDesc", "Push Notifications Description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("notifications.newMessages", "New Messages")}</Label>
              <p className="text-sm text-muted-foreground">{t("notifications.newMessagesPushDesc", "New Messages Push Description")}</p>
            </div>
            <Switch checked={settings.push.newMessage} onCheckedChange={(checked) => updateSetting("push", "newMessage", checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("notifications.rfqUpdates", "RFQ Updates")}</Label>
              <p className="text-sm text-muted-foreground">{t("notifications.rfqUpdatesPushDesc", "RFQ Updates Push Description")}</p>
            </div>
            <Switch checked={settings.push.rfqUpdates} onCheckedChange={(checked) => updateSetting("push", "rfqUpdates", checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("notifications.supplierAlerts", "Supplier Alerts")}</Label>
              <p className="text-sm text-muted-foreground">{t("notifications.supplierAlertsPushDesc", "Supplier Alerts Push Description")}</p>
            </div>
            <Switch checked={settings.push.supplierAlerts} onCheckedChange={(checked) => updateSetting("push", "supplierAlerts", checked)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            {t("notifications.smsNotifications", "SMS Notifications")}
          </CardTitle>
          <CardDescription>{t("notifications.smsNotificationsDesc", "SMS Notifications Description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("notifications.urgentAlerts", "Urgent Alerts")}</Label>
              <p className="text-sm text-muted-foreground">{t("notifications.urgentAlertsDesc", "Urgent Alerts Description")}</p>
            </div>
            <Switch checked={settings.sms.urgentAlerts} onCheckedChange={(checked) => updateSetting("sms", "urgentAlerts", checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("notifications.rfqDeadlines", "RFQ Deadlines")}</Label>
              <p className="text-sm text-muted-foreground">{t("notifications.rfqDeadlinesDesc", "RFQ Deadlines Description")}</p>
            </div>
            <Switch checked={settings.sms.rfqDeadlines} onCheckedChange={(checked) => updateSetting("sms", "rfqDeadlines", checked)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
