import { useTranslation } from "react-i18next";
import { Plug, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const INTEGRATIONS = [
  { id: "slack", name: "Slack", connected: false, lastSync: null },
  { id: "gdrive", name: "Google Drive", connected: true, lastSync: "2 hours ago" },
  { id: "zapier", name: "Zapier", connected: false, lastSync: null },
  { id: "webhooks", name: "Custom Webhooks", connected: true, lastSync: "5 min ago" },
];

export function IntegrationsSection() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5" />
          {t("settings.integrations.title")}
        </CardTitle>
        <CardDescription>{t("settings.integrations.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {INTEGRATIONS.map((integration) => (
          <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Plug className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{integration.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={integration.connected ? "default" : "secondary"} className={integration.connected ? "bg-accent text-accent-foreground" : ""}>
                    {integration.connected ? t("settings.integrations.connected") : t("settings.integrations.notConnected")}
                  </Badge>
                  {integration.lastSync && (
                    <span className="text-xs text-muted-foreground">
                      {t("settings.integrations.lastSync")}: {integration.lastSync}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant={integration.connected ? "outline" : "default"} size="sm">
              {integration.connected ? (
                t("settings.integrations.disconnect")
              ) : (
                <><ExternalLink className="h-4 w-4 mr-1" />{t("settings.integrations.connect")}</>
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
