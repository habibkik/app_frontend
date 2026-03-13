import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";

const platforms = [
  { id: "instagram-reel", name: "Instagram Reel", icon: Instagram },
  { id: "tiktok-video", name: "TikTok Video", icon: Video },
  { id: "facebook-reel", name: "Facebook Reel", icon: Facebook },
  { id: "linkedin-video", name: "LinkedIn Video", icon: Linkedin },
  { id: "twitter-video", name: "X/Twitter Video", icon: Twitter },
];

export const SocialVideoPostsTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">{t("socialVideo.title")}</h3>
        <Badge variant="secondary" className="bg-accent text-accent-foreground">{t("socialVideo.comingSoon")}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("socialVideo.description")}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {platforms.map((p) => (
          <Card key={p.id} className="border-dashed opacity-75">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <p.icon className="h-4 w-4 text-primary" />
                {p.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Video className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• {t("socialVideo.captionWithHook")}</p>
                <p>• {t("socialVideo.platformOptimized")}</p>
                <p>• {t("socialVideo.attachedVideo")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};