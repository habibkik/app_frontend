import { useState, useEffect } from "react";
import { Send, Loader2, Plus, Copy, ExternalLink, Eye, MessageSquare, Trash2, CheckCircle2, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Invitation {
  id: string;
  rfq_title: string;
  rfq_description: string | null;
  rfq_category: string | null;
  supplier_email: string;
  supplier_name: string | null;
  token: string;
  status: string;
  created_at: string;
  expires_at: string;
  viewed_at: string | null;
  responded_at: string | null;
}

interface PortalResponse {
  id: string;
  invitation_id: string;
  supplier_name: string;
  supplier_email: string;
  supplier_company: string | null;
  quote_amount: number | null;
  quote_currency: string;
  lead_time: string | null;
  moq: number | null;
  proposal_text: string | null;
  submitted_at: string;
}

export function SupplierInvitationManager() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [responses, setResponses] = useState<PortalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedInvId, setSelectedInvId] = useState<string | null>(null);
  const [newInv, setNewInv] = useState({
    rfq_title: "",
    rfq_description: "",
    rfq_requirements: "",
    rfq_category: "",
    rfq_budget_range: "",
    rfq_deadline: "",
    supplier_email: "",
    supplier_name: "",
  });

  const fetchData = async () => {
    setLoading(true);
    const [invRes, respRes] = await Promise.all([
      supabase.from("supplier_portal_invitations").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("supplier_portal_responses").select("*").order("submitted_at", { ascending: false }).limit(200),
    ]);
    setInvitations((invRes.data as any[]) || []);
    setResponses((respRes.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!newInv.rfq_title.trim() || !newInv.supplier_email.trim()) {
      toast.error("RFQ title and supplier email are required.");
      return;
    }
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.from("supplier_portal_invitations").insert({
        user_id: user.id,
        rfq_title: newInv.rfq_title,
        rfq_description: newInv.rfq_description || null,
        rfq_requirements: newInv.rfq_requirements || null,
        rfq_category: newInv.rfq_category || null,
        rfq_budget_range: newInv.rfq_budget_range || null,
        rfq_deadline: newInv.rfq_deadline ? new Date(newInv.rfq_deadline).toISOString() : null,
        supplier_email: newInv.supplier_email,
        supplier_name: newInv.supplier_name || null,
      }).select().single();

      if (error) throw error;
      toast.success("Invitation created! Copy the link to send to the supplier.");
      setCreateOpen(false);
      setNewInv({ rfq_title: "", rfq_description: "", rfq_requirements: "", rfq_category: "", rfq_budget_range: "", rfq_deadline: "", supplier_email: "", supplier_name: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create invitation");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/supplier-portal/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Portal link copied to clipboard!");
  };

  const deleteInvitation = async (id: string) => {
    const { error } = await supabase.from("supplier_portal_invitations").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      setInvitations(prev => prev.filter(i => i.id !== id));
      toast.success("Invitation deleted");
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
      viewed: { label: "Viewed", className: "bg-amber-500/10 text-amber-600" },
      responded: { label: "Responded", className: "bg-emerald-500/10 text-emerald-600" },
    };
    const s = map[status] || map.pending;
    return <Badge className={cn("text-xs", s.className)}>{s.label}</Badge>;
  };

  const selectedResponses = selectedInvId
    ? responses.filter(r => r.invitation_id === selectedInvId)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" />
            Supplier Portal
          </h2>
          <p className="text-muted-foreground mt-1">
            Invite suppliers to view RFQ details and submit quotes via secure portal links.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Invite Supplier</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Supplier Invitation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>RFQ Title *</Label>
                <Input placeholder="e.g. Steel Pipes 6-inch for Oil & Gas" value={newInv.rfq_title} onChange={e => setNewInv(p => ({ ...p, rfq_title: e.target.value }))} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={3} placeholder="Describe the procurement need…" value={newInv.rfq_description} onChange={e => setNewInv(p => ({ ...p, rfq_description: e.target.value }))} />
              </div>
              <div>
                <Label>Requirements</Label>
                <Textarea rows={3} placeholder="Technical specs, certifications, standards…" value={newInv.rfq_requirements} onChange={e => setNewInv(p => ({ ...p, rfq_requirements: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input placeholder="e.g. Industrial Equipment" value={newInv.rfq_category} onChange={e => setNewInv(p => ({ ...p, rfq_category: e.target.value }))} />
                </div>
                <div>
                  <Label>Budget Range</Label>
                  <Input placeholder="e.g. $50,000 - $100,000" value={newInv.rfq_budget_range} onChange={e => setNewInv(p => ({ ...p, rfq_budget_range: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Deadline</Label>
                <Input type="date" value={newInv.rfq_deadline} onChange={e => setNewInv(p => ({ ...p, rfq_deadline: e.target.value }))} />
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-foreground mb-3">Supplier Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Supplier Email *</Label>
                    <Input type="email" placeholder="supplier@company.com" value={newInv.supplier_email} onChange={e => setNewInv(p => ({ ...p, supplier_email: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Supplier Name</Label>
                    <Input placeholder="Contact name" value={newInv.supplier_name} onChange={e => setNewInv(p => ({ ...p, supplier_name: e.target.value }))} />
                  </div>
                </div>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating…</> : "Create & Generate Link"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="invitations">
        <TabsList>
          <TabsTrigger value="invitations">Invitations ({invitations.length})</TabsTrigger>
          <TabsTrigger value="responses">Responses ({responses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="invitations">
          <Card>
            <CardContent className="pt-4">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No invitations yet. Invite a supplier to get started.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-2">
                    {invitations.map((inv, i) => (
                      <motion.div
                        key={inv.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="group p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm text-foreground">{inv.rfq_title}</p>
                              {statusBadge(inv.status)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{inv.supplier_email}</span>
                              {inv.supplier_name && <span>• {inv.supplier_name}</span>}
                              <span>• {new Date(inv.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => copyLink(inv.token)} title="Copy portal link">
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => window.open(`/supplier-portal/${inv.token}`, "_blank")} title="Preview portal">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedInvId(inv.id)} title="View responses">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <button onClick={() => deleteInvitation(inv.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded">
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardContent className="pt-4">
              {responses.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No responses received yet.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-3">
                    {(selectedInvId ? selectedResponses : responses).map(resp => {
                      const parentInv = invitations.find(i => i.id === resp.invitation_id);
                      return (
                        <div key={resp.id} className="p-4 rounded-lg border bg-card">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="font-medium text-sm text-foreground">{resp.supplier_name}</p>
                              <p className="text-xs text-muted-foreground">{resp.supplier_email}{resp.supplier_company ? ` • ${resp.supplier_company}` : ""}</p>
                            </div>
                            <div className="text-right">
                              {resp.quote_amount && (
                                <p className="font-bold text-foreground">{resp.quote_currency} {resp.quote_amount.toLocaleString()}</p>
                              )}
                              <p className="text-xs text-muted-foreground">{new Date(resp.submitted_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {parentInv && (
                            <Badge variant="outline" className="text-xs mb-2">{parentInv.rfq_title}</Badge>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {resp.lead_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {resp.lead_time}</span>}
                            {resp.moq && <span>MOQ: {resp.moq}</span>}
                          </div>
                          {resp.proposal_text && (
                            <p className="text-sm text-foreground mt-2 bg-muted/30 rounded p-2">{resp.proposal_text}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
              {selectedInvId && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setSelectedInvId(null)}>
                  Show all responses
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
