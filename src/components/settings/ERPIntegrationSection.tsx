import { useState } from "react";
import { Plug, RefreshCw, ChevronDown, ChevronUp, Save, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface CredentialField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "password" | "url";
}

interface ERPSystem {
  id: string;
  name: string;
  description: string;
  logo: string;
  connected: boolean;
  lastSync?: string;
  modules: string[];
  credentialFields: CredentialField[];
}

const ERP_SYSTEMS: ERPSystem[] = [
  {
    id: "sap", name: "SAP S/4HANA", description: "Enterprise resource planning with procurement and supply chain modules",
    logo: "SAP", connected: false, modules: ["MM (Materials)", "SD (Sales)", "FI (Finance)"],
    credentialFields: [
      { key: "instance_url", label: "Instance URL", placeholder: "https://my-sap.s4hana.cloud.sap", type: "url" },
      { key: "client_id", label: "Client ID", placeholder: "Enter SAP client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", placeholder: "Enter SAP client secret", type: "password" },
      { key: "api_key", label: "API Key", placeholder: "Enter SAP API key", type: "password" },
    ],
  },
  {
    id: "oracle", name: "Oracle Cloud ERP", description: "Cloud-native ERP with procurement and sourcing capabilities",
    logo: "ORC", connected: true, lastSync: "2 hours ago", modules: ["Procurement", "Supply Chain", "Financials"],
    credentialFields: [
      { key: "instance_url", label: "Instance URL", placeholder: "https://mycompany.oraclecloud.com", type: "url" },
      { key: "username", label: "Username", placeholder: "Enter Oracle username", type: "text" },
      { key: "password", label: "Password", placeholder: "Enter Oracle password", type: "password" },
      { key: "api_key", label: "REST API Key", placeholder: "Enter Oracle REST API key", type: "password" },
    ],
  },
  {
    id: "dynamics", name: "Microsoft Dynamics 365", description: "Integrated business applications for finance and operations",
    logo: "D365", connected: false, modules: ["Supply Chain", "Finance", "Commerce"],
    credentialFields: [
      { key: "instance_url", label: "Environment URL", placeholder: "https://myorg.crm.dynamics.com", type: "url" },
      { key: "tenant_id", label: "Tenant ID", placeholder: "Enter Azure AD tenant ID", type: "text" },
      { key: "client_id", label: "Application (Client) ID", placeholder: "Enter app registration client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", placeholder: "Enter app registration secret", type: "password" },
    ],
  },
  {
    id: "netsuite", name: "Oracle NetSuite", description: "Cloud business management suite for growing companies",
    logo: "NS", connected: false, modules: ["Procurement", "Inventory", "Financials"],
    credentialFields: [
      { key: "account_id", label: "Account ID", placeholder: "Enter NetSuite account ID (e.g. 1234567)", type: "text" },
      { key: "consumer_key", label: "Consumer Key", placeholder: "Enter TBA consumer key", type: "password" },
      { key: "consumer_secret", label: "Consumer Secret", placeholder: "Enter TBA consumer secret", type: "password" },
      { key: "token_id", label: "Token ID", placeholder: "Enter token ID", type: "password" },
      { key: "token_secret", label: "Token Secret", placeholder: "Enter token secret", type: "password" },
    ],
  },
  {
    id: "odoo", name: "Odoo ERP", description: "Open-source modular ERP with purchasing, inventory, and manufacturing",
    logo: "ODO", connected: false, modules: ["Purchase", "Inventory", "Manufacturing", "Accounting"],
    credentialFields: [
      { key: "instance_url", label: "Odoo Instance URL", placeholder: "https://mycompany.odoo.com", type: "url" },
      { key: "database", label: "Database Name", placeholder: "Enter Odoo database name", type: "text" },
      { key: "username", label: "Username / Email", placeholder: "admin@mycompany.com", type: "text" },
      { key: "api_key", label: "API Key", placeholder: "Enter Odoo API key", type: "password" },
    ],
  },
];

export function ERPIntegrationSection() {
  const { t } = useTranslation();
  const [systems, setSystems] = useState(ERP_SYSTEMS);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, Record<string, string>>>({});
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const toggleConnection = (id: string) => {
    setSystems((prev) => prev.map((s) => s.id === id ? { ...s, connected: !s.connected, lastSync: !s.connected ? "Just now" : undefined } : s));
    const sys = systems.find((s) => s.id === id);
    if (sys?.connected) { toast.info(`Disconnected from ${sys.name}`); setExpandedId(null); }
    else { toast.success(`Connected to ${sys?.name}`); setExpandedId(id); }
  };

  const handleSync = (id: string) => {
    setSyncing(id);
    setTimeout(() => {
      setSyncing(null);
      setSystems((prev) => prev.map((s) => s.id === id ? { ...s, lastSync: "Just now" } : s));
      toast.success("Data synced successfully");
    }, 2000);
  };

  const updateCredential = (systemId: string, fieldKey: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [systemId]: { ...prev[systemId], [fieldKey]: value } }));
  };

  const toggleFieldVisibility = (fieldId: string) => {
    setVisibleFields((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const handleSaveCredentials = (systemId: string) => {
    const sys = systems.find((s) => s.id === systemId);
    const creds = credentials[systemId] || {};
    const missing = sys?.credentialFields.filter((f) => !creds[f.key]?.trim());
    if (missing && missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setSaving(systemId);
    setTimeout(() => {
      setSaving(null);
      toast.success(`${sys?.name} credentials saved securely`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><Plug className="h-5 w-5" /> {t("erp.title")}</h3>
        <p className="text-sm text-muted-foreground mt-1">{t("erp.description")}</p>
      </div>

      <div className="grid gap-4">
        {systems.map((sys) => (
          <Card key={sys.id} className={sys.connected ? "border-primary/30" : ""}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                  {sys.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{sys.name}</h4>
                    {sys.connected ? (
                      <Badge className="text-xs bg-success/10 text-success border-success/30">{t("erp.connected")}</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">{t("erp.notConnected")}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{sys.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {sys.modules.map((m) => <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>)}
                  </div>
                  {sys.lastSync && <p className="text-xs text-muted-foreground mt-2">{t("erp.lastSync", { time: sys.lastSync })}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Switch checked={sys.connected} onCheckedChange={() => toggleConnection(sys.id)} />
                  <div className="flex gap-1">
                    {sys.connected && (
                      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => handleSync(sys.id)} disabled={syncing === sys.id}>
                        <RefreshCw className={`h-3 w-3 ${syncing === sys.id ? "animate-spin" : ""}`} />
                        {syncing === sys.id ? t("erp.syncing") : t("erp.sync")}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setExpandedId(expandedId === sys.id ? null : sys.id)}>
                      {expandedId === sys.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {t("erp.credentials")}
                    </Button>
                  </div>
                </div>
              </div>

              {expandedId === sys.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <p className="text-xs text-muted-foreground">{t("erp.enterCredentials", { name: sys.name })}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {sys.credentialFields.map((field) => {
                      const fieldId = `${sys.id}-${field.key}`;
                      const isPassword = field.type === "password";
                      const isVisible = visibleFields[fieldId];
                      return (
                        <div key={field.key} className="space-y-1.5">
                          <Label htmlFor={fieldId} className="text-xs">{field.label}</Label>
                          <div className="relative">
                            <Input
                              id={fieldId}
                              type={isPassword && !isVisible ? "password" : "text"}
                              placeholder={field.placeholder}
                              value={credentials[sys.id]?.[field.key] || ""}
                              onChange={(e) => updateCredential(sys.id, field.key, e.target.value)}
                              className="text-sm pe-9"
                            />
                            {isPassword && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute end-0 top-0 h-full w-9"
                                onClick={() => toggleFieldVisibility(fieldId)}
                              >
                                {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button size="sm" className="gap-1.5" onClick={() => handleSaveCredentials(sys.id)} disabled={saving === sys.id}>
                      <Save className="h-3.5 w-3.5" />
                      {saving === sys.id ? t("erp.saving") : t("erp.saveCredentials")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">{t("erp.needDifferent")} <Button variant="link" className="p-0 h-auto text-primary">{t("erp.contactUs")}</Button> {t("erp.toRequest")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
