import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useConversationsStore } from "@/stores/conversationsStore";

export interface OutreachCampaign {
  id: string;
  user_id: string;
  supplier_id: string;
  supplier_name: string;
  product_name: string | null;
  channel: string;
  message: string | null;
  subject: string | null;
  status: string;
  auto_repeat: boolean;
  repeat_interval_hours: number;
  max_auto_runs: number;
  runs_completed: number;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
  response_received: string | null;
  response_channel: string | null;
  responded_at: string | null;
  sequence_step: number;
  scheduled_day: number;
  objective: string | null;
  supplier_tier: string | null;
}

export interface AutomationRule {
  id: string;
  user_id: string;
  product_name: string;
  channel: string;
  enabled: boolean;
  max_runs: number;
  interval_hours: number;
  created_at: string;
  updated_at: string;
}

interface OutreachCampaignState {
  campaigns: OutreachCampaign[];
  rules: AutomationRule[];
  loading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  fetchRules: () => Promise<void>;
  updateCampaignMessage: (id: string, message: string, subject?: string) => Promise<void>;
  approveCampaign: (id: string) => Promise<void>;
  approveAll: () => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  addRule: (rule: Omit<AutomationRule, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateRule: (id: string, updates: Partial<AutomationRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  prepareCampaigns: (suppliers: any[], productName?: string, objective?: string, supplierTier?: string) => Promise<number>;
  updateCampaignResponse: (id: string, response: string, channel: string) => Promise<void>;
  prepareCampaignsForSupplier: (supplier: any, productName?: string, objective?: string, supplierTier?: string) => Promise<number>;
}

export const useOutreachCampaignStore = create<OutreachCampaignState>((set, get) => ({
  campaigns: [],
  rules: [],
  loading: false,
  error: null,

  fetchCampaigns: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("outreach_campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    set({
      campaigns: (data as OutreachCampaign[]) || [],
      loading: false,
      error: error?.message || null,
    });
  },

  fetchRules: async () => {
    const { data, error } = await supabase
      .from("outreach_automation_rules")
      .select("*")
      .order("created_at", { ascending: false });
    set({
      rules: (data as AutomationRule[]) || [],
      error: error?.message || null,
    });
  },

  updateCampaignMessage: async (id, message, subject) => {
    const updates: any = { message };
    if (subject !== undefined) updates.subject = subject;
    const { error } = await supabase
      .from("outreach_campaigns")
      .update(updates)
      .eq("id", id);
    if (!error) {
      set((s) => ({
        campaigns: s.campaigns.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      }));
    }
  },

  approveCampaign: async (id) => {
    const campaign = get().campaigns.find((c) => c.id === id);
    const { error } = await supabase
      .from("outreach_campaigns")
      .update({ status: "approved" })
      .eq("id", id);
    if (!error) {
      set((s) => ({
        campaigns: s.campaigns.map((c) =>
          c.id === id ? { ...c, status: "approved" } : c
        ),
      }));
      if (campaign) {
        useConversationsStore.getState().addOutreachMessage(
          campaign.supplier_id, campaign.supplier_name, campaign.message, campaign.channel, campaign.product_name
        );
        toast.success("Campaign approved", {
          description: `Conversation created for ${campaign.supplier_name} via ${campaign.channel}.`,
          action: { label: "View Conversations", onClick: () => window.location.assign("/dashboard/conversations") },
        });
      }
    }
  },

  approveAll: async () => {
    const drafts = get().campaigns.filter((c) => c.status === "draft");
    const draftIds = drafts.map((c) => c.id);
    if (draftIds.length === 0) return;
    const { error } = await supabase
      .from("outreach_campaigns")
      .update({ status: "approved" })
      .in("id", draftIds);
    if (!error) {
      set((s) => ({
        campaigns: s.campaigns.map((c) =>
          draftIds.includes(c.id) ? { ...c, status: "approved" } : c
        ),
      }));
      const convStore = useConversationsStore.getState();
      const uniqueSuppliers = new Set<string>();
      for (const campaign of drafts) {
        convStore.addOutreachMessage(
          campaign.supplier_id, campaign.supplier_name, campaign.message, campaign.channel, campaign.product_name
        );
        uniqueSuppliers.add(campaign.supplier_name);
      }
      toast.success(`${drafts.length} campaigns approved`, {
        description: `${uniqueSuppliers.size} conversation${uniqueSuppliers.size !== 1 ? "s" : ""} created or updated.`,
        action: { label: "View Conversations", onClick: () => window.location.assign("/dashboard/conversations") },
      });
    }
  },

  deleteCampaign: async (id) => {
    const { error } = await supabase
      .from("outreach_campaigns")
      .delete()
      .eq("id", id);
    if (!error) {
      set((s) => ({
        campaigns: s.campaigns.filter((c) => c.id !== id),
      }));
    }
  },

  addRule: async (rule) => {
    const { data, error } = await supabase
      .from("outreach_automation_rules")
      .insert(rule)
      .select()
      .single();
    if (!error && data) {
      set((s) => ({ rules: [data as AutomationRule, ...s.rules] }));
    }
  },

  updateRule: async (id, updates) => {
    const { error } = await supabase
      .from("outreach_automation_rules")
      .update(updates)
      .eq("id", id);
    if (!error) {
      set((s) => ({
        rules: s.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      }));
    }
  },

  deleteRule: async (id) => {
    const { error } = await supabase
      .from("outreach_automation_rules")
      .delete()
      .eq("id", id);
    if (!error) {
      set((s) => ({ rules: s.rules.filter((r) => r.id !== id) }));
    }
  },

  prepareCampaigns: async (suppliers, productName, objective, supplierTier) => {
    set({ loading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data, error } = await supabase.functions.invoke("prepare-outreach-campaigns", {
          body: { suppliers, productName, objective: objective || "general", supplierTier: supplierTier || "B" },
        });
        if (error) throw error;
        if (data?.error) {
          set({ error: data.error, loading: false });
          return 0;
        }
        await get().fetchCampaigns();
        set({ loading: false });
        return data?.campaigns_created || 0;
      } else {
        // Not authenticated: generate local mock campaigns with objective-specific content
        const OBJECTIVE_SEQUENCES: Record<string, { day: number; channel: string; getMessage: (product: string, name: string) => string; getSubject?: (product: string) => string }[]> = {
          sourcing: [
            { day: 1, channel: "email", getMessage: (p, n) => `Dear ${n} team,\n\nWe are evaluating qualified suppliers for ${p} and your capabilities align with our requirements. Could you share your product catalog, MOQ, and lead times?\n\nWe'd appreciate a brief call to discuss qualification criteria and volume forecasts.`, getSubject: (p) => `Supplier Qualification Inquiry – ${p}` },
            { day: 3, channel: "linkedin", getMessage: (p, n) => `Hi! We're sourcing ${p} and came across ${n}. Would love to connect and explore a potential supply partnership.` },
            { day: 5, channel: "email", getMessage: (p, n) => `Following up on our inquiry about ${p}. To proceed with qualification, could you provide:\n\n1. Quality certifications (ISO/IATF)\n2. Production capacity & current utilization\n3. Reference customers in our industry\n\nLooking forward to your response.`, getSubject: (p) => `Qualification Follow-up – ${p}` },
            { day: 8, channel: "phone_call", getMessage: (p, n) => `Call script for ${n}:\n- Introduce our company and sourcing needs for ${p}\n- Ask about capacity and lead times\n- Discuss sample/trial order process\n- Confirm next steps for formal RFQ` },
            { day: 12, channel: "email", getMessage: (p, n) => `We're finalizing our shortlist for ${p} suppliers. Our projected annual volume is significant and we'd like to include ${n} in our RFQ process. Please confirm your interest by end of week.`, getSubject: (p) => `Volume Opportunity – ${p} Supplier Selection` },
            { day: 16, channel: "email", getMessage: (p, n) => `This is our final follow-up regarding ${p} sourcing. If we don't hear back, we'll proceed with other qualified suppliers. We'd love to include ${n} — please let us know if you're interested.`, getSubject: (p) => `Final Follow-up – ${p} Supplier Inquiry` },
          ],
          renewal: [
            { day: 1, channel: "email", getMessage: (p, n) => `Hi ${n},\n\nAs part of our periodic supplier review, we're benchmarking pricing and terms for ${p}. We value our relationship and want to ensure mutual competitiveness.\n\nCould we schedule a call to discuss updated pricing for the next contract period?`, getSubject: (p) => `Periodic Review – ${p} Supply Agreement` },
            { day: 5, channel: "email", getMessage: (p, n) => `Following up on our review for ${p}. We've received competitive benchmarks from the market and would like to give ${n} the opportunity to present updated terms before we finalize decisions.`, getSubject: (p) => `Market Benchmark Update – ${p}` },
            { day: 10, channel: "linkedin", getMessage: (p, n) => `Hi! Quick note regarding our ${p} contract renewal discussion. Would be great to connect and align on next steps. Looking forward to continuing our partnership with ${n}.` },
          ],
          esg: [
            { day: 1, channel: "email", getMessage: (p, n) => `Dear ${n},\n\nAs part of our ESG compliance program, we're requesting sustainability certifications and environmental data from all suppliers in our ${p} supply chain.\n\nPlease share:\n1. ISO 14001 / SA8000 certifications\n2. Carbon footprint data\n3. Conflict minerals declaration\n\nCompliance deadline: 30 days.`, getSubject: (p) => `ESG Compliance Request – ${p} Supply Chain` },
            { day: 5, channel: "email", getMessage: (p, n) => `Friendly reminder regarding our ESG documentation request for ${p}. Non-compliance may affect future order allocation. We're happy to assist if you need guidance on the requirements.`, getSubject: (p) => `ESG Documentation Reminder – ${p}` },
            { day: 12, channel: "phone_call", getMessage: (p, n) => `Escalation call script for ${n}:\n- Reference ESG compliance deadline for ${p}\n- Offer to connect them with our sustainability team\n- Explain implications of non-compliance on future orders\n- Document commitments and follow-up dates` },
          ],
          dual: [
            { day: 1, channel: "email", getMessage: (p, n) => `Dear ${n},\n\nWe're diversifying our supply base for ${p} to strengthen resilience. Your capabilities are of interest.\n\nCould you provide an overview of your production capacity, quality systems, and ability to ramp up for our volume requirements?`, getSubject: (p) => `Dual Sourcing Inquiry – ${p}` },
            { day: 3, channel: "linkedin", getMessage: (p, n) => `Hi! We're building a dual-source strategy for ${p} and ${n} looks like a strong fit. Would love to discuss capabilities and potential collaboration.` },
            { day: 7, channel: "email", getMessage: (p, n) => `Following up on our dual sourcing inquiry for ${p}. To move forward with qualification, we'd need:\n\n1. Plant audit availability\n2. Sample production timeline\n3. Preliminary pricing for our volume range\n\nPlease advise on next steps.`, getSubject: (p) => `Qualification Next Steps – ${p}` },
            { day: 14, channel: "email", getMessage: (p, n) => `We're sending our formal RFQ for ${p} dual sourcing. ${n} has been shortlisted based on initial assessment. Please find the RFQ details and respond within 10 business days.`, getSubject: (p) => `Formal RFQ – ${p} Dual Source Program` },
          ],
          "rfq-followup": [
            { day: 1, channel: "email", getMessage: (p, n) => `Hi ${n},\n\nJust confirming receipt of our RFQ for ${p} sent recently. Please acknowledge receipt and let us know if you have any questions about the specifications or timeline.`, getSubject: (p) => `RFQ Receipt Confirmation – ${p}` },
            { day: 4, channel: "phone_call", getMessage: (p, n) => `Call script for ${n}:\n- Confirm they received the ${p} RFQ\n- Answer any technical questions\n- Remind of submission deadline\n- Offer to extend if needed for quality response` },
            { day: 8, channel: "email", getMessage: (p, n) => `Reminder: The submission deadline for our ${p} RFQ is approaching. We want to include ${n} in our evaluation. Please submit your proposal at your earliest convenience.`, getSubject: (p) => `RFQ Deadline Reminder – ${p}` },
          ],
          general: [
            { day: 1, channel: "email", getMessage: (p, n) => `Hi, I'm interested in sourcing ${p} from ${n}. Could we discuss pricing and availability for bulk orders?`, getSubject: (p) => `Sourcing Inquiry – ${p}` },
            { day: 3, channel: "linkedin", getMessage: (p, n) => `Hi! We're looking into ${p} and came across ${n}. Would love to connect and discuss a potential partnership.` },
            { day: 5, channel: "email", getMessage: (p, n) => `Following up on our inquiry about ${p}. We'd love to learn more about your capabilities and pricing structure.`, getSubject: (p) => `Follow-up – ${p} Inquiry` },
            { day: 8, channel: "whatsapp", getMessage: (p, n) => `Hi ${n}! Quick follow-up on our ${p} sourcing inquiry. Are you available for a brief chat this week?` },
            { day: 12, channel: "email", getMessage: (p, n) => `This is our final follow-up regarding ${p}. If we don't hear back, we'll move forward with other suppliers. We'd love to work with ${n}!`, getSubject: (p) => `Final Follow-up – ${p}` },
          ],
        };

        const newCampaigns: OutreachCampaign[] = [];
        const effectiveObjective = objective || "general";
        const sequence = OBJECTIVE_SEQUENCES[effectiveObjective] || OBJECTIVE_SEQUENCES.general;

        for (const supplier of suppliers) {
          const product = productName || "your products";
          for (let i = 0; i < sequence.length; i++) {
            const step = sequence[i];
            newCampaigns.push({
              id: `local-${supplier.id || supplier.name}-${step.channel}-${i}-${Date.now()}`,
              user_id: "demo",
              supplier_id: supplier.id || supplier.name.toLowerCase().replace(/\s+/g, "-"),
              supplier_name: supplier.name,
              product_name: productName || null,
              channel: step.channel,
              message: step.getMessage(product, supplier.name),
              subject: step.getSubject ? step.getSubject(product) : null,
              status: "draft",
              auto_repeat: false,
              repeat_interval_hours: 24,
              max_auto_runs: 1,
              runs_completed: 0,
              last_sent_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              response_received: null,
              response_channel: null,
              responded_at: null,
              sequence_step: i + 1,
              scheduled_day: step.day,
              objective: effectiveObjective,
              supplier_tier: supplierTier || null,
            });
          }
        }
        set((s) => ({
          campaigns: [...newCampaigns, ...s.campaigns],
          loading: false,
        }));
        return newCampaigns.length;
      }
    } catch (e: any) {
      set({ error: e.message || "Failed to prepare campaigns", loading: false });
      return 0;
    }
  },

  updateCampaignResponse: async (id, response, channel) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("outreach_campaigns")
      .update({
        response_received: response,
        response_channel: channel,
        responded_at: now,
      } as any)
      .eq("id", id);
    if (!error) {
      set((s) => ({
        campaigns: s.campaigns.map((c) =>
          c.id === id
            ? { ...c, response_received: response, response_channel: channel, responded_at: now }
            : c
        ),
      }));
    }
  },

  prepareCampaignsForSupplier: async (supplier, productName, objective, supplierTier) => {
    return get().prepareCampaigns([supplier], productName, objective, supplierTier);
  },
}));
