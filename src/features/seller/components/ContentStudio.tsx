import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
    sounds?: string[];
    question?: string;
    cta?: string;
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
    content: GeneratedContent;
  }
 
interface LandingPageContent {
  heroHeadline: string;
  heroSubheadline: string;
  valueProposition: string;
  featureHighlights: string[];
  ctaText: string;
}

interface GeneratedContent {
  headlines: GeneratedHeadline[];
  adCopy: GeneratedAdCopy[];
  descriptions: GeneratedDescription[];
  email: GeneratedEmail | null;
  social: SocialCaption[];
  landingPage: LandingPageContent | null;
}
 
  // Fallback mock products (used when no DB products available)
  const fallbackProducts: ContentProduct[] = [
    { id: "1", name: "Servo Motor XR-500", imageUrl: "/placeholder.svg", category: "Motors" },
    { id: "2", name: "Hydraulic Pump HP-200", imageUrl: "/placeholder.svg", category: "Pumps" },
    { id: "3", name: "CNC Controller Board", imageUrl: "/placeholder.svg", category: "Electronics" },
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
  landingPage: {
    heroHeadline: `Transform Your Operations with ${productName}`,
    heroSubheadline: `The industry-leading solution trusted by 10,000+ professionals worldwide`,
    valueProposition: `Our ${productName} combines cutting-edge technology with industrial-grade reliability to deliver unmatched performance. Whether you're scaling operations or upgrading your equipment, experience the difference that precision engineering makes.`,
    featureHighlights: [
      "Industrial-grade components rated for 24/7 operation",
      "Smart diagnostics with real-time monitoring",
      "Energy-efficient design reducing costs by 30%",
      "Modular architecture for easy maintenance",
      "Comprehensive 5-year warranty with 24/7 support",
    ],
    ctaText: "Get Started Today — 30% Off for a Limited Time",
  },
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
    const navigate = useNavigate();
    const { t } = useTranslation();
    const addStudioItem = useContentStudioStore((s) => s.addItem);

   // Dynamic translated arrays
   const audiences = [
     { value: "ecommerce", label: t("contentStudio.audiences.ecommerce") },
     { value: "wholesale", label: t("contentStudio.audiences.wholesale") },
     { value: "retailers", label: t("contentStudio.audiences.retailers") },
     { value: "b2b", label: t("contentStudio.audiences.b2b") },
     { value: "other", label: t("contentStudio.audiences.other") },
   ];

   const contentTypeOptions = [
     { id: "ad_copy" as ContentType, label: t("contentStudio.contentTypes.adCopy"), icon: Megaphone },
     { id: "description" as ContentType, label: t("contentStudio.contentTypes.description"), icon: FileText },
     { id: "email" as ContentType, label: t("contentStudio.contentTypes.email"), icon: Mail },
     { id: "social" as ContentType, label: t("contentStudio.contentTypes.social"), icon: Share2 },
     { id: "landing" as ContentType, label: t("contentStudio.contentTypes.landing"), icon: Globe },
   ];

   const toneOptions = [
     { value: "professional", label: t("contentStudio.tones.professional") },
     { value: "friendly", label: t("contentStudio.tones.friendly") },
     { value: "humorous", label: t("contentStudio.tones.humorous") },
     { value: "urgent", label: t("contentStudio.tones.urgent") },
   ];

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
    const [templateName, setTemplateName] = useState("");
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);
    const [showLoadTemplate, setShowLoadTemplate] = useState(false);
    const [savedTemplates, setSavedTemplates] = useState<Array<{ id: string; name: string; product_name: string; target_audience: string; tone: string; content_json: any; created_at: string }>>([]);
     const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [products, setProducts] = useState<ContentProduct[]>(fallbackProducts);

    // Load products from DB
    useEffect(() => {
      const loadProducts = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { data, error } = await supabase
            .from("products")
            .select("id, name, image_url, category")
            .eq("user_id", user.id)
            .eq("status", "active");
          if (error) throw error;
          if (data && data.length > 0) {
            setProducts(data.map(p => ({
              id: p.id,
              name: p.name,
              imageUrl: p.image_url || "/placeholder.svg",
              category: p.category || "General",
            })));
          }
        } catch (err) {
          console.error("Failed to load products:", err);
        }
      };
      loadProducts();
    }, []);

    const selectedProductData = products.find((p) => p.id === selectedProduct);
 
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
        toast.error(t("contentStudio.selectProductFirst"));
        return;
      }
      if (contentTypes.size === 0) {
        toast.error(t("contentStudio.selectContentType"));
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
              sounds: aiResult.socialMedia.tiktok.sounds || [],
              characterCount: aiResult.socialMedia.tiktok.caption.length,
              characterLimit: 2200,
            } : null,
            aiResult.socialMedia?.facebook ? {
              platform: "facebook" as const,
              caption: aiResult.socialMedia.facebook.copy,
              hashtags: [],
              question: aiResult.socialMedia.facebook.question || "",
              cta: aiResult.socialMedia.facebook.cta || "",
              characterCount: aiResult.socialMedia.facebook.copy.length,
              characterLimit: 63206,
            } : null,
            aiResult.socialMedia?.linkedin ? {
              platform: "linkedin" as const,
              caption: aiResult.socialMedia.linkedin.copy,
              hashtags: [],
              cta: aiResult.socialMedia.linkedin.cta || "",
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
          landingPage: aiResult.landingPage ? {
            heroHeadline: aiResult.landingPage.heroHeadline,
            heroSubheadline: aiResult.landingPage.heroSubheadline,
            valueProposition: aiResult.landingPage.valueProposition,
            featureHighlights: aiResult.landingPage.featureHighlights,
            ctaText: aiResult.landingPage.ctaText,
          } : {
            heroHeadline: (aiResult.headlines || [])[0] || `Transform Your Business with ${productName}`,
            heroSubheadline: (aiResult.headlines || [])[1] || `The trusted solution for modern professionals`,
            valueProposition: aiResult.descriptions?.medium || aiResult.descriptions?.short || "",
            featureHighlights: aiResult.headlines?.slice(2) || [],
            ctaText: "Get Started Today",
          },
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
          content,
        };
        setHistoryItems((prev) => [historyItem, ...prev].slice(0, 10));

        toast.success(t("contentStudio.contentGenerated"));
      } catch (error) {
        console.error("Content generation error:", error);
        toast.error(error instanceof Error ? error.message : t("contentStudio.failedToGenerate"));
      } finally {
        setIsGenerating(false);
      }
    };
 
   const handleCopy = async (text: string, id: string) => {
     await navigator.clipboard.writeText(text);
     setCopiedIds((prev) => new Set(prev).add(id));
     toast.success(t("contentStudio.copiedToClipboard"));
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
     toast.success(t("contentStudio.headlineRegenerated"));
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
 
    const handleSaveEdit = (id: string, type: "adCopy" | "description" | "email") => {
      if (!generatedContent) return;
      const newText = editedTexts[id];
      if (type === "adCopy") {
        setGeneratedContent({
          ...generatedContent,
          adCopy: generatedContent.adCopy.map((ac) =>
            ac.id === id ? { ...ac, text: newText, characterCount: newText.length } : ac
          ),
        });
      } else if (type === "email") {
        if (id === "email-body" && generatedContent.email) {
          setGeneratedContent({
            ...generatedContent,
            email: { ...generatedContent.email, body: newText },
          });
        } else if (id.startsWith("subject-") && generatedContent.email) {
          const idx = parseInt(id.replace("subject-", ""));
          const newSubjects = [...generatedContent.email.subjectLines];
          newSubjects[idx] = newText;
          setGeneratedContent({
            ...generatedContent,
            email: { ...generatedContent.email, subjectLines: newSubjects },
          });
        }
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
      toast.success(t("contentStudio.changesSaved"));
    };

    const handleRestoreHistory = (item: ContentHistoryItem) => {
      setGeneratedContent(item.content);
      toast.success(`Restored content for "${item.productName}"`);
    };
 
   const handleDeleteHistory = (id: string) => {
     setHistoryItems((prev) => prev.filter((item) => item.id !== id));
     toast.success(t("contentStudio.historyItemDeleted"));
   };
 
    const handleExportZip = () => {
      if (!generatedContent) {
        toast.error(t("contentStudio.noContentToExport"));
        return;
      }
      const exportData = {
        exportedAt: new Date().toISOString(),
        product: selectedProductData?.name || "Unknown",
        audience: targetAudience,
        tone,
        headlines: generatedContent.headlines.map((h) => h.text),
        adCopy: {
          short: generatedContent.adCopy.find((a) => a.variant === "short")?.text || "",
          medium: generatedContent.adCopy.find((a) => a.variant === "medium")?.text || "",
          long: generatedContent.adCopy.find((a) => a.variant === "long")?.text || "",
        },
        descriptions: {
          short: generatedContent.descriptions.find((d) => d.variant === "short")?.text || "",
          medium: generatedContent.descriptions.find((d) => d.variant === "medium")?.text || "",
          long: generatedContent.descriptions.find((d) => d.variant === "long")?.text || "",
        },
        email: generatedContent.email ? {
          subjectLines: generatedContent.email.subjectLines,
          body: generatedContent.email.body,
        } : null,
        social: generatedContent.social.map((s) => ({
          platform: s.platform,
          caption: s.caption,
          hashtags: s.hashtags,
        })),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `content-studio-${selectedProductData?.name?.replace(/\s+/g, "-") || "export"}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("contentStudio.contentExported"));
    };
 
    const handleSaveTemplate = async () => {
      if (!generatedContent || !templateName.trim()) {
        toast.error(t("contentStudio.enterTemplateName"));
        return;
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error(t("contentStudio.signInToSave"));
          return;
        }
        const { error } = await supabase.from("content_templates" as any).insert({
          user_id: user.id,
          name: templateName.trim(),
          product_name: selectedProductData?.name || "Unknown",
          target_audience: targetAudience,
          tone,
          content_json: generatedContent,
        });
        if (error) throw error;
        setTemplateName("");
        setShowSaveTemplate(false);
        toast.success(t("contentStudio.templateSaved"));
      } catch (err) {
        console.error("Save template error:", err);
        toast.error(t("contentStudio.failedToSave"));
      }
    };

    const handleLoadTemplates = async () => {
      setShowLoadTemplate(true);
      setLoadingTemplates(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error(t("contentStudio.signInToLoad"));
          setLoadingTemplates(false);
          return;
        }
        const { data, error } = await supabase
          .from("content_templates" as any)
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setSavedTemplates((data as any) || []);
      } catch (err) {
        console.error("Load templates error:", err);
        toast.error(t("contentStudio.failedToLoad"));
      } finally {
        setLoadingTemplates(false);
      }
    };

    const handleApplyTemplate = (template: typeof savedTemplates[0]) => {
      const content = template.content_json as GeneratedContent;
      setGeneratedContent(content);
      setTargetAudience(template.target_audience as TargetAudience);
      setTone(template.tone as ContentTone);
      setShowLoadTemplate(false);
      toast.success(`Template "${template.name}" loaded`);
    };

    const handleDeleteTemplate = async (templateId: string) => {
      try {
        const { error } = await supabase
          .from("content_templates" as any)
          .delete()
          .eq("id", templateId);
        if (error) throw error;
        setSavedTemplates(prev => prev.filter(t => t.id !== templateId));
        toast.success(t("contentStudio.templateDeleted"));
      } catch (err) {
        toast.error(t("contentStudio.failedToDelete"));
      }
    };
 
   const handleShare = () => {
     toast.success(t("contentStudio.shareLinkCopied"));
   };
 
   return (
     <div className="flex flex-col lg:flex-row gap-6 min-h-screen p-4 lg:p-6">
       {/* Left Panel - Settings */}
       <div className="w-full lg:w-80 lg:sticky lg:top-6 lg:self-start">
         <Card className="border-2">
           <CardHeader className="pb-4">
             <CardTitle className="flex items-center gap-2 text-lg">
               <Sparkles className="h-5 w-5 text-primary" />
               {t("contentStudio.title")}
             </CardTitle>
             <CardDescription>{t("contentStudio.subtitle")}</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
             {/* Product Selector */}
             <div className="space-y-2">
               <Label className="text-sm font-medium">{t("contentStudio.product")}</Label>
               <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                 <SelectTrigger>
                   <SelectValue placeholder={t("contentStudio.selectProduct")} />
                 </SelectTrigger>
                 <SelectContent>
                   {products.map((product) => (
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
               <Label className="text-sm font-medium">{t("contentStudio.targetAudience")}</Label>
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
               <Label className="text-sm font-medium">{t("contentStudio.contentTypes.label")}</Label>
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
               <Label className="text-sm font-medium">{t("contentStudio.tone")}</Label>
               <Select value={tone} onValueChange={(v) => setTone(v as ContentTone)}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {toneOptions.map((tOpt) => (
                     <SelectItem key={tOpt.value} value={tOpt.value}>
                       {tOpt.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             {/* Generate Button */}
             <Button
               onClick={handleGenerate}
               disabled={isGenerating || !selectedProduct}
               className="w-full"
               size="lg"
             >
               {isGenerating ? (
                 <>
                   <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                   {t("contentStudio.generating")}
                 </>
               ) : (
                 <>
                   <Wand2 className="h-5 w-5 mr-2" />
                   {t("contentStudio.generate")}
                 </>
               )}
             </Button>
           </CardContent>
         </Card>
       </div>
 
       {/* Right Panel - Generated Content */}
       <div className="flex-1 min-w-0">
         {generatedContent ? (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-6"
           >
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
               <TabsList className="flex flex-wrap h-auto gap-1">
                 <TabsTrigger value="headlines">{t("contentStudio.tabs.headlines")}</TabsTrigger>
                 <TabsTrigger value="copy">{t("contentStudio.tabs.copy")}</TabsTrigger>
                 <TabsTrigger value="description">{t("contentStudio.tabs.description")}</TabsTrigger>
                 <TabsTrigger value="email">{t("contentStudio.tabs.email")}</TabsTrigger>
                <TabsTrigger value="social">{t("contentStudio.tabs.social")}</TabsTrigger>
                <TabsTrigger value="landing">{t("contentStudio.tabs.landing")}</TabsTrigger>
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
                            <Button variant="outline" size="sm" onClick={() => { handleCopy(headline.text, `ad-${headline.id}`); toast.success(t("contentStudio.headlineCopiedForAd")); }}>
                              {t("contentStudio.useInAd")}
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
                             {copy.characterCount} {t("common.characters")}
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
                               {t("common.save")}
                             </Button>
                           ) : (
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => toggleEdit(copy.id, copy.text)}
                             >
                               <Edit className="h-4 w-4 mr-1" />
                               {t("common.edit")}
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
                             {t("common.copy")}
                           </Button>
                          <Button variant="outline" size="sm" onClick={() => { handleCopy(copy.text, `fb-${copy.id}`); toast.success(t("contentStudio.adCopyCopiedForFb")); }}>
                            <Facebook className="h-4 w-4 mr-1" />
                            {t("contentStudio.useInFacebookAd")}
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
                          <div className="flex gap-2 flex-wrap">
                            {desc.features?.map((f) => (
                              <Badge key={f} variant="outline" className="text-xs">
                                {f}
                              </Badge>
                            ))}
                            {desc.benefits?.map((b) => (
                              <Badge key={b} variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                ✓ {b}
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
                               {t("common.save")}
                             </Button>
                           ) : (
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => toggleEdit(desc.id, desc.text)}
                             >
                               <Edit className="h-4 w-4 mr-1" />
                               {t("common.edit")}
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
                             {t("common.copy")}
                           </Button>
                           <Button variant="outline" size="sm">
                             <Globe className="h-4 w-4 mr-1" />
                             {t("contentStudio.useOnWebsite")}
                           </Button>
                           <Button variant="outline" size="sm">
                             {t("contentStudio.useOnMarketplace")}
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
                         <CardTitle className="text-base">{t("contentStudio.subjectLines")}</CardTitle>
                       </CardHeader>
                        <CardContent className="space-y-3">
                          {generatedContent.email.subjectLines.map((subject, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 p-3 bg-muted rounded-lg"
                            >
                              {editingStates.has(`subject-${idx}`) ? (
                                <input
                                  className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-sm"
                                  value={editedTexts[`subject-${idx}`] ?? subject}
                                  onChange={(e) =>
                                    setEditedTexts((prev) => ({ ...prev, [`subject-${idx}`]: e.target.value }))
                                  }
                                />
                              ) : (
                                <p className="text-sm font-medium flex-1">{subject}</p>
                              )}
                              <div className="flex gap-1">
                                {editingStates.has(`subject-${idx}`) ? (
                                  <Button variant="default" size="sm" onClick={() => handleSaveEdit(`subject-${idx}`, "email")}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="sm" onClick={() => toggleEdit(`subject-${idx}`, subject)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
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
                            </div>
                          ))}
                        </CardContent>
                     </Card>
 
                     {/* Email Body */}
                     <Card>
                       <CardHeader>
                         <div className="flex items-center justify-between">
                           <CardTitle className="text-base">{t("contentStudio.emailBody")}</CardTitle>
                           <div className="flex gap-2">
                             <Dialog>
                               <DialogTrigger asChild>
                                 <Button variant="outline" size="sm">
                                   <Eye className="h-4 w-4 mr-1" />
                                   {t("contentStudio.preview")}
                                 </Button>
                               </DialogTrigger>
                               <DialogContent className="max-w-2xl">
                                 <DialogHeader>
                                   <DialogTitle>{t("contentStudio.emailPreview")}</DialogTitle>
                                 </DialogHeader>
                                 <div className="border rounded-lg p-6 bg-background">
                                   <div className="border-b pb-4 mb-4">
                                     <p className="text-sm text-muted-foreground">{t("contentStudio.subject")}</p>
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
                               {t("contentStudio.sendTest")}
                             </Button>
                           </div>
                         </div>
                       </CardHeader>
                        <CardContent>
                          <div className="bg-muted rounded-lg p-4">
                            {editingStates.has("email-body") ? (
                              <Textarea
                                value={editedTexts["email-body"] ?? generatedContent.email.body}
                                onChange={(e) =>
                                  setEditedTexts((prev) => ({ ...prev, ["email-body"]: e.target.value }))
                                }
                                className="min-h-[200px]"
                              />
                            ) : (
                              <p className="text-sm whitespace-pre-line">{generatedContent.email.body}</p>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4">
                            {editingStates.has("email-body") ? (
                              <Button variant="default" size="sm" onClick={() => handleSaveEdit("email-body", "email")}>
                                <Save className="h-4 w-4 mr-1" />
                                {t("common.save")}
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" onClick={() => toggleEdit("email-body", generatedContent.email?.body || "")}>
                                <Edit className="h-4 w-4 mr-1" />
                                {t("common.edit")}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(generatedContent.email?.body || "", "email-body")}
                            >
                              {copiedIds.has("email-body") ? (
                                <Check className="h-4 w-4 mr-1 text-primary" />
                              ) : (
                                <Copy className="h-4 w-4 mr-1" />
                              )}
                              {t("common.copy")}
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
                       <div className={cn("px-4 py-2 flex items-center gap-2", getPlatformStyles(social.platform))}>
                         <PlatformIcon platform={social.platform} className="h-4 w-4" />
                         <span className="text-sm font-medium capitalize">{social.platform}</span>
                       </div>
                        <CardContent className="p-4 space-y-4">
                          <p className="text-sm whitespace-pre-line">{social.caption}</p>

                          {/* Hashtags */}
                          {social.hashtags && social.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {social.hashtags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* TikTok Sounds */}
                          {social.platform === "tiktok" && social.sounds && social.sounds.length > 0 && (
                            <div className="border-t pt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">🎵 {t("contentStudio.tiktokSounds")}</p>
                              <div className="flex flex-wrap gap-1">
                                {social.sounds.map((sound) => (
                                  <Badge key={sound} variant="secondary" className="text-xs">
                                    {sound}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Facebook Question */}
                          {social.platform === "facebook" && social.question && (
                            <div className="border-t pt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">💬 {t("contentStudio.engagementQuestion")}</p>
                              <p className="text-sm italic">{social.question}</p>
                            </div>
                          )}

                          {/* LinkedIn/Facebook CTA */}
                          {(social.platform === "linkedin" || social.platform === "facebook") && social.cta && (
                            <div className="border-t pt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">🎯 {t("contentStudio.callToAction")}</p>
                              <Badge variant="default" className="text-xs">{social.cta}</Badge>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                "text-xs",
                                social.characterCount > social.characterLimit
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              )}
                            >
                              {social.characterCount} / {social.characterLimit} {t("common.characters")}
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
                                {t("common.copy")}
                              </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/social-publisher")}>
                              <Send className="h-4 w-4 mr-1" />
                              {t("contentStudio.postDirectly")}
                            </Button>
                            </div>
                          </div>
                        </CardContent>
                     </Card>
                   </motion.div>
                 ))}
              </TabsContent>

              {/* Landing Page Tab */}
              <TabsContent value="landing" className="space-y-4">
                {generatedContent.landingPage ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Hero Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          {t("contentStudio.heroSection")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-muted rounded-lg p-6 text-center space-y-3">
                          <h2 className="text-2xl font-bold">{generatedContent.landingPage.heroHeadline}</h2>
                          <p className="text-muted-foreground text-lg">{generatedContent.landingPage.heroSubheadline}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(generatedContent.landingPage!.heroHeadline, "landing-hero")}>
                            {copiedIds.has("landing-hero") ? <Check className="h-4 w-4 mr-1 text-primary" /> : <Copy className="h-4 w-4 mr-1" />}
                            {t("contentStudio.copyHeadline")}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(generatedContent.landingPage!.heroSubheadline, "landing-sub")}>
                            {copiedIds.has("landing-sub") ? <Check className="h-4 w-4 mr-1 text-primary" /> : <Copy className="h-4 w-4 mr-1" />}
                            {t("contentStudio.copySubheadline")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Value Proposition */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{t("contentStudio.valueProposition")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {editingStates.has("landing-vp") ? (
                          <Textarea
                            value={editedTexts["landing-vp"] ?? generatedContent.landingPage.valueProposition}
                            onChange={(e) => setEditedTexts((prev) => ({ ...prev, ["landing-vp"]: e.target.value }))}
                            className="min-h-[100px]"
                          />
                        ) : (
                          <p className="text-sm leading-relaxed">{generatedContent.landingPage.valueProposition}</p>
                        )}
                        <div className="flex gap-2">
                          {editingStates.has("landing-vp") ? (
                            <Button variant="default" size="sm" onClick={() => {
                              if (generatedContent.landingPage) {
                                setGeneratedContent({
                                  ...generatedContent,
                                  landingPage: { ...generatedContent.landingPage, valueProposition: editedTexts["landing-vp"] || generatedContent.landingPage.valueProposition },
                                });
                              }
                              setEditingStates((prev) => { const n = new Set(prev); n.delete("landing-vp"); return n; });
                              toast.success(t("contentStudio.changesSaved"));
                            }}>
                              <Save className="h-4 w-4 mr-1" /> {t("common.save")}
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => toggleEdit("landing-vp", generatedContent.landingPage?.valueProposition || "")}>
                              <Edit className="h-4 w-4 mr-1" /> {t("common.edit")}
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(generatedContent.landingPage!.valueProposition, "landing-vp-copy")}>
                            {copiedIds.has("landing-vp-copy") ? <Check className="h-4 w-4 mr-1 text-primary" /> : <Copy className="h-4 w-4 mr-1" />}
                            {t("common.copy")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Feature Highlights */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{t("contentStudio.featureHighlights")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {generatedContent.landingPage.featureHighlights.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-sm flex-1">{feature}</span>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(feature, `landing-feat-${idx}`)}>
                                {copiedIds.has(`landing-feat-${idx}`) ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* CTA Section */}
                    <Card className="border-primary/30 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="text-base">{t("contentStudio.callToAction")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-background rounded-lg p-6 text-center">
                          <Button size="lg" className="text-base font-semibold px-8">
                            {generatedContent.landingPage.ctaText}
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(generatedContent.landingPage!.ctaText, "landing-cta")}>
                          {copiedIds.has("landing-cta") ? <Check className="h-4 w-4 mr-1 text-primary" /> : <Copy className="h-4 w-4 mr-1" />}
                          {t("contentStudio.copyCta")}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">{t("contentStudio.noLandingContent")}</p>
                  </Card>
                )}
              </TabsContent>
           </Tabs>
 
            {/* History Section */}
             <div className="mt-8">
               <Collapsible open={showHistory} onOpenChange={setShowHistory}>
                 <CollapsibleTrigger asChild>
                   <Button variant="ghost" className="w-full justify-between">
                     <div className="flex items-center gap-2">
                       <History className="h-4 w-4" />
                       <span>{t("contentStudio.recentlyGenerated")} ({historyItems.length})</span>
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
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestoreHistory(item)}
                                >
                                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                  {t("contentStudio.restore")}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteHistory(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </div>
                           </div>
                         </Card>
                       ))}
                     </div>
                   </ScrollArea>
                 </CollapsibleContent>
               </Collapsible>
             </div>
 
              {/* Action Bar */}
              <div className="fixed bottom-6 right-6 flex gap-2 z-50">
                <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Save className="h-4 w-4 mr-2" />
                      {t("contentStudio.saveAsTemplate")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("contentStudio.saveAsTemplate")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>{t("contentStudio.templateName")}</Label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder={t("contentStudio.templatePlaceholder")}
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleSaveTemplate} className="w-full" disabled={!templateName.trim()}>
                        <Save className="h-4 w-4 mr-2" />
                        {t("contentStudio.saveTemplate")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={handleLoadTemplates}>
                  <History className="h-4 w-4 mr-2" />
                  {t("contentStudio.loadTemplate")}
                </Button>
                <Button variant="outline" onClick={handleExportZip}>
                  <FileArchive className="h-4 w-4 mr-2" />
                  {t("contentStudio.exportZip")}
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  {t("contentStudio.share")}
                </Button>
              </div>

              {/* Load Template Dialog */}
              <Dialog open={showLoadTemplate} onOpenChange={setShowLoadTemplate}>
                <DialogContent className="max-w-lg max-h-[70vh]">
                  <DialogHeader>
                    <DialogTitle>{t("contentStudio.loadTemplate")}</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[50vh]">
                    {loadingTemplates ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : savedTemplates.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Save className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>{t("common.noSavedTemplates")}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {savedTemplates.map((tpl) => (
                          <Card key={tpl.id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="p-3 flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{tpl.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {tpl.product_name} · {tpl.tone} · {new Date(tpl.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <Button size="sm" variant="default" onClick={() => handleApplyTemplate(tpl)}>
                                  {t("common.use")}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(tpl.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
           </motion.div>
         ) : (
           /* Empty State */
           <Card className="h-full min-h-[500px] flex items-center justify-center border-dashed border-2">
             <div className="text-center p-8">
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                 <Sparkles className="h-8 w-8 text-primary" />
               </div>
               <h3 className="text-xl font-semibold mb-2">{t("contentStudio.emptyTitle")}</h3>
               <p className="text-muted-foreground max-w-md">
                 {t("contentStudio.emptyDescription")}
               </p>
             </div>
           </Card>
         )}
       </div>
     </div>
   );
 };
 
 export default ContentStudio;