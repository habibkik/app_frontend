import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Download, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { useContentStudioStore } from "@/stores/contentStudioStore";
import { useNavigate } from "react-router-dom";
import type { EmailCampaign, GeneratedImage } from "./types";

interface Props {
  campaigns: EmailCampaign[];
  images: GeneratedImage[];
}

export const EmailCampaignTab: React.FC<Props> = ({ campaigns, images }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const setPendingPublisherPost = useContentStudioStore((s) => s.setPendingPublisherPost);
  const navigate = useNavigate();

  const handleCopy = async (html: string, id: string) => {
    await navigator.clipboard.writeText(html);
    setCopiedId(id);
    toast.success("Email HTML copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (html: string, name: string) => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s/g, "-")}-email.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Email downloaded");
  };

  const getImage = (imageId: string) => images.find((i) => i.id === imageId);

  const buildEmailHtml = (campaign: EmailCampaign) => {
    const img = getImage(campaign.imageId);
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:Arial,sans-serif;margin:0;padding:0;background:#f5f5f5}
.container{max-width:600px;margin:0 auto;background:#fff;padding:32px}
.header{text-align:center;margin-bottom:24px}
.cta{display:inline-block;background:#2563eb;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0}
</style></head><body>
<div class="container">
<div class="header">${img?.imageUrl ? `<img src="${img.imageUrl}" alt="Product" style="max-width:100%;border-radius:8px"/>` : ""}</div>
<h2>${campaign.subjectLine}</h2>
<p style="color:#666">${campaign.previewText}</p>
<div>${campaign.body.replace(/\n/g, "<br/>")}</div>
<div style="text-align:center"><a href="#" class="cta">${campaign.cta}</a></div>
<p style="color:#999;font-size:12px;text-align:center;margin-top:32px">
You're receiving this because you expressed interest. <a href="#">Unsubscribe</a>
</p></div></body></html>`;
  };

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Mail className="h-12 w-12 mb-3" />
        <p className="text-sm">Generate your marketing kit to see email campaigns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Email Campaigns</h3>
      <p className="text-sm text-muted-foreground">
        5 email marketing campaigns with personalization and responsive layouts.
      </p>
      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const html = buildEmailHtml(campaign);
          return (
            <Card key={campaign.id}>
              <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{campaign.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleCopy(html, campaign.id)}>
                        {copiedId === campaign.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDownload(html, campaign.name)}>
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        const content = `📧 ${campaign.subjectLine}\n\n${campaign.body}\n\n${campaign.cta}`;
                        setPendingPublisherPost({ content, platform: "email" });
                        navigate("/dashboard/publisher");
                        toast.success("Email campaign sent to Publisher");
                      }}>
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Badge variant="outline" className="text-xs mb-1">Subject</Badge>
                  <p className="text-sm font-medium">{campaign.subjectLine}</p>
                </div>
                <div>
                  <Badge variant="outline" className="text-xs mb-1">Preview</Badge>
                  <p className="text-xs text-muted-foreground">{campaign.previewText}</p>
                </div>
                <div>
                  <Badge variant="outline" className="text-xs mb-1">CTA</Badge>
                  <p className="text-sm font-semibold text-primary">{campaign.cta}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setExpandedId(expandedId === campaign.id ? null : campaign.id)}
                >
                  {expandedId === campaign.id ? "Hide Preview" : "Show Preview"}
                </Button>
                {expandedId === campaign.id && (
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={html}
                      className="w-full border-0"
                      style={{ height: "400px" }}
                      title={`Email preview: ${campaign.name}`}
                      sandbox="allow-same-origin"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
