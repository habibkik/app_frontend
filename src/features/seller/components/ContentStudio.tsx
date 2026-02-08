 import React, { useState, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import {
   Wand2,
   Sparkles,
   Copy,
   Check,
   Heart,
   RefreshCw,
   Edit,
   Save,
   Download,
   Share2,
   FileArchive,
   Mail,
   Eye,
   Send,
   History,
   Trash2,
   ChevronDown,
   ChevronUp,
   Megaphone,
   FileText,
   Globe,
   Instagram,
   Facebook,
   Linkedin,
   Twitter,
   Loader2,
 } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Textarea } from "@/components/ui/textarea";
 import { Badge } from "@/components/ui/badge";
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Separator } from "@/components/ui/separator";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
 import { Label } from "@/components/ui/label";
 import { toast } from "sonner";
  import { cn } from "@/lib/utils";
   import { useContentStudioStore } from "@/stores/contentStudioStore";
  import { generateMarketingContent } from "@/features/agents/miromind/contentGeneration";
  import type { GeneratedContent as AIGeneratedContent } from "@/features/agents/miromind/contentGeneration";
  import { supabase } from "@/integrations/supabase/client";
 
 // Types
 interface ContentProduct {
   id: string;
   name: string;
   imageUrl?: string;
   category: string;
 }
 
 type TargetAudience = "ecommerce" | "wholesale" | "retailers" | "b2b" | "other";
 type ContentType = "ad_copy" | "description" | "email" | "social" | "landing";
 type ContentTone = "professional" | "friendly" | "humorous" | "urgent";
 
 interface GeneratedHeadline {
   id: string;
   text: string;
   liked: boolean;
 }
 
 interface GeneratedAdCopy {
   id: string;
   variant: "short" | "medium" | "long";
   text: string;
   characterCount: number;
 }
 
 interface GeneratedDescription {
   id: string;
   variant: "short" | "medium" | "long";
   text: string;
   features?: string[];
   benefits?: string[];
 }
 
 interface GeneratedEmail {
   subjectLines: string[];
   body: string;
   hook: string;
   valueProp: string;
   cta: string;
 }
 
 interface SocialCaption {
   platform: "instagram" | "tiktok" | "facebook" | "linkedin" | "twitter";
   caption: string;
   hashtags?: string[];
   characterCount: number;
   characterLimit: number;
 }
 
 interface ContentHistoryItem {
   id: string;
   productId: string;
   productName: string;
   productThumbnail?: string;
   contentType: ContentType;
   generatedAt: Date;
 }
 
 interface GeneratedContent {
   headlines: GeneratedHeadline[];
   adCopy: GeneratedAdCopy[];
   descriptions: GeneratedDescription[];
   email: GeneratedEmail | null;
   social: SocialCaption[];
 }
 
 // Mock Data
 const mockProducts: ContentProduct[] = [
   { id: "1", name: "Servo Motor XR-500", imageUrl: "/placeholder.svg", category: "Motors" },
   { id: "2", name: "Hydraulic Pump HP-200", imageUrl: "/placeholder.svg", category: "Pumps" },
   { id: "3", name: "CNC Controller Board", imageUrl: "/placeholder.svg", category: "Electronics" },
 ];
 
 const audiences = [
   { value: "ecommerce", label: "E-commerce Shoppers" },
   { value: "wholesale", label: "Wholesale Buyers" },
   { value: "retailers", label: "Retailers" },
   { value: "b2b", label: "Corporate/B2B" },
   { value: "other", label: "Other" },
 ];
 
 const contentTypeOptions = [
   { id: "ad_copy" as ContentType, label: "Ad copy (short)", icon: Megaphone },
   { id: "description" as ContentType, label: "Product description (long)", icon: FileText },
   { id: "email" as ContentType, label: "Email campaign", icon: Mail },
   { id: "social" as ContentType, label: "Social media posts", icon: Share2 },
   { id: "landing" as ContentType, label: "Landing page copy", icon: Globe },
 ];
 
 const toneOptions = [
   { value: "professional", label: "Professional" },
   { value: "friendly", label: "Friendly" },
   { value: "humorous", label: "Humorous" },
   { value: "urgent", label: "Urgent/FOMO" },
 ];
 
 const generateMockContent = (productName: string): GeneratedContent => ({
   headlines: [
     { id: "h1", text: `The Ultimate ${productName} - Now 30% Off`, liked: false },
     { id: "h2", text: `Why 10,000+ Customers Choose ${productName}`, liked: false },
     { id: "h3", text: `${productName} That Actually Works - Guaranteed`, liked: false },
     { id: "h4", text: `Transform Your Business with ${productName} Today`, liked: false },
     { id: "h5", text: `Premium ${productName} at Unbeatable Prices`, liked: false },
   ],
   adCopy: [
     {
       id: "ac1",
       variant: "short",
       text: `Best-selling ${productName}. Fast shipping. Guaranteed quality. Order now!`,
       characterCount: 65,
     },
     {
       id: "ac2",
       variant: "medium",
       text: `Tired of low-quality equipment? Our ${productName} is built to last with industrial-grade components and backed by our 5-year warranty. Join thousands of satisfied customers.`,
       characterCount: 178,
     },
     {
       id: "ac3",
       variant: "long",
       text: `Introducing the ${productName} - the industry's most reliable solution for demanding applications. Engineered with precision components and cutting-edge technology, this powerhouse delivers exceptional performance day after day. Whether you're scaling operations or upgrading your equipment, our ${productName} provides unmatched durability and efficiency. Order today and experience the difference quality makes.`,
       characterCount: 412,
     },
   ],
   descriptions: [
     {
       id: "d1",
       variant: "short",
       text: `High-performance ${productName} designed for industrial applications. Features precision engineering and robust construction.`,
       features: ["Industrial-grade", "Precision engineered", "5-year warranty"],
       benefits: ["Reduced downtime", "Lower maintenance costs"],
     },
     {
       id: "d2",
       variant: "medium",
       text: `The ${productName} represents the pinnacle of industrial engineering. Built with premium materials and designed for 24/7 operation, this unit delivers consistent performance in demanding environments. Features include advanced thermal management, modular design for easy maintenance, and smart diagnostics.`,
       features: ["Advanced thermal management", "Modular design", "Smart diagnostics", "24/7 operation capable"],
       benefits: ["50% longer lifespan", "Easy maintenance", "Real-time monitoring"],
     },
     {
       id: "d3",
       variant: "long",
       text: `Experience industrial excellence with our flagship ${productName}. This precision-engineered solution combines cutting-edge technology with rugged reliability to meet the most demanding operational requirements.\n\nKey Features:\n• Advanced servo control system for precise positioning\n• Industrial-grade construction rated for continuous duty\n• Integrated smart sensors for predictive maintenance\n• Energy-efficient design reducing power consumption by 30%\n• Modular architecture for easy serviceability\n\nBenefits:\n• Maximize uptime with 99.9% reliability\n• Reduce total cost of ownership\n• Future-proof your operations with upgradeable firmware\n• Comprehensive 5-year warranty with 24/7 support`,
       features: ["Servo control", "Continuous duty rated", "Smart sensors", "Energy efficient", "Modular architecture"],
       benefits: ["99.9% reliability", "Lower TCO", "Future-proof", "5-year warranty"],
     },
   ],
   email: {
     subjectLines: [
       `🚀 Exclusive: ${productName} Now Available at 30% Off`,
       `Your ${productName} Upgrade Awaits - Limited Time Offer`,
       `Industry Leaders Choose ${productName} - Here's Why`,
     ],
     body: `Hi [Name],
 
 Are you still struggling with unreliable equipment that costs you time and money?
 
 Introducing our new ${productName} - engineered for professionals who demand the best.
 
 Here's what makes it different:
 ✅ Industrial-grade components rated for 24/7 operation
 ✅ Smart diagnostics to prevent costly downtime
 ✅ 5-year comprehensive warranty
 
 For a limited time, we're offering our valued customers an exclusive 30% discount.
 
 [Shop Now Button]
 
 Best regards,
 The Team`,
     hook: "Are you still struggling with unreliable equipment?",
     valueProp: "Industrial-grade components, smart diagnostics, 5-year warranty",
     cta: "Shop Now - 30% Off",
   },
   social: [
     {
       platform: "instagram",
       caption: `✨ Elevate your operations with our premium ${productName}! 🚀\n\nBuilt for professionals who demand excellence:\n🔧 Industrial-grade construction\n⚡ Energy efficient design\n🛡️ 5-year warranty\n\nLink in bio to learn more!\n\n#IndustrialEquipment #QualityFirst #Innovation #Manufacturing #Engineering`,
       hashtags: ["IndustrialEquipment", "QualityFirst", "Innovation", "Manufacturing", "Engineering"],
       characterCount: 298,
       characterLimit: 2200,
     },
     {
       platform: "tiktok",
       caption: `POV: You finally upgraded to the ${productName} and your productivity went 📈\n\n#IndustrialTech #Manufacturing #UpgradeTime #WorkSmarter`,
       hashtags: ["IndustrialTech", "Manufacturing", "UpgradeTime", "WorkSmarter"],
       characterCount: 120,
       characterLimit: 2200,
     },
     {
       platform: "facebook",
       caption: `🔥 NEW ARRIVAL 🔥\n\nMeet the ${productName} - your new secret weapon for maximum productivity.\n\n✅ Industrial-grade reliability\n✅ Smart monitoring technology\n✅ 5-year comprehensive warranty\n\nLimited time offer: Get 30% off your order!\n\nComment "INFO" to learn more or click the link to shop now. 👇`,
       characterCount: 312,
       characterLimit: 63206,
     },
     {
       platform: "linkedin",
       caption: `Excited to announce our latest innovation in industrial equipment: the ${productName}.\n\nAfter extensive R&D, we've developed a solution that addresses the key pain points our customers face:\n\n📊 30% improvement in energy efficiency\n🔧 Modular design for simplified maintenance\n📱 IoT-enabled smart diagnostics\n\nThe result? Lower total cost of ownership and maximized uptime for your operations.\n\nInterested in learning how the ${productName} can benefit your business? Let's connect.`,
       characterCount: 478,
       characterLimit: 3000,
     },
     {
       platform: "twitter",
       caption: `🚀 New drop: ${productName}\n\n✓ Industrial-grade\n✓ Smart diagnostics\n✓ 5-year warranty\n\n30% off for a limited time →`,
       characterCount: 124,
       characterLimit: 280,
     },
   ],
 });
 
 // Platform icons component
 const PlatformIcon = ({ platform, className }: { platform: string; className?: string }) => {
   switch (platform) {
     case "instagram":
       return <Instagram className={className} />;
     case "facebook":
       return <Facebook className={className} />;
     case "linkedin":
       return <Linkedin className={className} />;
     case "twitter":
       return <Twitter className={className} />;
     case "tiktok":
       return (
         <svg className={className} viewBox="0 0 24 24" fill="currentColor">
           <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
         </svg>
       );
     default:
       return null;
   }
 };
 
 // Platform colors
 const getPlatformStyles = (platform: string) => {
   switch (platform) {
     case "instagram":
      return "bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground";
     case "tiktok":
      return "bg-foreground text-background";
     case "facebook":
      return "bg-primary text-primary-foreground";
     case "linkedin":
      return "bg-primary/90 text-primary-foreground";
     case "twitter":
      return "bg-foreground text-background";
     default:
       return "bg-muted";
   }
 };
 
  export const ContentStudio = () => {
    const addStudioItem = useContentStudioStore((s) => s.addItem);
   // State
   const [selectedProduct, setSelectedProduct] = useState<string>("");
   const [targetAudience, setTargetAudience] = useState<TargetAudience>("ecommerce");
   const [contentTypes, setContentTypes] = useState<Set<ContentType>>(new Set(["ad_copy", "social"]));
   const [tone, setTone] = useState<ContentTone>("professional");
   const [isGenerating, setIsGenerating] = useState(false);
   const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
   const [editingStates, setEditingStates] = useState<Set<string>>(new Set());
   const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
   const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());
   const [showHistory, setShowHistory] = useState(false);
   const [historyItems, setHistoryItems] = useState<ContentHistoryItem[]>([]);
   const [activeTab, setActiveTab] = useState("headlines");
 
   const selectedProductData = mockProducts.find((p) => p.id === selectedProduct);
 
   // Handlers
   const handleContentTypeToggle = (type: ContentType) => {
     setContentTypes((prev) => {
       const next = new Set(prev);
       if (next.has(type)) {
         next.delete(type);
       } else {
         next.add(type);
       }
       return next;
     });
   };
 
    const handleGenerate = async () => {
      if (!selectedProduct) {
        toast.error("Please select a product first");
        return;
      }
      if (contentTypes.size === 0) {
        toast.error("Please select at least one content type");
        return;
      }

      setIsGenerating(true);
      const productName = selectedProductData?.name || "Product";
      const productDescription = selectedProductData?.category || "";

      try {
        const aiResult: AIGeneratedContent = await generateMarketingContent(
          productName,
          productDescription,
          targetAudience,
          tone
        );

        // Transform AI response to local GeneratedContent format
        const content: GeneratedContent = {
          headlines: (aiResult.headlines || []).map((text, i) => ({
            id: `h${i + 1}`,
            text,
            liked: false,
          })),
          adCopy: [
            { id: "ac1", variant: "short" as const, text: aiResult.adCopy?.short || "", characterCount: (aiResult.adCopy?.short || "").length },
            { id: "ac2", variant: "medium" as const, text: aiResult.adCopy?.medium || "", characterCount: (aiResult.adCopy?.medium || "").length },
            { id: "ac3", variant: "long" as const, text: aiResult.adCopy?.long || "", characterCount: (aiResult.adCopy?.long || "").length },
          ],
          descriptions: [
            { id: "d1", variant: "short" as const, text: aiResult.descriptions?.short || "" },
            { id: "d2", variant: "medium" as const, text: aiResult.descriptions?.medium || "" },
            { id: "d3", variant: "long" as const, text: aiResult.descriptions?.long || "" },
          ],
          email: aiResult.emailCampaign ? {
            subjectLines: aiResult.emailCampaign.subjects || [],
            body: aiResult.emailCampaign.body || "",
            hook: "",
            valueProp: "",
            cta: "",
          } : null,
          social: [
            aiResult.socialMedia?.instagram ? {
              platform: "instagram" as const,
              caption: aiResult.socialMedia.instagram.caption,
              hashtags: aiResult.socialMedia.instagram.hashtags,
              characterCount: aiResult.socialMedia.instagram.caption.length,
              characterLimit: 2200,
            } : null,
            aiResult.socialMedia?.tiktok ? {
              platform: "tiktok" as const,
              caption: aiResult.socialMedia.tiktok.caption,
              hashtags: aiResult.socialMedia.tiktok.hashtags,
              characterCount: aiResult.socialMedia.tiktok.caption.length,
              characterLimit: 2200,
            } : null,
            aiResult.socialMedia?.facebook ? {
              platform: "facebook" as const,
              caption: aiResult.socialMedia.facebook.copy,
              hashtags: [],
              characterCount: aiResult.socialMedia.facebook.copy.length,
              characterLimit: 63206,
            } : null,
            aiResult.socialMedia?.linkedin ? {
              platform: "linkedin" as const,
              caption: aiResult.socialMedia.linkedin.copy,
              hashtags: [],
              characterCount: aiResult.socialMedia.linkedin.copy.length,
              characterLimit: 3000,
            } : null,
            aiResult.socialMedia?.twitter ? {
              platform: "twitter" as const,
              caption: aiResult.socialMedia.twitter.copy,
              hashtags: aiResult.socialMedia.twitter.hashtag ? [aiResult.socialMedia.twitter.hashtag] : [],
              characterCount: aiResult.socialMedia.twitter.copy.length,
              characterLimit: 280,
            } : null,
          ].filter(Boolean) as SocialCaption[],
        };

        setGeneratedContent(content);

        // Push to shared store for SocialPublisher
        addStudioItem({
          id: Date.now().toString(),
          productName,
          generatedAt: new Date().toISOString(),
          headlines: content.headlines.map((h) => h.text),
          adCopy: {
            short: content.adCopy.find((a) => a.variant === "short")?.text || "",
            medium: content.adCopy.find((a) => a.variant === "medium")?.text || "",
            long: content.adCopy.find((a) => a.variant === "long")?.text || "",
          },
          socialCaptions: content.social.map((s) => ({
            platform: s.platform,
            caption: s.caption,
            hashtags: s.hashtags,
          })),
        });

        // Add to history
        const historyItem: ContentHistoryItem = {
          id: Date.now().toString(),
          productId: selectedProduct,
          productName,
          productThumbnail: selectedProductData?.imageUrl,
          contentType: Array.from(contentTypes)[0],
          generatedAt: new Date(),
        };
        setHistoryItems((prev) => [historyItem, ...prev].slice(0, 10));

        toast.success("Content generated with AI successfully!");
      } catch (error) {
        console.error("Content generation error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to generate content");
      } finally {
        setIsGenerating(false);
      }
    };
 
   const handleCopy = async (text: string, id: string) => {
     await navigator.clipboard.writeText(text);
     setCopiedIds((prev) => new Set(prev).add(id));
     toast.success("Copied to clipboard!");
     setTimeout(() => {
       setCopiedIds((prev) => {
         const next = new Set(prev);
         next.delete(id);
         return next;
       });
     }, 2000);
   };
 
   const handleLikeHeadline = (id: string) => {
     if (!generatedContent) return;
     setGeneratedContent({
       ...generatedContent,
       headlines: generatedContent.headlines.map((h) =>
         h.id === id ? { ...h, liked: !h.liked } : h
       ),
     });
   };
 
   const handleRegenerateHeadline = async (id: string) => {
     if (!generatedContent || !selectedProductData) return;
     const productName = selectedProductData.name;
     const newHeadlines = [
       `Discover the Power of ${productName}`,
       `${productName}: Built for Excellence`,
       `Upgrade to ${productName} Today`,
       `The Smart Choice: ${productName}`,
       `${productName} - Where Quality Meets Performance`,
     ];
     const randomHeadline = newHeadlines[Math.floor(Math.random() * newHeadlines.length)];
     setGeneratedContent({
       ...generatedContent,
       headlines: generatedContent.headlines.map((h) =>
         h.id === id ? { ...h, text: randomHeadline } : h
       ),
     });
     toast.success("Headline regenerated!");
   };
 
   const toggleEdit = (id: string, currentText: string) => {
     setEditingStates((prev) => {
       const next = new Set(prev);
       if (next.has(id)) {
         next.delete(id);
       } else {
         next.add(id);
         setEditedTexts((prev) => ({ ...prev, [id]: currentText }));
       }
       return next;
     });
   };
 
   const handleSaveEdit = (id: string, type: "adCopy" | "description") => {
     if (!generatedContent) return;
     const newText = editedTexts[id];
     if (type === "adCopy") {
       setGeneratedContent({
         ...generatedContent,
         adCopy: generatedContent.adCopy.map((ac) =>
           ac.id === id ? { ...ac, text: newText, characterCount: newText.length } : ac
         ),
       });
     } else {
       setGeneratedContent({
         ...generatedContent,
         descriptions: generatedContent.descriptions.map((d) =>
           d.id === id ? { ...d, text: newText } : d
         ),
       });
     }
     setEditingStates((prev) => {
       const next = new Set(prev);
       next.delete(id);
       return next;
     });
     toast.success("Changes saved!");
   };
 
   const handleDeleteHistory = (id: string) => {
     setHistoryItems((prev) => prev.filter((item) => item.id !== id));
     toast.success("History item deleted");
   };
 
   const handleExportZip = () => {
     toast.success("Export started - your ZIP file will download shortly");
   };
 
   const handleSaveTemplate = () => {
     toast.success("Template saved successfully!");
   };
 
   const handleShare = () => {
     toast.success("Share link copied to clipboard!");
   };
 
   return (
     <div className="flex flex-col lg:flex-row gap-6 min-h-screen p-4 lg:p-6">
       {/* Left Panel - Settings */}
       <div className="w-full lg:w-80 lg:sticky lg:top-6 lg:self-start">
         <Card className="border-2">
           <CardHeader className="pb-4">
             <CardTitle className="flex items-center gap-2 text-lg">
               <Sparkles className="h-5 w-5 text-primary" />
               Content Settings
             </CardTitle>
             <CardDescription>Configure your content generation</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
             {/* Product Selector */}
             <div className="space-y-2">
               <Label className="text-sm font-medium">Product</Label>
               <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                 <SelectTrigger>
                   <SelectValue placeholder="Select a product" />
                 </SelectTrigger>
                 <SelectContent>
                   {mockProducts.map((product) => (
                     <SelectItem key={product.id} value={product.id}>
                       {product.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               {selectedProductData && (
                 <div className="flex items-center gap-3 mt-3 p-3 bg-muted rounded-lg">
                   <img
                     src={selectedProductData.imageUrl}
                     alt={selectedProductData.name}
                     className="w-12 h-12 rounded-md object-cover"
                   />
                   <div>
                     <p className="text-sm font-medium">{selectedProductData.name}</p>
                     <p className="text-xs text-muted-foreground">{selectedProductData.category}</p>
                   </div>
                 </div>
               )}
             </div>
 
             <Separator />
 
             {/* Target Audience */}
             <div className="space-y-2">
               <Label className="text-sm font-medium">Target Audience</Label>
               <Select value={targetAudience} onValueChange={(v) => setTargetAudience(v as TargetAudience)}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {audiences.map((audience) => (
                     <SelectItem key={audience.value} value={audience.value}>
                       {audience.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             <Separator />
 
             {/* Content Types */}
             <div className="space-y-3">
               <Label className="text-sm font-medium">Content Types</Label>
               {contentTypeOptions.map((option) => (
                 <div key={option.id} className="flex items-center gap-3">
                   <Checkbox
                     id={option.id}
                     checked={contentTypes.has(option.id)}
                     onCheckedChange={() => handleContentTypeToggle(option.id)}
                   />
                   <option.icon className="h-4 w-4 text-muted-foreground" />
                   <Label htmlFor={option.id} className="text-sm cursor-pointer">
                     {option.label}
                   </Label>
                 </div>
               ))}
             </div>
 
             <Separator />
 
             {/* Tone Selector */}
             <div className="space-y-2">
               <Label className="text-sm font-medium">Tone</Label>
               <Select value={tone} onValueChange={(v) => setTone(v as ContentTone)}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {toneOptions.map((t) => (
                     <SelectItem key={t.value} value={t.value}>
                       {t.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             {/* Generate Button */}
             <Button
               onClick={handleGenerate}
               disabled={isGenerating || !selectedProduct}
               className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
             >
               {isGenerating ? (
                 <>
                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                   Generating...
                 </>
               ) : (
                 <>
                   <Wand2 className="mr-2 h-5 w-5" />
                   Generate Content
                 </>
               )}
             </Button>
           </CardContent>
         </Card>
       </div>
 
       {/* Right Panel - Content Tabs */}
       <div className="flex-1 min-w-0">
         {generatedContent ? (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
           >
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
               <TabsList className="grid w-full grid-cols-5 mb-6">
                 <TabsTrigger value="headlines">Headlines</TabsTrigger>
                 <TabsTrigger value="copy">Copy</TabsTrigger>
                 <TabsTrigger value="description">Description</TabsTrigger>
                 <TabsTrigger value="email">Email</TabsTrigger>
                 <TabsTrigger value="social">Social</TabsTrigger>
               </TabsList>
 
               {/* Headlines Tab */}
               <TabsContent value="headlines" className="space-y-4">
                 <AnimatePresence>
                   {generatedContent.headlines.map((headline, index) => (
                     <motion.div
                       key={headline.id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: index * 0.1 }}
                     >
                       <Card className="hover:shadow-md transition-shadow">
                         <CardContent className="p-4">
                           <div className="flex items-start justify-between gap-4">
                             <p className="text-lg font-semibold flex-1">{headline.text}</p>
                             <div className="flex items-center gap-2">
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => handleCopy(headline.text, headline.id)}
                               >
                                 {copiedIds.has(headline.id) ? (
                                   <Check className="h-4 w-4 text-primary" />
                                 ) : (
                                   <Copy className="h-4 w-4" />
                                 )}
                               </Button>
                               <Button variant="ghost" size="icon" onClick={() => handleLikeHeadline(headline.id)}>
                                 <Heart
                                   className={cn(
                                     "h-4 w-4 transition-colors",
                                     headline.liked ? "fill-destructive text-destructive" : ""
                                   )}
                                 />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => handleRegenerateHeadline(headline.id)}
                               >
                                 <RefreshCw className="h-4 w-4" />
                               </Button>
                               <Button variant="outline" size="sm">
                                 Use in Ad
                               </Button>
                             </div>
                           </div>
                         </CardContent>
                       </Card>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </TabsContent>
 
               {/* Copy Tab */}
               <TabsContent value="copy" className="space-y-4">
                 {generatedContent.adCopy.map((copy, index) => (
                   <motion.div
                     key={copy.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.1 }}
                   >
                     <Card className="hover:shadow-md transition-shadow">
                       <CardHeader className="pb-2">
                         <div className="flex items-center justify-between">
                           <Badge variant="secondary" className="capitalize">
                             {copy.variant}
                           </Badge>
                           <span className="text-sm text-muted-foreground">
                             {copy.characterCount} characters
                           </span>
                         </div>
                       </CardHeader>
                       <CardContent className="space-y-4">
                         {editingStates.has(copy.id) ? (
                           <Textarea
                             value={editedTexts[copy.id] || copy.text}
                             onChange={(e) =>
                               setEditedTexts((prev) => ({ ...prev, [copy.id]: e.target.value }))
                             }
                             className="min-h-[100px]"
                           />
                         ) : (
                           <p className="text-sm leading-relaxed">{copy.text}</p>
                         )}
                         <div className="flex items-center gap-2 flex-wrap">
                           {editingStates.has(copy.id) ? (
                             <Button
                               variant="default"
                               size="sm"
                               onClick={() => handleSaveEdit(copy.id, "adCopy")}
                             >
                               <Save className="h-4 w-4 mr-1" />
                               Save
                             </Button>
                           ) : (
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => toggleEdit(copy.id, copy.text)}
                             >
                               <Edit className="h-4 w-4 mr-1" />
                               Edit
                             </Button>
                           )}
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleCopy(copy.text, copy.id)}
                           >
                             {copiedIds.has(copy.id) ? (
                               <Check className="h-4 w-4 mr-1 text-primary" />
                             ) : (
                               <Copy className="h-4 w-4 mr-1" />
                             )}
                             Copy
                           </Button>
                           <Button variant="outline" size="sm">
                             <Facebook className="h-4 w-4 mr-1" />
                             Use in Facebook Ad
                           </Button>
                         </div>
                       </CardContent>
                     </Card>
                   </motion.div>
                 ))}
               </TabsContent>
 
               {/* Description Tab */}
               <TabsContent value="description" className="space-y-4">
                 {generatedContent.descriptions.map((desc, index) => (
                   <motion.div
                     key={desc.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.1 }}
                   >
                     <Card className="hover:shadow-md transition-shadow">
                       <CardHeader className="pb-2">
                         <div className="flex items-center justify-between">
                           <Badge variant="secondary" className="capitalize">
                             {desc.variant}
                           </Badge>
                           <div className="flex gap-2">
                             {desc.features?.map((f) => (
                               <Badge key={f} variant="outline" className="text-xs">
                                 {f}
                               </Badge>
                             ))}
                           </div>
                         </div>
                       </CardHeader>
                       <CardContent className="space-y-4">
                         {editingStates.has(desc.id) ? (
                           <Textarea
                             value={editedTexts[desc.id] || desc.text}
                             onChange={(e) =>
                               setEditedTexts((prev) => ({ ...prev, [desc.id]: e.target.value }))
                             }
                             className="min-h-[150px]"
                           />
                         ) : (
                           <p className="text-sm leading-relaxed whitespace-pre-line">{desc.text}</p>
                         )}
                         <div className="flex items-center gap-2 flex-wrap">
                           {editingStates.has(desc.id) ? (
                             <Button
                               variant="default"
                               size="sm"
                               onClick={() => handleSaveEdit(desc.id, "description")}
                             >
                               <Save className="h-4 w-4 mr-1" />
                               Save
                             </Button>
                           ) : (
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => toggleEdit(desc.id, desc.text)}
                             >
                               <Edit className="h-4 w-4 mr-1" />
                               Edit
                             </Button>
                           )}
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleCopy(desc.text, desc.id)}
                           >
                             {copiedIds.has(desc.id) ? (
                               <Check className="h-4 w-4 mr-1 text-primary" />
                             ) : (
                               <Copy className="h-4 w-4 mr-1" />
                             )}
                             Copy
                           </Button>
                           <Button variant="outline" size="sm">
                             <Globe className="h-4 w-4 mr-1" />
                             Use on Website
                           </Button>
                           <Button variant="outline" size="sm">
                             Use on Amazon/OLX
                           </Button>
                         </div>
                       </CardContent>
                     </Card>
                   </motion.div>
                 ))}
               </TabsContent>
 
               {/* Email Tab */}
               <TabsContent value="email" className="space-y-6">
                 {generatedContent.email && (
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                   >
                     {/* Subject Lines */}
                     <Card className="mb-4">
                       <CardHeader>
                         <CardTitle className="text-base">Subject Lines</CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-3">
                         {generatedContent.email.subjectLines.map((subject, idx) => (
                           <div
                             key={idx}
                             className="flex items-center justify-between p-3 bg-muted rounded-lg"
                           >
                             <p className="text-sm font-medium">{subject}</p>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleCopy(subject, `subject-${idx}`)}
                             >
                               {copiedIds.has(`subject-${idx}`) ? (
                                 <Check className="h-4 w-4 text-primary" />
                               ) : (
                                 <Copy className="h-4 w-4" />
                               )}
                             </Button>
                           </div>
                         ))}
                       </CardContent>
                     </Card>
 
                     {/* Email Body */}
                     <Card>
                       <CardHeader>
                         <div className="flex items-center justify-between">
                           <CardTitle className="text-base">Email Body</CardTitle>
                           <div className="flex gap-2">
                             <Dialog>
                               <DialogTrigger asChild>
                                 <Button variant="outline" size="sm">
                                   <Eye className="h-4 w-4 mr-1" />
                                   Preview
                                 </Button>
                               </DialogTrigger>
                               <DialogContent className="max-w-2xl">
                                 <DialogHeader>
                                   <DialogTitle>Email Preview</DialogTitle>
                                 </DialogHeader>
                                 <div className="border rounded-lg p-6 bg-background">
                                   <div className="border-b pb-4 mb-4">
                                     <p className="text-sm text-muted-foreground">Subject:</p>
                                     <p className="font-medium">
                                       {generatedContent.email?.subjectLines[0]}
                                     </p>
                                   </div>
                                   <div className="whitespace-pre-line text-sm">
                                     {generatedContent.email?.body}
                                   </div>
                                 </div>
                               </DialogContent>
                             </Dialog>
                             <Button variant="outline" size="sm">
                               <Send className="h-4 w-4 mr-1" />
                               Send Test
                             </Button>
                           </div>
                         </div>
                       </CardHeader>
                       <CardContent>
                         <div className="bg-muted rounded-lg p-4">
                           <p className="text-sm whitespace-pre-line">{generatedContent.email.body}</p>
                         </div>
                         <div className="flex gap-2 mt-4">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() =>
                               handleCopy(generatedContent.email?.body || "", "email-body")
                             }
                           >
                             {copiedIds.has("email-body") ? (
                               <Check className="h-4 w-4 mr-1 text-primary" />
                             ) : (
                               <Copy className="h-4 w-4 mr-1" />
                             )}
                             Copy
                           </Button>
                         </div>
                       </CardContent>
                     </Card>
                   </motion.div>
                 )}
               </TabsContent>
 
               {/* Social Tab */}
               <TabsContent value="social" className="space-y-4">
                 {generatedContent.social.map((social, index) => (
                   <motion.div
                     key={social.platform}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.1 }}
                   >
                     <Card className="hover:shadow-md transition-shadow overflow-hidden">
                       <div className={cn("p-4", getPlatformStyles(social.platform))}>
                         <div className="flex items-center gap-2">
                           <PlatformIcon platform={social.platform} className="h-5 w-5" />
                           <span className="font-semibold capitalize">{social.platform}</span>
                         </div>
                       </div>
                       <CardContent className="p-4 space-y-4">
                         <p className="text-sm leading-relaxed whitespace-pre-line">{social.caption}</p>
                         <div className="flex items-center justify-between">
                           <span
                             className={cn(
                               "text-xs",
                               social.characterCount > social.characterLimit
                                 ? "text-destructive"
                                 : "text-muted-foreground"
                             )}
                           >
                             {social.characterCount} / {social.characterLimit} characters
                           </span>
                           <div className="flex gap-2">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleCopy(social.caption, social.platform)}
                             >
                               {copiedIds.has(social.platform) ? (
                                 <Check className="h-4 w-4 mr-1 text-primary" />
                               ) : (
                                 <Copy className="h-4 w-4 mr-1" />
                               )}
                               Copy
                             </Button>
                             <Button variant="outline" size="sm">
                               <Send className="h-4 w-4 mr-1" />
                               Post Directly
                             </Button>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   </motion.div>
                 ))}
               </TabsContent>
             </Tabs>
 
             {/* History Section */}
             <div className="mt-8">
               <Collapsible open={showHistory} onOpenChange={setShowHistory}>
                 <CollapsibleTrigger asChild>
                   <Button variant="ghost" className="w-full justify-between">
                     <div className="flex items-center gap-2">
                       <History className="h-4 w-4" />
                       <span>Recently Generated ({historyItems.length})</span>
                     </div>
                     {showHistory ? (
                       <ChevronUp className="h-4 w-4" />
                     ) : (
                       <ChevronDown className="h-4 w-4" />
                     )}
                   </Button>
                 </CollapsibleTrigger>
                 <CollapsibleContent>
                   <ScrollArea className="h-[200px] mt-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {historyItems.map((item) => (
                         <Card key={item.id} className="p-4">
                           <div className="flex items-center gap-3">
                             <img
                               src={item.productThumbnail || "/placeholder.svg"}
                               alt={item.productName}
                               className="w-10 h-10 rounded object-cover"
                             />
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-medium truncate">{item.productName}</p>
                               <p className="text-xs text-muted-foreground">
                                 {item.generatedAt.toLocaleDateString()}
                               </p>
                             </div>
                             <Button
                               variant="ghost"
                               size="icon"
                               onClick={() => handleDeleteHistory(item.id)}
                             >
                               <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                             </Button>
                           </div>
                         </Card>
                       ))}
                     </div>
                   </ScrollArea>
                 </CollapsibleContent>
               </Collapsible>
             </div>
 
             {/* Action Bar */}
             <div className="fixed bottom-6 right-6 flex gap-2">
               <Button variant="outline" onClick={handleSaveTemplate}>
                 <Save className="h-4 w-4 mr-2" />
                 Save as Template
               </Button>
               <Button variant="outline" onClick={handleExportZip}>
                 <FileArchive className="h-4 w-4 mr-2" />
                 Export ZIP
               </Button>
               <Button variant="outline" onClick={handleShare}>
                 <Share2 className="h-4 w-4 mr-2" />
                 Share
               </Button>
             </div>
           </motion.div>
         ) : (
           /* Empty State */
           <Card className="h-full min-h-[500px] flex items-center justify-center border-dashed border-2">
             <div className="text-center p-8">
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                 <Sparkles className="h-8 w-8 text-primary" />
               </div>
               <h3 className="text-xl font-semibold mb-2">Ready to Generate Content</h3>
               <p className="text-muted-foreground max-w-md">
                 Select a product and content types, then click "Generate Content" to create
                 AI-powered marketing materials.
               </p>
             </div>
           </Card>
         )}
       </div>
     </div>
   );
 };
 
 export default ContentStudio;