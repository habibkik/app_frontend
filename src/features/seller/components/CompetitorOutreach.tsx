import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send, MessageSquare, CheckCircle2, XCircle, Clock, Plus, Loader2,
  DollarSign, Filter, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Interaction {
  id: string;
  competitor_name: string;
  platform: string;
  message_sent: string | null;
  response_received: string | null;
  response_price: number | null;
  confidence_score: number;
  status: string;
  sent_at: string;
  responded_at: string | null;
  product_id: string | null;
}

export function CompetitorOutreach() {
  const { toast } = useToast();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responsePrice, setResponsePrice] = useState("");
  const [saving, setSaving] = useState(false);

  // New outreach dialog
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [newPlatform, setNewPlatform] = useState("email");
  const [newMessage, setNewMessage] = useState("");

  const fetchInteractions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("competitor_interactions")
        .select("*")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      setInteractions((data as any[]) || []);
    } catch (e) {
      console.error("Failed to fetch interactions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInteractions(); }, []);

  const filteredInteractions = statusFilter === "all"
    ? interactions
    : interactions.filter(i => i.status === statusFilter);

  const stats = {
    total: interactions.length,
    sent: interactions.filter(i => i.status === "sent").length,
    responded: interactions.filter(i => i.status === "responded").length,
    noResponse: interactions.filter(i => i.status === "no_response").length,
    responseRate: interactions.length > 0
      ? Math.round(interactions.filter(i => i.status === "responded").length / interactions.length * 100)
      : 0,
  };

  const handleLogResponse = (interaction: Interaction) => {
    setSelectedInteraction(interaction);
    setResponseText("");
    setResponsePrice("");
    setLogDialogOpen(true);
  };

  const saveResponse = async () => {
    if (!selectedInteraction) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("competitor_interactions")
        .update({
          response_received: responseText,
          response_price: responsePrice ? parseFloat(responsePrice) : null,
          status: "responded",
          responded_at: new Date().toISOString(),
          confidence_score: responsePrice ? 90 : 50,
        })
        .eq("id", selectedInteraction.id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast({ title: "Response Logged", description: "Competitor response recorded successfully." });
      setLogDialogOpen(false);
      await fetchInteractions();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const createOutreach = async () => {
    if (!newCompetitor.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("competitor_interactions")
        .insert({
          user_id: user.id,
          competitor_name: newCompetitor,
          platform: newPlatform,
          message_sent: newMessage || null,
          status: "sent",
        });

      if (error) throw error;
      toast({ title: "Outreach Logged", description: `Message to ${newCompetitor} recorded.` });
      setNewDialogOpen(false);
      setNewCompetitor("");
      setNewMessage("");
      await fetchInteractions();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent": return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Sent</Badge>;
      case "responded": return <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />Responded</Badge>;
      case "no_response": return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />No Response</Badge>;
      case "expired": return <Badge variant="destructive">Expired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "whatsapp": return "💬";
      case "facebook": return "f";
      case "instagram": return "📷";
      case "email": return "✉️";
      case "telegram": return "✈️";
      default: return "📱";
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Outreach", value: stats.total, icon: Send },
          { label: "Awaiting Response", value: stats.sent, icon: Clock },
          { label: "Responded", value: stats.responded, icon: CheckCircle2 },
          { label: "Response Rate", value: `${stats.responseRate}%`, icon: BarChart3 },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <stat.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="no_response">No Response</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setNewDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Log Outreach
        </Button>
      </div>

      {/* Interactions List */}
      {filteredInteractions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Outreach Yet</h3>
            <p className="text-muted-foreground text-center mb-4">Log your competitor outreach messages to track responses and prices.</p>
            <Button onClick={() => setNewDialogOpen(true)}>Log First Outreach</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredInteractions.map((interaction, i) => (
            <motion.div key={interaction.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                        {getPlatformIcon(interaction.platform)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{interaction.competitor_name}</h4>
                          {getStatusBadge(interaction.status)}
                          <span className="text-xs text-muted-foreground capitalize">{interaction.platform}</span>
                        </div>
                        {interaction.message_sent && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{interaction.message_sent}</p>
                        )}
                        {interaction.response_received && (
                          <p className="text-sm mt-1"><span className="font-medium">Response:</span> {interaction.response_received}</p>
                        )}
                        {interaction.response_price != null && (
                          <div className="flex items-center gap-1 mt-1">
                            <DollarSign className="h-3 w-3 text-primary" />
                            <span className="text-sm font-semibold">${interaction.response_price}</span>
                            <span className="text-xs text-muted-foreground">(confidence: {interaction.confidence_score}%)</span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Sent: {format(new Date(interaction.sent_at), "PPp")}</p>
                      </div>
                    </div>
                    {interaction.status === "sent" && (
                      <Button variant="outline" size="sm" onClick={() => handleLogResponse(interaction)}>
                        Log Response
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Log Response Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Response from {selectedInteraction?.competitor_name}</DialogTitle>
            <DialogDescription>Record the response received from this competitor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Response Message</Label>
              <Textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="Paste or type the response..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Extracted Price (optional)</Label>
              <Input type="number" value={responsePrice} onChange={(e) => setResponsePrice(e.target.value)} placeholder="e.g., 45.99" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveResponse} disabled={saving || !responseText.trim()}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Outreach Dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log New Outreach</DialogTitle>
            <DialogDescription>Record a message sent to a competitor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Competitor Name</Label>
              <Input value={newCompetitor} onChange={(e) => setNewCompetitor(e.target.value)} placeholder="e.g., TechSupply Co" />
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={newPlatform} onValueChange={setNewPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message Sent (optional)</Label>
              <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="What did you send?" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDialogOpen(false)}>Cancel</Button>
            <Button onClick={createOutreach} disabled={saving || !newCompetitor.trim()}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Log Outreach
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
