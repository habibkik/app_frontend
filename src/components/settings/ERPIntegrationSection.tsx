import { useState } from "react";
import { Plug, Check, X, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ERPSystem {
  id: string;
  name: string;
  description: string;
  logo: string;
  connected: boolean;
  lastSync?: string;
  modules: string[];
}

const ERP_SYSTEMS: ERPSystem[] = [
  {
    id: "sap", name: "SAP S/4HANA", description: "Enterprise resource planning with procurement and supply chain modules",
    logo: "SAP", connected: false, modules: ["MM (Materials)", "SD (Sales)", "FI (Finance)"],
  },
  {
    id: "oracle", name: "Oracle Cloud ERP", description: "Cloud-native ERP with procurement and sourcing capabilities",
    logo: "ORC", connected: true, lastSync: "2 hours ago", modules: ["Procurement", "Supply Chain", "Financials"],
  },
  {
    id: "dynamics", name: "Microsoft Dynamics 365", description: "Integrated business applications for finance and operations",
    logo: "D365", connected: false, modules: ["Supply Chain", "Finance", "Commerce"],
  },
  {
    id: "netsuite", name: "Oracle NetSuite", description: "Cloud business management suite for growing companies",
    logo: "NS", connected: false, modules: ["Procurement", "Inventory", "Financials"],
  },
  {
    id: "odoo", name: "Odoo ERP", description: "Open-source modular ERP with purchasing, inventory, and manufacturing",
    logo: "ODO", connected: false, modules: ["Purchase", "Inventory", "Manufacturing", "Accounting"],
  },
];

export function ERPIntegrationSection() {
  const [systems, setSystems] = useState(ERP_SYSTEMS);
  const [syncing, setSyncing] = useState<string | null>(null);

  const toggleConnection = (id: string) => {
    setSystems((prev) => prev.map((s) => s.id === id ? { ...s, connected: !s.connected, lastSync: !s.connected ? "Just now" : undefined } : s));
    const sys = systems.find((s) => s.id === id);
    if (sys?.connected) toast.info(`Disconnected from ${sys.name}`);
    else toast.success(`Connected to ${sys?.name}`);
  };

  const handleSync = (id: string) => {
    setSyncing(id);
    setTimeout(() => {
      setSyncing(null);
      setSystems((prev) => prev.map((s) => s.id === id ? { ...s, lastSync: "Just now" } : s));
      toast.success("Data synced successfully");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><Plug className="h-5 w-5" /> ERP Integrations</h3>
        <p className="text-sm text-muted-foreground mt-1">Connect your ERP system for bi-directional data sync including POs, invoices, and inventory.</p>
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
                      <Badge className="text-xs bg-success/10 text-success border-success/30">Connected</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Not Connected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{sys.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {sys.modules.map((m) => <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>)}
                  </div>
                  {sys.lastSync && <p className="text-xs text-muted-foreground mt-2">Last sync: {sys.lastSync}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Switch checked={sys.connected} onCheckedChange={() => toggleConnection(sys.id)} />
                  {sys.connected && (
                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => handleSync(sys.id)} disabled={syncing === sys.id}>
                      <RefreshCw className={`h-3 w-3 ${syncing === sys.id ? "animate-spin" : ""}`} />
                      {syncing === sys.id ? "Syncing..." : "Sync Now"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Need a different ERP? <Button variant="link" className="p-0 h-auto text-primary">Contact us</Button> to request an integration.</p>
        </CardContent>
      </Card>
    </div>
  );
}
