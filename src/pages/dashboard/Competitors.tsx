import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  Search,
  Globe,
  DollarSign,
  Package,
  Star,
  ExternalLink,
  BarChart3,
  Bell,
  BellOff,
  MoreVertical,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Target,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  Upload,
  Camera,
  Image as ImageIcon,
  X,
  MapPin,
  Clock,
  ShieldCheck,
  Repeat2,
  ArrowRight,
  Mail,
  FileText,
  Activity,
} from "lucide-react";
import { DashboardLayout } from "@/features/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { analyzeCompetitor, type CompetitorAnalysis } from "@/lib/competitor-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { ProductSupplierContactModal } from "@/components/suppliers/ProductSupplierContactModal";
import { CompetitorDetailModal, type CompetitorData } from "@/components/seller/CompetitorDetailModal";
import { CompetitorMonitor } from "@/features/seller/components/CompetitorMonitor";
import type { CompetitorTableRow } from "@/features/seller/types/competitorMonitor";

// Types for product analysis
interface ProductAnalysisResult {
  product: {
    name: string;
    category: string;
    specifications: Record<string, string>;
  };
  suppliers: Array<{
    id: string;
    name: string;
    matchScore: number;
    priceRange: { min: number; max: number };
    moq: number;
    leadTime: string;
    location: string;
    verified: boolean;
  }>;
  substitutes: Array<{
    name: string;
    similarity: number;
    priceAdvantage: string;
    suppliers: Array<{
      name: string;
      price: number;
      location: string;
    }>;
  }>;
  estimatedPrice: { min: number; max: number };
  confidence: number;
}

// Price history data for each competitor (last 12 months)
const priceHistoryData = [
  { month: "Feb", TechSupply: 102, IndustrialDirect: 100, GlobalParts: 110, MegaTrade: 98, yourPrice: 100 },
  { month: "Mar", TechSupply: 103, IndustrialDirect: 99, GlobalParts: 110, MegaTrade: 97, yourPrice: 99 },
  { month: "Apr", TechSupply: 101, IndustrialDirect: 98, GlobalParts: 111, MegaTrade: 96, yourPrice: 98 },
  { month: "May", TechSupply: 104, IndustrialDirect: 97, GlobalParts: 112, MegaTrade: 95, yourPrice: 97 },
  { month: "Jun", TechSupply: 103, IndustrialDirect: 98, GlobalParts: 111, MegaTrade: 94, yourPrice: 96 },
  { month: "Jul", TechSupply: 105, IndustrialDirect: 97, GlobalParts: 112, MegaTrade: 93, yourPrice: 96 },
  { month: "Aug", TechSupply: 104, IndustrialDirect: 96, GlobalParts: 113, MegaTrade: 94, yourPrice: 95 },
  { month: "Sep", TechSupply: 106, IndustrialDirect: 98, GlobalParts: 112, MegaTrade: 95, yourPrice: 96 },
  { month: "Oct", TechSupply: 105, IndustrialDirect: 97, GlobalParts: 111, MegaTrade: 94, yourPrice: 96 },
  { month: "Nov", TechSupply: 104, IndustrialDirect: 98, GlobalParts: 112, MegaTrade: 95, yourPrice: 97 },
  { month: "Dec", TechSupply: 106, IndustrialDirect: 99, GlobalParts: 113, MegaTrade: 96, yourPrice: 97 },
  { month: "Jan", TechSupply: 105, IndustrialDirect: 98, GlobalParts: 112, MegaTrade: 95, yourPrice: 96 },
];

// Product category pricing trends
const categoryTrends = [
  { category: "Servo Motors", you: 245, avgCompetitor: 268, change: -8.5 },
  { category: "Hydraulic Pumps", you: 189, avgCompetitor: 195, change: -3.1 },
  { category: "CNC Controllers", you: 892, avgCompetitor: 845, change: 5.6 },
  { category: "Bearings", you: 45, avgCompetitor: 48, change: -6.3 },
  { category: "Power Supplies", you: 156, avgCompetitor: 162, change: -3.7 },
];

// Mock competitor data with extended business profiles
const mockCompetitors = [
  {
    id: "1",
    name: "TechSupply Co",
    website: "techsupply.com",
    logo: "TS",
    priceIndex: 105,
    priceChange: 2.3,
    marketShare: 23,
    productCount: 1250,
    avgRating: 4.5,
    strengths: ["Fast shipping", "Wide selection", "24/7 support"],
    weaknesses: ["Higher prices", "Limited bulk discounts"],
    tracking: true,
    lastUpdated: "2 hours ago",
    trend: "up" as const,
    description: "Leading supplier of industrial components with 24/7 support and extensive product catalog. Specializes in servo motors and automation equipment.",
    geoLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      formattedAddress: "550 Market Street, San Francisco, CA 94104, USA",
      city: "San Francisco",
      state: "California",
      country: "USA",
    },
    contact: {
      email: "sales@techsupply.com",
      phone: "+1-888-555-0123",
      website: "https://techsupply.com",
      linkedIn: "https://linkedin.com/company/techsupply",
    },
    businessProfile: {
      companySize: "201-500",
      yearEstablished: 2010,
      annualRevenue: "$25M - $50M",
      certifications: ["ISO 9001", "SOC 2", "CE Certified"],
      specializations: ["Industrial Automation", "Servo Motors", "Fast Shipping"],
    },
  },
  {
    id: "2",
    name: "Industrial Direct",
    website: "industrialdirect.com",
    logo: "ID",
    priceIndex: 98,
    priceChange: -1.5,
    marketShare: 18,
    productCount: 890,
    avgRating: 4.2,
    strengths: ["Competitive pricing", "Bulk discounts", "Quality products"],
    weaknesses: ["Slower shipping", "Limited categories"],
    tracking: true,
    lastUpdated: "1 hour ago",
    trend: "down" as const,
    description: "Industrial equipment supplier focused on competitive pricing and bulk orders. Strong presence in hydraulics and pneumatics sectors.",
    geoLocation: {
      latitude: 41.8781,
      longitude: -87.6298,
      formattedAddress: "233 S Wacker Dr, Chicago, IL 60606, USA",
      city: "Chicago",
      state: "Illinois",
      country: "USA",
    },
    contact: {
      email: "info@industrialdirect.com",
      phone: "+1-800-555-0456",
      website: "https://industrialdirect.com",
      linkedIn: "https://linkedin.com/company/industrial-direct",
    },
    businessProfile: {
      companySize: "101-200",
      yearEstablished: 2005,
      annualRevenue: "$15M - $25M",
      certifications: ["ISO 9001", "UL Listed"],
      specializations: ["Hydraulic Systems", "Bulk Orders", "B2B Solutions"],
    },
  },
  {
    id: "3",
    name: "GlobalParts Inc",
    website: "globalparts.com",
    logo: "GP",
    priceIndex: 112,
    priceChange: 0,
    marketShare: 15,
    productCount: 2100,
    avgRating: 4.7,
    strengths: ["Premium quality", "Global reach", "Expert support"],
    weaknesses: ["Premium pricing", "Minimum orders"],
    tracking: true,
    lastUpdated: "30 min ago",
    trend: "stable" as const,
    description: "Premium industrial parts distributor with global logistics network. Known for high-quality components and exceptional customer service.",
    geoLocation: {
      latitude: 40.7128,
      longitude: -74.0060,
      formattedAddress: "1 World Trade Center, New York, NY 10007, USA",
      city: "New York",
      state: "New York",
      country: "USA",
    },
    contact: {
      email: "global@globalparts.com",
      phone: "+1-877-555-0789",
      website: "https://globalparts.com",
      linkedIn: "https://linkedin.com/company/globalparts-inc",
    },
    businessProfile: {
      companySize: "501-1000",
      yearEstablished: 1998,
      annualRevenue: "$100M - $250M",
      certifications: ["ISO 9001", "ISO 14001", "AS9100", "IATF 16949"],
      specializations: ["Premium Components", "Global Logistics", "Technical Support"],
    },
  },
  {
    id: "4",
    name: "MegaTrade",
    website: "megatrade.com",
    logo: "MT",
    priceIndex: 95,
    priceChange: -3.2,
    marketShare: 12,
    productCount: 650,
    avgRating: 3.9,
    strengths: ["Lowest prices", "Fast checkout"],
    weaknesses: ["Limited support", "Quality concerns"],
    tracking: false,
    lastUpdated: "5 hours ago",
    trend: "down" as const,
    description: "Budget-focused industrial supplier offering competitive prices on common components. Best for cost-conscious buyers with flexible quality requirements.",
    geoLocation: {
      latitude: 33.4484,
      longitude: -112.0740,
      formattedAddress: "2901 N Central Ave, Phoenix, AZ 85012, USA",
      city: "Phoenix",
      state: "Arizona",
      country: "USA",
    },
    contact: {
      email: "orders@megatrade.com",
      phone: "+1-866-555-0321",
      website: "https://megatrade.com",
    },
    businessProfile: {
      companySize: "51-100",
      yearEstablished: 2015,
      annualRevenue: "$5M - $15M",
      certifications: ["ISO 9001"],
      specializations: ["Budget Components", "Quick Delivery", "Online Sales"],
    },
  },
];

const priceAlerts = [
  { competitor: "Industrial Direct", product: "Servo Motor XR-500", change: -8, type: "drop" },
  { competitor: "TechSupply Co", product: "Hydraulic Pump HP-200", change: 5, type: "increase" },
  { competitor: "MegaTrade", product: "CNC Controller Board", change: -12, type: "drop" },
];

const marketInsights = [
  { title: "Price War Alert", description: "3 competitors dropped prices on servo motors this week", severity: "high" },
  { title: "New Competitor", description: "AutoParts Pro entered your market segment", severity: "medium" },
  { title: "Stock Alert", description: "TechSupply Co showing low stock on bearings", severity: "low" },
];

export default function CompetitorsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompetitor, setSelectedCompetitor] = useState(mockCompetitors[0]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompetitorUrl, setNewCompetitorUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CompetitorAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Product analysis state
  const [activeTab, setActiveTab] = useState("competitors");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productFileName, setProductFileName] = useState<string | null>(null);
  const [isProductAnalyzing, setIsProductAnalyzing] = useState(false);
  const [productAnalysisProgress, setProductAnalysisProgress] = useState(0);
  const [productAnalysisStep, setProductAnalysisStep] = useState("");
  const [productAnalysisResult, setProductAnalysisResult] = useState<ProductAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Contact supplier modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<ProductAnalysisResult['suppliers'][0] | null>(null);
  
  // Competitor detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailCompetitor, setDetailCompetitor] = useState<CompetitorData | null>(null);

  const handleContactSupplier = (supplier: ProductAnalysisResult['suppliers'][0]) => {
    setSelectedSupplier(supplier);
    setContactModalOpen(true);
  };

  const handleViewCompetitorDetails = (competitor: typeof mockCompetitors[0]) => {
    setDetailCompetitor(competitor as CompetitorData);
    setDetailModalOpen(true);
  };

  const handleToggleTracking = (competitor: CompetitorData) => {
    toast({
      title: competitor.tracking ? "Tracking Stopped" : "Tracking Started",
      description: competitor.tracking 
        ? `No longer tracking ${competitor.name}` 
        : `Now tracking ${competitor.name}`,
    });
  };

  const filteredCompetitors = mockCompetitors.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.website.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "stable":
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return "text-destructive";
    if (change < 0) return "text-emerald-600 dark:text-emerald-400";
    return "text-muted-foreground";
  };

  const handleAnalyzeCompetitor = async () => {
    if (!newCompetitorUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a competitor website URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeCompetitor(newCompetitorUrl);
      
      if (result.success && result.data) {
        setAnalysisResult(result.data);
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${result.data.name}`,
        });
      } else {
        setAnalysisError(result.error || "Failed to analyze competitor");
        toast({
          title: "Analysis Failed",
          description: result.error || "Failed to analyze competitor",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setAnalysisError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setNewCompetitorUrl("");
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  // Product analysis handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setProductImage(base64);
      setProductFileName(file.name);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const clearProductImage = () => {
    setProductImage(null);
    setProductFileName(null);
    setProductAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProductAnalysis = async () => {
    if (!productImage) return;

    setIsProductAnalyzing(true);
    setProductAnalysisProgress(0);
    setProductAnalysisStep("Uploading image...");

    const steps = [
      "Identifying product...",
      "Analyzing specifications...",
      "Searching suppliers...",
      "Finding substitutes...",
      "Generating results...",
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setProductAnalysisProgress((stepIndex / steps.length) * 80);
        setProductAnalysisStep(steps[stepIndex]);
      }
    }, 800);

    try {
      const base64Data = productImage.split(",")[1];
      
      const { data, error } = await supabase.functions.invoke('product-supplier-analysis', {
        body: { imageBase64: base64Data, mimeType: 'image/jpeg' },
      });

      clearInterval(progressInterval);

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success && data?.data) {
        setProductAnalysisResult(data.data);
        setProductAnalysisProgress(100);
        setProductAnalysisStep("Complete!");
        toast({
          title: "Analysis Complete",
          description: `Found ${data.data.suppliers?.length || 0} suppliers and ${data.data.substitutes?.length || 0} substitutes`,
        });
      } else {
        throw new Error(data?.error || "Analysis failed");
      }
    } catch (error) {
      clearInterval(progressInterval);
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze product";
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProductAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Competitor Tracking</h1>
            <p className="text-muted-foreground mt-1">
              Monitor competitor pricing, products, and market positioning
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync All
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Competitor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Add New Competitor</DialogTitle>
                  <DialogDescription>
                    Enter a competitor's website URL for AI-powered analysis.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-auto">
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Website URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://competitor-website.com"
                          value={newCompetitorUrl}
                          onChange={(e) => setNewCompetitorUrl(e.target.value)}
                          disabled={isAnalyzing}
                        />
                        <Button 
                          onClick={handleAnalyzeCompetitor} 
                          disabled={isAnalyzing || !newCompetitorUrl.trim()}
                          className="shrink-0"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Analyze
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Analysis Status */}
                    {isAnalyzing && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Analyzing Competitor...</p>
                            <p className="text-xs text-muted-foreground">
                              AI is extracting pricing, products, and strategic insights
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Analysis Error */}
                    {analysisError && !isAnalyzing && (
                      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-destructive">Analysis Failed</p>
                            <p className="text-xs text-muted-foreground">{analysisError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Analysis Results */}
                    {analysisResult && !isAnalyzing && (
                      <ScrollArea className="max-h-[400px]">
                        <div className="space-y-4 pr-4">
                          {/* Success Header */}
                          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-foreground">{analysisResult.name}</p>
                                <p className="text-xs text-muted-foreground">{analysisResult.website}</p>
                              </div>
                            </div>
                          </div>

                          {/* Summary */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">Summary</h4>
                            <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                          </div>

                          {/* Market Position */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">Market Position</h4>
                            <Badge variant="secondary" className="capitalize">{analysisResult.marketPosition}</Badge>
                          </div>

                          {/* Pricing */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">Pricing Strategy</h4>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="p-2 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Strategy</p>
                                <p className="font-medium capitalize">{analysisResult.pricing.strategy}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Range</p>
                                <p className="font-medium">{analysisResult.pricing.range}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Competitiveness</p>
                                <p className="font-medium capitalize">{analysisResult.pricing.competitiveness}</p>
                              </div>
                            </div>
                          </div>

                          {/* Products */}
                          {analysisResult.products.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-foreground">Key Products</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {analysisResult.products.map((product, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{product}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Strengths & Weaknesses */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-foreground">Strengths</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {analysisResult.strengths.map((s, i) => (
                                  <Badge key={i} className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-foreground">Weaknesses</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {analysisResult.weaknesses.map((w, i) => (
                                  <Badge key={i} className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                                    {w}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Recommendations */}
                          {analysisResult.recommendations.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                AI Recommendations
                              </h4>
                              <ul className="space-y-1.5">
                                {analysisResult.recommendations.map((rec, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <Target className="h-3 w-3 mt-1.5 text-primary shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    )}

                    {/* Default State */}
                    {!isAnalyzing && !analysisResult && !analysisError && (
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground">AI-Powered Analysis</p>
                            <p className="text-xs text-muted-foreground">
                              Enter a URL and click Analyze to get competitive intelligence including pricing, products, strengths, and strategic recommendations.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="border-t pt-4">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCloseDialog} 
                    disabled={!analysisResult}
                  >
                    {analysisResult ? "Add to Tracking" : "Start Tracking"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="competitors" className="gap-2">
              <Eye className="h-4 w-4" />
              Competitors
            </TabsTrigger>
            <TabsTrigger value="monitor" className="gap-2">
              <Activity className="h-4 w-4" />
              Live Monitor
            </TabsTrigger>
            <TabsTrigger value="product-analysis" className="gap-2">
              <Search className="h-4 w-4" />
              Product Analysis
            </TabsTrigger>
          </TabsList>

          {/* Live Monitor Tab */}
          <TabsContent value="monitor" className="space-y-6">
            <CompetitorMonitor 
              onViewCompetitor={(competitor: CompetitorTableRow) => {
                // Convert CompetitorTableRow to CompetitorData for the modal
                const competitorData: CompetitorData = {
                  id: competitor.id,
                  name: competitor.name,
                  website: competitor.platform.toLowerCase() + ".com",
                  logo: competitor.logo,
                  priceIndex: Math.round(competitor.currentPrice / 0.4299), // Approximate
                  priceChange: competitor.priceChange7d,
                  marketShare: 15,
                  productCount: 500,
                  avgRating: competitor.avgRating,
                  strengths: ["Competitive pricing"],
                  weaknesses: ["Limited stock"],
                  tracking: true,
                  lastUpdated: competitor.lastUpdated.toISOString(),
                  trend: competitor.priceChange7d > 0 ? "up" : competitor.priceChange7d < 0 ? "down" : "stable",
                  description: competitor.description || `${competitor.name} - Competitor on ${competitor.platform}`,
                };
                setDetailCompetitor(competitorData);
                setDetailModalOpen(true);
              }}
            />
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tracked Competitors</p>
                  <p className="text-2xl font-bold text-foreground">{mockCompetitors.filter(c => c.tracking).length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {mockCompetitors.length} total in database
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Price Position</p>
                  <p className="text-2xl font-bold text-foreground">-3.5%</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                <ArrowDownRight className="h-3 w-3" />
                <span>Below market average</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Price Alerts</p>
                  <p className="text-2xl font-bold text-foreground">{priceAlerts.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                In the last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Products Monitored</p>
                  <p className="text-2xl font-bold text-foreground">4,890</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all competitors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Price History Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Price Index Trends */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Price Index Trends</CardTitle>
                  <CardDescription>12-month competitor pricing comparison</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Last 12 months
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistoryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      domain={[90, 115]}
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="yourPrice" 
                      name="Your Price" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="TechSupply" 
                      name="TechSupply Co" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="IndustrialDirect" 
                      name="Industrial Direct" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="GlobalParts" 
                      name="GlobalParts Inc" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="MegaTrade" 
                      name="MegaTrade" 
                      stroke="#ec4899" 
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Price Comparison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Category Price Comparison</CardTitle>
              <CardDescription>Your pricing vs. competitor average by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryTrends.map((cat) => (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{cat.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          ${cat.you} <span className="text-xs">vs</span> ${cat.avgCompetitor}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={cat.change < 0 
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" 
                            : "bg-destructive/10 text-destructive border-destructive/20"
                          }
                        >
                          {cat.change > 0 ? "+" : ""}{cat.change}%
                        </Badge>
                      </div>
                    </div>
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full rounded-full bg-primary"
                        style={{ width: `${(cat.you / cat.avgCompetitor) * 50}%` }}
                      />
                      <div 
                        className="absolute top-0 h-full w-0.5 bg-muted-foreground/50"
                        style={{ left: '50%' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Your Price</span>
                      <span>Avg Competitor</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-xs">
                    <p className="font-medium text-foreground">Price Optimization Tip</p>
                    <p className="text-muted-foreground mt-0.5">
                      CNC Controllers are priced 5.6% above market average. Consider a 3-5% reduction to improve competitiveness.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Competitor List */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Competitors</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search competitors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence>
                  {filteredCompetitors.map((competitor, index) => (
                    <motion.div
                      key={competitor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedCompetitor(competitor)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedCompetitor.id === competitor.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center font-bold text-foreground">
                            {competitor.logo}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-foreground">{competitor.name}</h4>
                              {competitor.tracking && (
                                <Badge variant="secondary" className="text-xs">Tracking</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              {competitor.website}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleViewCompetitorDetails(competitor);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://${competitor.website}`, "_blank");
                            }}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit Website
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              {competitor.tracking ? (
                                <>
                                  <BellOff className="h-4 w-4 mr-2" />
                                  Stop Tracking
                                </>
                              ) : (
                                <>
                                  <Bell className="h-4 w-4 mr-2" />
                                  Start Tracking
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Price Index</p>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-foreground">{competitor.priceIndex}</span>
                            {getTrendIcon(competitor.trend)}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Change</p>
                          <span className={`font-semibold ${getPriceChangeColor(competitor.priceChange)}`}>
                            {competitor.priceChange > 0 ? "+" : ""}{competitor.priceChange}%
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Market Share</p>
                          <span className="font-semibold text-foreground">{competitor.marketShare}%</span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Products</p>
                          <span className="font-semibold text-foreground">{competitor.productCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Price Alerts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-500" />
                  Recent Price Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {priceAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          alert.type === "drop" ? "bg-emerald-500/10" : "bg-red-500/10"
                        }`}>
                          {alert.type === "drop" ? (
                            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{alert.product}</p>
                          <p className="text-xs text-muted-foreground">{alert.competitor}</p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={alert.type === "drop" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}
                      >
                        {alert.change > 0 ? "+" : ""}{alert.change}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Competitor Details */}
          <div className="space-y-6">
            {/* Selected Competitor Details */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center font-bold text-sm text-foreground">
                    {selectedCompetitor.logo}
                  </div>
                  <div>
                    <CardTitle className="text-base">{selectedCompetitor.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">Updated {selectedCompetitor.lastUpdated}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-foreground">{selectedCompetitor.avgRating}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Products</p>
                    <span className="font-semibold text-foreground">{selectedCompetitor.productCount.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Strengths</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCompetitor.strengths.map((strength) => (
                      <Badge key={strength} variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Weaknesses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCompetitor.weaknesses.map((weakness) => (
                      <Badge key={weakness} variant="secondary" className="text-xs bg-red-500/10 text-red-600 border-red-500/20">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Full Analysis
                </Button>
              </CardContent>
            </Card>

            {/* Market Insights */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {marketInsights.map((insight, index) => (
                  <div key={index} className="p-3 rounded-lg bg-background/80 border border-border/50">
                    <div className="flex items-start gap-2">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        insight.severity === "high" ? "bg-red-500/10" :
                        insight.severity === "medium" ? "bg-amber-500/10" : "bg-blue-500/10"
                      }`}>
                        <AlertCircle className={`h-3 w-3 ${
                          insight.severity === "high" ? "text-red-500" :
                          insight.severity === "medium" ? "text-amber-500" : "text-blue-500"
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{insight.title}</p>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Your Competitive Edge */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Your Competitive Edge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price Advantage</span>
                    <span className="font-medium text-emerald-600">Strong</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Product Range</span>
                    <span className="font-medium text-foreground">Good</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Customer Rating</span>
                    <span className="font-medium text-foreground">Average</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          {/* Product Analysis Tab */}
          <TabsContent value="product-analysis" className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Product Image Analysis
                </CardTitle>
                <CardDescription>
                  Upload a product image to find suppliers and substitute products with their suppliers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!productImage ? (
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                      dragActive
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Upload Product Image
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                        Drag and drop an image or click to browse. We'll find suppliers and alternatives.
                      </p>
                      <div className="flex items-center gap-3 pointer-events-auto">
                        <Button onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                        <Button variant="outline" onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.setAttribute("capture", "environment");
                            fileInputRef.current.click();
                          }
                        }}>
                          <Camera className="h-4 w-4 mr-2" />
                          Camera
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-muted/50 border border-border">
                      <img
                        src={productImage}
                        alt="Product preview"
                        className="w-full max-h-72 object-contain"
                      />
                      {isProductAnalyzing && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                          <Loader2 className="h-12 w-12 animate-spin text-primary" />
                          <p className="mt-4 text-sm font-medium text-foreground">{productAnalysisStep}</p>
                          <div className="w-48 mt-3">
                            <Progress value={productAnalysisProgress} className="h-2" />
                          </div>
                        </div>
                      )}
                      {!isProductAnalyzing && (
                        <button
                          onClick={clearProductImage}
                          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background border border-border transition-colors"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground truncate">{productFileName}</p>
                          <p className="text-xs text-muted-foreground">Ready for analysis</p>
                        </div>
                      </div>
                      <Button onClick={handleProductAnalysis} disabled={isProductAnalyzing}>
                        {isProductAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Find Suppliers
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {productAnalysisResult && (
              <div className="space-y-6">
                {/* Product Identified */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        Product Identified
                      </CardTitle>
                      <Badge variant="secondary">{productAnalysisResult.confidence}% confidence</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{productAnalysisResult.product.name}</h3>
                        <p className="text-muted-foreground">{productAnalysisResult.product.category}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(productAnalysisResult.product.specifications || {}).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs capitalize">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Market Price</p>
                          <p className="text-lg font-bold text-foreground">
                            ${productAnalysisResult.estimatedPrice.min} - ${productAnalysisResult.estimatedPrice.max}
                            <span className="text-sm font-normal text-muted-foreground ml-1">per unit</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Matched Suppliers */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        AI-Matched Suppliers
                      </CardTitle>
                      <Badge variant="secondary">{productAnalysisResult.suppliers?.length || 0} matches found</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {productAnalysisResult.suppliers?.map((supplier, index) => (
                      <motion.div
                        key={supplier.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 ${
                          index === 0 ? "ring-2 ring-primary/20 border-primary/30" : ""
                        }`}
                      >
                        {index === 0 && (
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-primary text-primary-foreground text-xs">Best Match</Badge>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-bold text-primary">{supplier.name.charAt(0)}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-foreground truncate">{supplier.name}</h4>
                                  {supplier.verified && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {supplier.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {supplier.leadTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1.5">
                                <span className="text-muted-foreground">Match Score</span>
                                <span className="font-medium text-foreground">{supplier.matchScore}%</span>
                              </div>
                              <Progress value={supplier.matchScore} className="h-2" />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <Badge variant="outline" className="text-xs">MOQ: {supplier.moq} units</Badge>
                              <Badge variant="outline" className="text-xs">
                                ${supplier.priceRange.min} - ${supplier.priceRange.max}/unit
                              </Badge>
                            </div>
                          </div>
                          <div className="flex sm:flex-col gap-2 sm:w-32">
                            <Button 
                              size="sm" 
                              className="flex-1 sm:w-full gap-1"
                              onClick={() => handleContactSupplier(supplier)}
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Contact
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 sm:w-full gap-1"
                              onClick={() => handleContactSupplier(supplier)}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              RFQ
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                {/* Substitute Products */}
                {productAnalysisResult.substitutes && productAnalysisResult.substitutes.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Repeat2 className="h-5 w-5 text-amber-500" />
                        Substitute Products with Suppliers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Similar products that could serve your needs with potential cost savings
                      </p>
                      <div className="space-y-4">
                        {productAnalysisResult.substitutes.map((substitute, index) => (
                          <motion.div
                            key={substitute.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-muted/50 border border-border"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                  <Sparkles className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{substitute.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-muted-foreground">{substitute.similarity}% similar</span>
                                    <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">
                                      <TrendingDown className="h-3 w-3 mr-1" />
                                      {substitute.priceAdvantage}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                Explore
                                <ArrowRight className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            </div>
                            
                            {/* Suppliers for this substitute */}
                            {substitute.suppliers && substitute.suppliers.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Available from:</p>
                                <div className="space-y-2">
                                  {substitute.suppliers.map((sup, supIndex) => (
                                    <div key={supIndex} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                                      <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                          <span className="text-xs font-semibold text-primary">{sup.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-foreground">{sup.name}</p>
                                          <p className="text-xs text-muted-foreground">${sup.price}/unit • {sup.location}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 px-2 gap-1"
                                          onClick={() => {
                                            // Create a supplier object for the substitute supplier
                                            const subSupplier = {
                                              id: `sub_${supIndex}`,
                                              name: sup.name,
                                              matchScore: substitute.similarity,
                                              priceRange: { min: sup.price * 0.9, max: sup.price * 1.1 },
                                              moq: 50,
                                              leadTime: "7-14 days",
                                              location: sup.location,
                                              verified: false,
                                            };
                                            setSelectedSupplier(subSupplier);
                                            setContactModalOpen(true);
                                          }}
                                        >
                                          <Mail className="h-3 w-3" />
                                          <span className="hidden sm:inline">Contact</span>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 px-2 gap-1"
                                          onClick={() => {
                                            const subSupplier = {
                                              id: `sub_${supIndex}`,
                                              name: sup.name,
                                              matchScore: substitute.similarity,
                                              priceRange: { min: sup.price * 0.9, max: sup.price * 1.1 },
                                              moq: 50,
                                              leadTime: "7-14 days",
                                              location: sup.location,
                                              verified: false,
                                            };
                                            setSelectedSupplier(subSupplier);
                                            setContactModalOpen(true);
                                          }}
                                        >
                                          <FileText className="h-3 w-3" />
                                          <span className="hidden sm:inline">RFQ</span>
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Contact Supplier Modal */}
        <ProductSupplierContactModal
          supplier={selectedSupplier}
          product={productAnalysisResult?.product || null}
          open={contactModalOpen}
          onOpenChange={setContactModalOpen}
        />

        {/* Competitor Detail Modal */}
        <CompetitorDetailModal
          competitor={detailCompetitor}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          onToggleTracking={handleToggleTracking}
        />
      </div>
    </DashboardLayout>
  );
}
