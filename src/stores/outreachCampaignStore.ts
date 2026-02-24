import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

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
  prepareCampaigns: (suppliers: any[], productName?: string) => Promise<number>;
  updateCampaignResponse: (id: string, response: string, channel: string) => Promise<void>;
  prepareCampaignsForSupplier: (supplier: any, productName?: string) => Promise<number>;
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
    }
  },

  approveAll: async () => {
    const draftIds = get().campaigns.filter((c) => c.status === "draft").map((c) => c.id);
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

  prepareCampaigns: async (suppliers, productName) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.functions.invoke("prepare-outreach-campaigns", {
        body: { suppliers, productName },
      });
      if (error) throw error;
      if (data?.error) {
        set({ error: data.error, loading: false });
        return 0;
      }
      await get().fetchCampaigns();
      set({ loading: false });
      return data?.campaigns_created || 0;
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

  prepareCampaignsForSupplier: async (supplier, productName) => {
    return get().prepareCampaigns([supplier], productName);
  },
}));
