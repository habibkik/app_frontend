import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  username?: string;
  features: {
    posting: boolean;
    messaging: boolean;
    analytics: boolean;
  };
  requiredFields: { key: string; label: string; placeholder: string }[];
}

const platformConfigs: SocialPlatform[] = [
  {
    id: "twitter",
    name: "Twitter / X",
    icon: "𝕏",
    connected: false,
    features: { posting: true, messaging: true, analytics: true },
    requiredFields: [
      { key: "apiKey", label: "API Key (Consumer Key)", placeholder: "Enter your API key" },
      { key: "apiSecret", label: "API Secret (Consumer Secret)", placeholder: "Enter your API secret" },
      { key: "accessToken", label: "Access Token", placeholder: "Enter your access token" },
      { key: "accessTokenSecret", label: "Access Token Secret", placeholder: "Enter your access token secret" },
    ],
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "f",
    connected: false,
    features: { posting: true, messaging: true, analytics: true },
    requiredFields: [
      { key: "pageId", label: "Page ID", placeholder: "Enter your Facebook Page ID" },
      { key: "accessToken", label: "Page Access Token", placeholder: "Enter your page access token" },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📷",
    connected: false,
    features: { posting: true, messaging: true, analytics: true },
    requiredFields: [
      { key: "accountId", label: "Instagram Business Account ID", placeholder: "Enter your account ID" },
      { key: "accessToken", label: "Access Token", placeholder: "Enter your access token" },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "in",
    connected: false,
    features: { posting: true, messaging: true, analytics: true },
    requiredFields: [
      { key: "accessToken", label: "Access Token", placeholder: "Enter your OAuth access token" },
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: "💬",
    connected: false,
    features: { posting: false, messaging: true, analytics: true },
    requiredFields: [
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "Enter your WhatsApp phone number ID" },
      { key: "accessToken", label: "Access Token", placeholder: "Enter your access token" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "♪",
    connected: false,
    features: { posting: true, messaging: false, analytics: true },
    requiredFields: [
      { key: "accessToken", label: "Access Token", placeholder: "Enter your TikTok access token" },
    ],
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "▶",
    connected: false,
    features: { posting: true, messaging: false, analytics: true },
    requiredFields: [
      { key: "accessToken", label: "Access Token", placeholder: "Enter your YouTube API access token" },
    ],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "📌",
    connected: false,
    features: { posting: true, messaging: false, analytics: true },
    requiredFields: [
      { key: "accessToken", label: "Access Token", placeholder: "Enter your Pinterest access token" },
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "✈️",
    connected: false,
    features: { posting: true, messaging: true, analytics: false },
    requiredFields: [
      { key: "botToken", label: "Bot Token (from BotFather)", placeholder: "Enter your Telegram bot token" },
    ],
  },
];

export function useSocialCredentials() {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(platformConfigs);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const fetchCredentials = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_social_credentials")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      setPlatforms((prev) =>
        prev.map((platform) => {
          const saved = data?.find((c: any) => c.platform === platform.id);
          return saved
            ? { ...platform, connected: saved.is_connected, username: saved.username }
            : platform;
        })
      );
    } catch (error) {
      console.error("Error fetching credentials:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const connectPlatform = async (
    platformId: string,
    credentials: Record<string, string>
  ) => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("social-credentials", {
        body: { platform: platformId, credentials, action: "connect" },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "Connected!",
        description: `Successfully connected to ${platforms.find(p => p.id === platformId)?.name}`,
      });

      await fetchCredentials();
      return { success: true, username: data.username };
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setConnecting(false);
    }
  };

  const disconnectPlatform = async (platformId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("social-credentials", {
        body: { platform: platformId, action: "disconnect" },
      });

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: "Social media account has been disconnected",
      });

      await fetchCredentials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const testCredentials = async (
    platformId: string,
    credentials: Record<string, string>
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("social-credentials", {
        body: { platform: platformId, credentials, action: "test" },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const getConnectedPlatforms = () => platforms.filter((p) => p.connected);

  return {
    platforms,
    loading,
    connecting,
    connectPlatform,
    disconnectPlatform,
    testCredentials,
    getConnectedPlatforms,
    refreshCredentials: fetchCredentials,
  };
}
