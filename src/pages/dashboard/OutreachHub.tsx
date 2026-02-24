import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/features/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCheck, Send, Settings2, History } from "lucide-react";
import { useOutreachCampaignStore } from "@/stores/outreachCampaignStore";
import { OutreachCampaignCard } from "@/components/outreach/OutreachCampaignCard";
import { AutomationRulesPanel } from "@/components/outreach/AutomationRulesPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function OutreachHub() {
  const { toast } = useToast();
  const {
    campaigns,
    rules,
    loading,
    fetchCampaigns,
    fetchRules,
    approveCampaign,
    approveAll,
    updateCampaignMessage,
    deleteCampaign,
    addRule,
    updateRule,
    deleteRule,
  } = useOutreachCampaignStore();

  const [userId, setUserId] = useState("");

  useEffect(() => {
    fetchCampaigns();
    fetchRules();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [fetchCampaigns, fetchRules]);

  const groupedCampaigns = useMemo(() => {
    const map = new Map<string, typeof campaigns>();
    campaigns.forEach((c) => {
      const key = c.supplier_id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries());
  }, [campaigns]);

  const draftCount = campaigns.filter((c) => c.status === "draft").length;
  const sentCampaigns = campaigns.filter((c) => c.status === "sent" || c.status === "approved");

  const handleApproveAll = async () => {
    await approveAll();
    toast({ title: "All Approved", description: `${draftCount} campaigns approved.` });
  };

  const handleApproveAllForSupplier = async (ids: string[]) => {
    for (const id of ids) await approveCampaign(id);
    toast({ title: "Approved", description: `${ids.length} campaigns approved.` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Outreach Hub</h1>
            <p className="text-muted-foreground mt-1">
              Review, edit, and launch outreach campaigns across all channels
            </p>
          </div>
          {draftCount > 0 && (
            <Button onClick={handleApproveAll} className="gap-1.5">
              <CheckCheck className="h-4 w-4" />
              Approve All ({draftCount})
            </Button>
          )}
        </div>

        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns" className="gap-1.5">
              <Send className="h-4 w-4" />
              Prepared Campaigns
              {draftCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{draftCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-1.5">
              <Settings2 className="h-4 w-4" />
              Automation Rules
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))
            ) : groupedCampaigns.length === 0 ? (
              <div className="text-center py-16">
                <Send className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No campaigns yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a product image in Supplier Search to auto-generate outreach campaigns
                </p>
              </div>
            ) : (
              groupedCampaigns.map(([supplierId, supplierCampaigns]) => (
                <OutreachCampaignCard
                  key={supplierId}
                  supplierName={supplierCampaigns[0].supplier_name}
                  campaigns={supplierCampaigns}
                  onApprove={approveCampaign}
                  onApproveAll={handleApproveAllForSupplier}
                  onUpdateMessage={updateCampaignMessage}
                  onDelete={deleteCampaign}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="automation" className="mt-6">
            <AutomationRulesPanel
              rules={rules}
              onAddRule={addRule}
              onUpdateRule={updateRule}
              onDeleteRule={deleteRule}
              userId={userId}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {sentCampaigns.length === 0 ? (
              <div className="text-center py-16">
                <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No history yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Approved and sent campaigns will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sentCampaigns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">{c.channel}</Badge>
                      <span className="text-sm font-medium">{c.supplier_name}</span>
                      {c.product_name && <span className="text-xs text-muted-foreground">• {c.product_name}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={c.status === "sent" ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"}>
                        {c.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
