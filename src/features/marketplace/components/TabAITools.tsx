import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, DollarSign, Image, Hash, Languages, Loader2, Copy, Check, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ToolState {
  loading: boolean;
  result: string;
}

export function TabAITools() {
  // Description Generator
  const [descInput, setDescInput] = useState({ name: "", category: "", features: "", tone: "Professional" });
  const [descState, setDescState] = useState<ToolState>({ loading: false, result: "" });

  // Price Suggester
  const [priceInput, setPriceInput] = useState({ title: "", category: "", condition: "new", price: "", currency: "USD" });
  const [priceState, setPriceState] = useState<ToolState>({ loading: false, result: "" });

  // Hashtag Generator
  const [hashInput, setHashInput] = useState({ name: "", category: "", platform: "Instagram" });
  const [hashState, setHashState] = useState<ToolState>({ loading: false, result: "" });

  // Translator
  const [transInput, setTransInput] = useState({ title: "", description: "", targetLang: "French" });
  const [transState, setTransState] = useState<ToolState>({ loading: false, result: "" });

  const [copied, setCopied] = useState(false);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const callAI = async (type: string, payload: any, setter: (s: ToolState) => void) => {
    setter({ loading: true, result: "" });
    try {
      const { data, error } = await supabase.functions.invoke("marketplace-ai", { body: { type, payload } });
      if (error) throw error;
      setter({ loading: false, result: data?.result || "No result" });
    } catch {
      setter({ loading: false, result: "" });
      toast.error("AI request failed");
    }
  };

  const tools = [
    {
      id: "description",
      icon: Sparkles,
      title: "AI Description Generator",
      desc: "Generate compelling product descriptions",
      color: "text-violet-500",
    },
    {
      id: "price",
      icon: DollarSign,
      title: "AI Price Suggester",
      desc: "Get market-based pricing recommendations",
      color: "text-emerald-500",
    },
    {
      id: "image",
      icon: Image,
      title: "AI Image Enhancer",
      desc: "Enhance product images (coming soon)",
      color: "text-blue-500",
    },
    {
      id: "hashtag",
      icon: Hash,
      title: "AI Hashtag Generator",
      desc: "Platform-specific hashtags for reach",
      color: "text-pink-500",
    },
    {
      id: "translate",
      icon: Languages,
      title: "AI Listing Translator",
      desc: "Translate listings with cultural adaptations",
      color: "text-amber-500",
    },
  ];

  const [activeTool, setActiveTool] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <Card
              key={t.id}
              className={`cursor-pointer transition-all hover:shadow-md ${isActive ? "ring-2 ring-primary" : ""} ${t.id === "image" ? "opacity-60" : ""}`}
              onClick={() => t.id !== "image" && setActiveTool(isActive ? null : t.id)}
            >
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${t.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
                {t.id === "image" && <Badge variant="secondary" className="mt-2 text-[10px]">Coming Soon</Badge>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Description Generator */}
      {activeTool === "description" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Generate Product Description</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Product Name</Label>
                <Input value={descInput.name} onChange={(e) => setDescInput({ ...descInput, name: e.target.value })} placeholder="Product name" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Input value={descInput.category} onChange={(e) => setDescInput({ ...descInput, category: e.target.value })} placeholder="e.g. Electronics" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Key Features</Label>
              <Textarea value={descInput.features} onChange={(e) => setDescInput({ ...descInput, features: e.target.value })} placeholder="Bullet points of features..." rows={3} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tone</Label>
              <Select value={descInput.tone} onValueChange={(v) => setDescInput({ ...descInput, tone: v })}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Professional", "Casual", "Luxury", "Bargain"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => callAI("rewrite-description", { title: descInput.name, description: descInput.features, category: descInput.category, tone: descInput.tone }, setDescState)} disabled={descState.loading || !descInput.name}>
                {descState.loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />} Generate
              </Button>
              {descState.result && <Button variant="outline" onClick={() => callAI("rewrite-description", { title: descInput.name, description: descInput.features, category: descInput.category, tone: descInput.tone }, setDescState)}><RefreshCw className="w-4 h-4 mr-1" /> Regenerate</Button>}
            </div>
            {descState.result && (
              <div className="relative bg-muted rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{descState.result}</p>
                <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => copyText(descState.result)}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Price Suggester */}
      {activeTool === "price" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">AI Price Suggestion</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Product Name</Label>
                <Input value={priceInput.title} onChange={(e) => setPriceInput({ ...priceInput, title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Input value={priceInput.category} onChange={(e) => setPriceInput({ ...priceInput, category: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Your Price</Label>
                <Input type="number" value={priceInput.price} onChange={(e) => setPriceInput({ ...priceInput, price: e.target.value })} />
              </div>
            </div>
            <Button onClick={() => callAI("suggest-price", priceInput, setPriceState)} disabled={priceState.loading || !priceInput.title}>
              {priceState.loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <DollarSign className="w-4 h-4 mr-1" />} Suggest Price
            </Button>
            {priceState.result && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{priceState.result}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hashtag Generator */}
      {activeTool === "hashtag" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Generate Hashtags</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Product Name</Label>
                <Input value={hashInput.name} onChange={(e) => setHashInput({ ...hashInput, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Input value={hashInput.category} onChange={(e) => setHashInput({ ...hashInput, category: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Platform</Label>
                <Select value={hashInput.platform} onValueChange={(v) => setHashInput({ ...hashInput, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Instagram", "TikTok", "Both"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => callAI("suggest-tags", { title: hashInput.name, category: hashInput.category, platform: hashInput.platform }, setHashState)} disabled={hashState.loading || !hashInput.name}>
              {hashState.loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Hash className="w-4 h-4 mr-1" />} Generate
            </Button>
            {hashState.result && (
              <div className="relative bg-muted rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{hashState.result}</p>
                <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => copyText(hashState.result)}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Translator */}
      {activeTool === "translate" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Translate Listing</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input value={transInput.title} onChange={(e) => setTransInput({ ...transInput, title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Target Language</Label>
                <Select value={transInput.targetLang} onValueChange={(v) => setTransInput({ ...transInput, targetLang: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["French", "Arabic", "Spanish", "German", "Turkish", "Portuguese", "Indonesian", "Hindi"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea value={transInput.description} onChange={(e) => setTransInput({ ...transInput, description: e.target.value })} rows={3} />
            </div>
            <Button onClick={() => callAI("translate", { title: transInput.title, description: transInput.description, targetLanguage: transInput.targetLang }, setTransState)} disabled={transState.loading || !transInput.title}>
              {transState.loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Languages className="w-4 h-4 mr-1" />} Translate
            </Button>
            {transState.result && (
              <div className="relative bg-muted rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{transState.result}</p>
                <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => copyText(transState.result)}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
