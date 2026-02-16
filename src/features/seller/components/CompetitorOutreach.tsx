import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Send, MessageSquare, CheckCircle2, XCircle, Clock, Plus, Loader2, DollarSign, Filter, BarChart3, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Define the structure of an interaction
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responsePrice, setResponsePrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedMoq, setExtractedMoq] = useState("");
  const [extractedLeadTime, setExtractedLeadTime] = useState("");
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

  useEffect(() => {
    fetchInteractions();
  }, []);

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
    setExtractedMoq("");
    setExtractedLeadTime("");
    setLogDialogOpen(true);
  };

  const handleExtractPrice = async () => {
    if (!responseText.trim()) return;
    setExtracting(true);

    try {
      const { data, error } = await supabase.functions.invoke("extract-price", {
        body: { message_text: responseText },
      });

      if (error) throw error;

      if (data?.success && data.data) {
        const d = data.data;
        if (d.price) setResponsePrice(String(d.price));
        if (d.moq) setExtractedMoq(String(d.moq));
        if (d.lead_time) setExtractedLeadTime(d.lead_time);

        toast({
          title: t("outreach.priceExtracted"),
          description: `Confidence: ${d.confidence}%`,
        });
      } else {
        toast({ title: t("outreach.extractionFailed"), variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: t("outreach.extractionFailed"), description: e.message, variant: "destructive" });
    } finally {
      setExtracting(false);
    }
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

      toast({ title: t("outreach.logResponse") });
      setLogDialogOpen(false);
      await fetchInteractions();
    } catch (e: any) {
      toast({ title: t("common.error"), description: e.message, variant: "destructive" });
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

      toast({ title: t("outreach.logOutreach") });
      setNewDialogOpen(false);
      setNewCompetitor("");
      setNewMessage("");
      await fetchInteractions();
    } catch (e: any) {
      toast({ title: t("common.error"), description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{t("common.status")}</Badge>;
      case "responded":
        return <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />{t("outreach.responded")}</Badge>;
      case "no_response":
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />{t("outreach.awaitingResponse")}</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  if (loading) return <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: t("outreach.totalOutreach"), value: stats.total, icon: Send },
          { label: t("outreach.awaitingResponse"), value: stats.sent, icon: Clock },
          { label: t("outreach.responded"), value: stats.responded, icon: CheckCircle2 },
          { label: t("outreach.responseRate"), value: `${stats.responseRate}%`, icon: BarChart3 },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="pt-4 pb-4 flex items-center gap-3"><stat.icon className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-xl font-bold">{stat.value}</p></div></CardContent></Card>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("common.all")}</SelectItem><SelectItem value="sent">Sent</SelectItem><SelectItem value="responded">{t("outreach.responded")}</SelectItem><SelectItem value="no_response">No Response</SelectItem></SelectContent></Select>
        </div>
        <Button onClick={() => setNewDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> {t("outreach.logOutreach")}</Button>
      </div>
      {filteredInteractions.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("outreach.noOutreach")}</h3>
          <p className="text-muted-foreground text-center mb-4">{t("outreach.noOutreachDesc")}</p>
          <Button onClick={() => setNewDialogOpen(true)}>{t("outreach.logOutreach")}</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filteredInteractions.map((interaction, i) => (
            <motion.div key={interaction.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
              <Card><CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">{getPlatformIcon(interaction.platform)}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1"><h4 className="font-medium">{interaction.competitor_name}</h4>{getStatusBadge(interaction.status)}<span className="text-xs text-muted-foreground capitalize">{interaction.platform}</span></div>
                      {interaction.message_sent && <p className="text-sm text-muted-foreground line-clamp-1">{interaction.message_sent}</p>}
                      {interaction.response_received && <p className="text-sm mt-1"><span className="font-medium">{t("outreach.responseMessage")}:</span> {interaction.response_received}</p>}
                      {interaction.response_price != null && (<div className="flex items-center gap-1 mt-1"><DollarSign className="h-3 w-3 text-primary" /><span className="text-sm font-semibold">${interaction.response_price}</span></div>)}
                      <p className="text-xs text-muted-foreground mt-1">Sent: {format(new Date(interaction.sent_at), "PPp")}</p>
                    </div>
                  </div>
                  {interaction.status === "sent" && <Button variant="outline" size="sm" onClick={() => handleLogResponse(interaction)}>{t("outreach.logResponse")}</Button>}
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("outreach.logResponse")} - {selectedInteraction?.competitor_name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>{t("outreach.responseMessage")}</Label><Textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} rows={3} /><Button type="button" variant="outline" size="sm" onClick={handleExtractPrice} disabled={extracting || !responseText.trim()} className="mt-1">{extracting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}{t("outreach.extractWithAI")}</Button></div>
            <div className="space-y-2"><Label>{t("outreach.extractedPrice")}</Label><Input type="number" value={responsePrice} onChange={(e) => setResponsePrice(e.target.value)} /></div>
            {(extractedMoq || extractedLeadTime) && (<div className="flex gap-4 text-sm">{extractedMoq && <div><span className="text-muted-foreground">{t("outreach.moq")}: </span><span className="font-medium">{extractedMoq}</span></div>}{extractedLeadTime && <div><span className="text-muted-foreground">{t("outreach.leadTime")}: </span><span className="font-medium">{extractedLeadTime}</span></div>}</div>)}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setLogDialogOpen(false)}>{t("common.cancel")}</Button><Button onClick={saveResponse} disabled={saving || !responseText.trim()}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}{t("outreach.saveResponse")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("outreach.logOutreach")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>{t("outreach.competitorName")}</Label><Input value={newCompetitor} onChange={(e) => setNewCompetitor(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("outreach.platform")}</Label><Select value={newPlatform} onValueChange={setNewPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="email">Email</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="facebook">Facebook</SelectItem><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="telegram">Telegram</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>{t("outreach.messageSent")}</Label><Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setNewDialogOpen(false)}>{t("common.cancel")}</Button><Button onClick={createOutreach} disabled={saving || !newCompetitor.trim()}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}{t("outreach.logOutreach")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
