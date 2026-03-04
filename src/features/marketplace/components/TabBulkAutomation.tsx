import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RefreshCw, TrendingDown, Zap, Package, Brain, Bell, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AUTOMATION_RULES = [
  { type: "auto-republish", icon: RefreshCw, title: "Auto-Republish", desc: "Automatically republish expired listings", fields: [{ key: "days", label: "Days before republish", type: "number", default: 7 }] },
  { type: "auto-price-reduction", icon: TrendingDown, title: "Auto Price Reduction", desc: "Reduce price after X days with no inquiries", fields: [{ key: "percentage", label: "Reduce by %", type: "number", default: 10 }, { key: "days", label: "After days", type: "number", default: 14 }] },
  { type: "auto-cross-post", icon: Zap, title: "Auto Cross-Post", desc: "Auto-publish new products to all connected platforms" },
  { type: "stock-sync", icon: Package, title: "Stock Sync & Auto-Pause", desc: "Pause listings when stock reaches 0" },
  { type: "smart-scheduling", icon: Brain, title: "Smart Scheduling", desc: "AI picks optimal publish time per platform" },
  { type: "low-stock-alert", icon: Bell, title: "Low Stock Alert", desc: "Notify when stock drops below threshold", fields: [{ key: "threshold", label: "Threshold", type: "number", default: 5 }] },
];

export function TabBulkAutomation() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");

  const { data: listings, isLoading } = useQuery({
    queryKey: ["marketplace-listings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_listings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: rules } = useQuery({
    queryKey: ["marketplace-automation-rules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_automation_rules").select("*");
      if (error) throw error;
      return data;
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleType, active, config }: { ruleType: string; active: boolean; config?: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const existing = rules?.find((r: any) => r.rule_type === ruleType);
      if (existing) {
        const { error } = await supabase.from("marketplace_automation_rules").update({ is_active: active, ...(config ? { config_json: config } : {}) }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("marketplace_automation_rules").insert({
          user_id: user.id, rule_type: ruleType, is_active: active, config_json: config || {},
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-automation-rules"] });
      toast.success("Rule updated");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      for (const id of selectedIds) {
        const { error } = await supabase.from("marketplace_listings").delete().eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-listings"] });
      setSelectedIds([]);
      toast.success("Bulk delete complete");
    },
  });

  const isRuleActive = (type: string) => rules?.find((r: any) => r.rule_type === type)?.is_active || false;
  const getRuleConfig = (type: string) => rules?.find((r: any) => r.rule_type === type)?.config_json as any || {};

  return (
    <div className="space-y-8">
      {/* Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bulk Operations</CardTitle>
          <CardDescription>Select multiple products and apply actions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (listings || []).length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No listings to manage</p>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Bulk action..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delete">Delete Selected</SelectItem>
                    <SelectItem value="activate">Set Active</SelectItem>
                    <SelectItem value="archive">Archive</SelectItem>
                  </SelectContent>
                </Select>

                {bulkAction === "delete" && selectedIds.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-1" /> Delete {selectedIds.length}</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.length} listing(s)?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => bulkDeleteMutation.mutate()}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <span className="text-xs text-muted-foreground ml-auto">{selectedIds.length} selected</span>
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto">
                {(listings || []).map((l: any) => (
                  <div key={l.id} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-muted/50">
                    <Checkbox
                      checked={selectedIds.includes(l.id)}
                      onCheckedChange={(checked) => {
                        setSelectedIds(checked ? [...selectedIds, l.id] : selectedIds.filter((x) => x !== l.id));
                      }}
                    />
                    <span className="text-sm flex-1">{l.title}</span>
                    <Badge variant="secondary" className="text-[10px]">{l.status}</Badge>
                    <span className="text-xs text-muted-foreground">{l.currency} {l.price}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Automation Rules */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Automation Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AUTOMATION_RULES.map((rule) => {
            const Icon = rule.icon;
            const active = isRuleActive(rule.type);
            const config = getRuleConfig(rule.type);

            return (
              <Card key={rule.type} className={active ? "ring-1 ring-primary/30" : ""}>
                <CardContent className="pt-4 pb-3 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{rule.title}</p>
                        <p className="text-xs text-muted-foreground">{rule.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={active}
                      onCheckedChange={(checked) => toggleRuleMutation.mutate({ ruleType: rule.type, active: checked, config })}
                    />
                  </div>
                  {rule.fields && active && (
                    <div className="flex gap-3 pl-7">
                      {rule.fields.map((f) => (
                        <div key={f.key} className="space-y-1">
                          <Label className="text-[10px]">{f.label}</Label>
                          <Input
                            type={f.type}
                            className="h-7 w-20 text-xs"
                            defaultValue={config?.[f.key] || f.default}
                            onChange={(e) => {
                              const newConfig = { ...config, [f.key]: parseFloat(e.target.value) || f.default };
                              toggleRuleMutation.mutate({ ruleType: rule.type, active: true, config: newConfig });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
