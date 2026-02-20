import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Download, Monitor, Smartphone, Eye } from "lucide-react";
import { toast } from "sonner";
import type { LandingPageData, GeneratedImage } from "./types";
import { OrderForm } from "./OrderForm";

interface Props {
  landingPage: LandingPageData | null;
  images: GeneratedImage[];
  productName: string;
  userId: string;
}

export const LandingPageTab: React.FC<Props> = ({ landingPage, images, productName, userId }) => {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyHtml = async () => {
    if (!landingPage?.html) return;
    await navigator.clipboard.writeText(landingPage.html);
    setCopied(true);
    toast.success("HTML copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    if (!landingPage?.html) return;
    const blob = new Blob([landingPage.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName.replace(/\s/g, "-")}-landing-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML downloaded");
  };

  if (!landingPage) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Eye className="h-12 w-12 mb-3" />
        <p className="text-sm">Generate your marketing kit to see the landing page preview.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold">Landing Page</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={previewMode === "desktop" ? "default" : "outline"}
            onClick={() => setPreviewMode("desktop")}
          >
            <Monitor className="h-3 w-3 mr-1" /> Desktop
          </Button>
          <Button
            size="sm"
            variant={previewMode === "mobile" ? "default" : "outline"}
            onClick={() => setPreviewMode("mobile")}
          >
            <Smartphone className="h-3 w-3 mr-1" /> Mobile
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopyHtml}>
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            Copy HTML
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadHtml}>
            <Download className="h-3 w-3 mr-1" /> Export HTML
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <Card>
        <CardContent className="p-0">
          <div
            className={`mx-auto transition-all ${previewMode === "mobile" ? "max-w-[390px]" : "w-full"}`}
          >
            <iframe
              srcDoc={landingPage.html}
              className="w-full border-0 rounded-lg"
              style={{ height: "600px" }}
              title="Landing page preview"
              sandbox="allow-same-origin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {landingPage.sections.benefits.map((b, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">✓</span> {b}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {landingPage.sections.faq.map((f, i) => (
              <div key={i}>
                <p className="text-sm font-medium">{f.question}</p>
                <p className="text-xs text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Order Form */}
      <div className="space-y-2">
        <Button
          variant="outline"
          onClick={() => setShowOrderForm(!showOrderForm)}
          className="w-full"
        >
          {showOrderForm ? "Hide Order Form" : "Show Order Form Preview"}
        </Button>
        {showOrderForm && <OrderForm productName={productName} userId={userId} />}
      </div>
    </div>
  );
};
