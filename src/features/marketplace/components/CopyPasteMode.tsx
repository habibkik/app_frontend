import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, ExternalLink, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyPasteModeProps {
  platformName: string;
  platformUrl: string;
  postUrl?: string;
  title: string;
  description: string;
  price: string;
  tags: string[];
}

export function CopyPasteMode({ platformName, platformUrl, postUrl, title, description, price, tags }: CopyPasteModeProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const fields = [
    { label: "Title", value: title },
    { label: "Description", value: description },
    { label: "Price", value: price },
    { label: "Tags", value: tags.join(", ") },
  ];

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          📋 Copy & Post to {platformName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((f) => (
          <div key={f.label} className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{f.label}</p>
              <p className="text-sm truncate">{f.value || "—"}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 h-7 w-7 p-0"
              onClick={() => copyToClipboard(f.value, f.label)}
            >
              {copied === f.label ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        ))}

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => {
              const all = fields.map((f) => `${f.label}: ${f.value}`).join("\n\n");
              copyToClipboard(all, "All fields");
            }}
          >
            <Copy className="w-3 h-3 mr-1" /> Copy All
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs"
            onClick={() => window.open(postUrl || platformUrl, "_blank")}
          >
            <ExternalLink className="w-3 h-3 mr-1" /> Open {platformName}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
