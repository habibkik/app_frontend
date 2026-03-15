import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Package, Clock, DollarSign, Send, CheckCircle2, Loader2, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Invitation {
  id: string;
  rfq_title: string;
  rfq_description: string | null;
  rfq_requirements: string | null;
  rfq_deadline: string | null;
  rfq_budget_range: string | null;
  rfq_category: string | null;
  supplier_name: string | null;
  status: string;
  expires_at: string;
}

export default function SupplierPortalPage() {
  const { token } = useParams<{ token: string }>();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    supplier_name: "",
    supplier_email: "",
    supplier_company: "",
    supplier_phone: "",
    quote_amount: "",
    quote_currency: "USD",
    quote_unit: "per unit",
    lead_time: "",
    moq: "",
    proposal_text: "",
    terms_accepted: false,
  });

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link.");
      setLoading(false);
      return;
    }
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("supplier_portal_invitations")
        .select("*")
        .eq("token", token)
        .single();

      if (fetchError || !data) {
        setError("Invitation not found or has expired.");
        setLoading(false);
        return;
      }

      const inv = data as any;
      if (new Date(inv.expires_at) < new Date()) {
        setError("This invitation has expired.");
        setLoading(false);
        return;
      }

      if (inv.status === "responded") {
        setSubmitted(true);
      }

      setInvitation(inv);
      setForm(prev => ({
        ...prev,
        supplier_name: inv.supplier_name || "",
      }));

      // Mark as viewed
      if (!inv.viewed_at) {
        await supabase
          .from("supplier_portal_invitations")
          .update({ viewed_at: new Date().toISOString(), status: "viewed" })
          .eq("token", token);
      }
    } catch {
      setError("Failed to load invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.supplier_name.trim() || !form.supplier_email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    if (!form.terms_accepted) {
      toast.error("Please accept the terms to submit.");
      return;
    }
    if (!invitation) return;

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from("supplier_portal_responses")
        .insert({
          invitation_id: invitation.id,
          supplier_name: form.supplier_name,
          supplier_email: form.supplier_email,
          supplier_company: form.supplier_company || null,
          supplier_phone: form.supplier_phone || null,
          quote_amount: form.quote_amount ? parseFloat(form.quote_amount) : null,
          quote_currency: form.quote_currency,
          quote_unit: form.quote_unit || null,
          lead_time: form.lead_time || null,
          moq: form.moq ? parseInt(form.moq) : null,
          proposal_text: form.proposal_text || null,
          terms_accepted: true,
        });

      if (insertError) throw insertError;

      // Update invitation status
      await supabase
        .from("supplier_portal_invitations")
        .update({ status: "responded", responded_at: new Date().toISOString() })
        .eq("id", invitation.id);

      setSubmitted(true);
      toast.success("Quote submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit quote.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Unable to Load</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Quote Submitted!</h2>
            <p className="text-muted-foreground">
              Thank you for your response. The buyer will review your quote and get back to you.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Supplier Portal</h1>
              <p className="text-sm text-muted-foreground">Submit your quote for this procurement request</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* RFQ Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {invitation?.rfq_title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitation?.rfq_description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{invitation.rfq_description}</p>
              </div>
            )}
            {invitation?.rfq_requirements && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Requirements</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{invitation.rfq_requirements}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {invitation?.rfq_category && (
                <Badge variant="secondary">{invitation.rfq_category}</Badge>
              )}
              {invitation?.rfq_budget_range && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> {invitation.rfq_budget_range}
                </Badge>
              )}
              {invitation?.rfq_deadline && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Due: {new Date(invitation.rfq_deadline).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quote Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Your Name *</Label>
                <Input value={form.supplier_name} onChange={e => setForm(p => ({ ...p, supplier_name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={form.supplier_email} onChange={e => setForm(p => ({ ...p, supplier_email: e.target.value }))} placeholder="john@company.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company</Label>
                <Input value={form.supplier_company} onChange={e => setForm(p => ({ ...p, supplier_company: e.target.value }))} placeholder="Acme Corp" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.supplier_phone} onChange={e => setForm(p => ({ ...p, supplier_phone: e.target.value }))} placeholder="+1 555 0123" />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Pricing Details</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Quote Amount</Label>
                  <Input type="number" value={form.quote_amount} onChange={e => setForm(p => ({ ...p, quote_amount: e.target.value }))} placeholder="10000" />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input value={form.quote_currency} onChange={e => setForm(p => ({ ...p, quote_currency: e.target.value }))} placeholder="USD" />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input value={form.quote_unit} onChange={e => setForm(p => ({ ...p, quote_unit: e.target.value }))} placeholder="per unit" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lead Time</Label>
                <Input value={form.lead_time} onChange={e => setForm(p => ({ ...p, lead_time: e.target.value }))} placeholder="14-21 days" />
              </div>
              <div>
                <Label>Minimum Order Quantity</Label>
                <Input type="number" value={form.moq} onChange={e => setForm(p => ({ ...p, moq: e.target.value }))} placeholder="100" />
              </div>
            </div>

            <div>
              <Label>Proposal / Additional Notes</Label>
              <Textarea rows={5} value={form.proposal_text} onChange={e => setForm(p => ({ ...p, proposal_text: e.target.value }))} placeholder="Describe your offering, certifications, bulk discounts, payment terms…" />
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="terms"
                checked={form.terms_accepted}
                onCheckedChange={(checked) => setForm(p => ({ ...p, terms_accepted: checked === true }))}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                I confirm this quote is valid and I agree to be contacted regarding this procurement request.
              </label>
            </div>

            <Button onClick={handleSubmit} disabled={submitting} className="w-full" size="lg">
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting…</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Submit Quote</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
