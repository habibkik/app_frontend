import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/features/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCheck, Send, Settings2, History, MessageSquare, ChevronDown, ChevronUp, BarChart3, FileText } from "lucide-react";
import { useOutreachCampaignStore } from "@/stores/outreachCampaignStore";
import { OutreachCampaignCard } from "@/components/outreach/OutreachCampaignCard";
import { OutreachSupplierDiscoveryCard } from "@/components/outreach/OutreachSupplierDiscoveryCard";
import { AutomationRulesPanel } from "@/components/outreach/AutomationRulesPanel";
import { CampaignObjectiveSelector, type CampaignObjective } from "@/components/outreach/CampaignObjectiveSelector";
import { SequenceTemplatesPanel, type SequenceTemplate } from "@/components/outreach/SequenceTemplatesPanel";
import { OutreachMetricsDashboard } from "@/components/outreach/OutreachMetricsDashboard";
import { ChannelStrategyGuide } from "@/components/outreach/ChannelStrategyGuide";
import { PsychologyTriggersPanel } from "@/components/outreach/PsychologyTriggersPanel";
import { ComplianceBestPractices } from "@/components/outreach/ComplianceBestPractices";
import { DailyWorkflowChecklist } from "@/components/outreach/DailyWorkflowChecklist";
import { MessageTemplateLibrary } from "@/components/outreach/MessageTemplateLibrary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mockSuppliers, type Supplier } from "@/data/suppliers";
import { useDiscoveredSuppliersStore } from "@/stores/discoveredSuppliersStore";
import { useNavigate } from "react-router-dom";
import { toast as sonnerToast } from "sonner";

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email", linkedin: "LinkedIn", whatsapp: "WhatsApp", sms: "SMS",
  phone_call: "Phone", facebook: "Facebook", instagram: "Instagram",
  tiktok: "TikTok", twitter: "Twitter/X",
};

export default function OutreachHub() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    campaigns, rules, loading,
    fetchCampaigns, fetchRules,
    approveCampaign, approveAll,
    updateCampaignMessage, deleteCampaign,
    addRule, updateRule, deleteRule,
    prepareCampaignsForSupplier,
  } = useOutreachCampaignStore();

  const { discoveredSuppliers } = useDiscoveredSuppliersStore();
  const [userId, setUserId] = useState("");
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [objective, setObjective] = useState<CampaignObjective>("sourcing");

  useEffect(() => {
    fetchCampaigns();
    fetchRules();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [fetchCampaigns, fetchRules]);

  const { suppliersWithCampaigns, suppliersWithoutCampaigns } = useMemo(() => {
    const campaignSupplierIds = new Set(campaigns.map((c) => c.supplier_id));
    const allSuppliersMap = new Map<string, Supplier>();
    mockSuppliers.forEach((s) => allSuppliersMap.set(s.id, s));
    discoveredSuppliers.forEach((s) => allSuppliersMap.set(s.id, s));

    const withCampaigns: Array<[string, typeof campaigns]> = [];
    const campaignMap = new Map<string, typeof campaigns>();
    campaigns.forEach((c) => {
      if (!campaignMap.has(c.supplier_id)) campaignMap.set(c.supplier_id, []);
      campaignMap.get(c.supplier_id)!.push(c);
    });
    campaignMap.forEach((cs, sid) => withCampaigns.push([sid, cs]));

    const without = Array.from(allSuppliersMap.values()).filter(
      (s) => !campaignSupplierIds.has(s.id)
    );

    return { suppliersWithCampaigns: withCampaigns, suppliersWithoutCampaigns: without };
  }, [campaigns, discoveredSuppliers]);

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

  const handleGenerateCampaigns = async (supplier: Supplier, tier?: string) => {
    const count = await prepareCampaignsForSupplier({
      id: supplier.id,
      name: supplier.name,
      industry: supplier.industry,
      location: `${supplier.location.city}, ${supplier.location.country}`,
    }, undefined, objective, tier);
    if (count > 0) {
      toast({ title: "Campaigns Generated", description: `${count} outreach campaigns created for ${supplier.name}.` });
    }
    return count;
  };

  const handleApplyTemplate = (template: SequenceTemplate) => {
    sonnerToast.success(`Template "${template.name}" applied`, {
      description: `${template.touches} touches over ${template.duration}. Select suppliers to generate sequences.`,
    });
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
          <div className="flex items-center gap-2">
            <ChannelStrategyGuide />
            {draftCount > 0 && (
              <Button onClick={handleApproveAll} className="gap-1.5">
                <CheckCheck className="h-4 w-4" />
                Approve All ({draftCount})
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="campaigns">
          <TabsList className="flex-wrap">
            <TabsTrigger value="campaigns" className="gap-1.5">
              <Send className="h-4 w-4" />
              Campaigns
              {draftCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{draftCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-1.5">
              <Settings2 className="h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-4 w-4" />
              History
              {sentCampaigns.filter((c) => c.response_received).length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {sentCampaigns.filter((c) => c.response_received).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6 space-y-4">
            {/* Daily Workflow */}
            <DailyWorkflowChecklist />

            {/* Compliance */}
            <ComplianceBestPractices />

            {/* Objective Selector */}
            <CampaignObjectiveSelector selected={objective} onSelect={setObjective} />

            {/* Tools bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <SequenceTemplatesPanel onApplyTemplate={handleApplyTemplate} />
              <PsychologyTriggersPanel />
            </div>

            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))
            ) : (
              <>
                {suppliersWithCampaigns.length > 0 && suppliersWithCampaigns.map(([supplierId, supplierCampaigns]) => (
                  <OutreachCampaignCard
                    key={supplierId}
                    supplierName={supplierCampaigns[0].supplier_name}
                    campaigns={supplierCampaigns}
                    onApprove={approveCampaign}
                    onApproveAll={handleApproveAllForSupplier}
                    onUpdateMessage={updateCampaignMessage}
                    onDelete={deleteCampaign}
                  />
                ))}

                {suppliersWithoutCampaigns.length > 0 && (
                  <div className="space-y-2 mt-6">
                    <h3 className="text-sm font-medium text-muted-foreground px-1">
                      All Suppliers — No campaigns yet ({suppliersWithoutCampaigns.length})
                    </h3>
                    {suppliersWithoutCampaigns.map((supplier) => (
                      <OutreachSupplierDiscoveryCard
                        key={supplier.id}
                        supplier={supplier}
                        onGenerateCampaigns={handleGenerateCampaigns}
                      />
                    ))}
                  </div>
                )}

                {suppliersWithCampaigns.length === 0 && suppliersWithoutCampaigns.length === 0 && (
                  <div className="text-center py-16">
                    <Send className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">No campaigns yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a product image in Supplier Search to auto-generate outreach campaigns
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <MessageTemplateLibrary />
          </TabsContent>

          <TabsContent value="metrics" className="mt-6">
            <OutreachMetricsDashboard campaigns={campaigns} />
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
                  <div key={c.id} className="rounded-lg bg-muted/30 border border-border/30 overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedHistory(expandedHistory === c.id ? null : c.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">{CHANNEL_LABELS[c.channel] || c.channel}</Badge>
                        <span className="text-sm font-medium">{c.supplier_name}</span>
                        {c.product_name && <span className="text-xs text-muted-foreground">• {c.product_name}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {c.response_received ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 text-xs">Responded</Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-600 text-xs">Awaiting Response</Badge>
                        )}
                        {c.response_channel && (
                          <Badge variant="outline" className="text-xs">via {CHANNEL_LABELS[c.response_channel] || c.response_channel}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.updated_at).toLocaleDateString()}
                        </span>
                        {expandedHistory === c.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>
                    {expandedHistory === c.id && (
                      <div className="px-4 pb-3 border-t border-border/30 pt-3 space-y-2">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Sent Message</p>
                          <p className="text-sm bg-muted/50 p-2 rounded">{c.message || "—"}</p>
                        </div>
                        {c.response_received && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Response</p>
                            <p className="text-sm bg-emerald-500/5 p-2 rounded border border-emerald-500/20">{c.response_received}</p>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => navigate("/dashboard/conversations")}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Open Conversation
                        </Button>
                      </div>
                    )}
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
