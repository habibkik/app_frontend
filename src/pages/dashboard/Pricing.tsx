import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Percent,
  BarChart3,
  Sparkles,
  Calculator,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Info,
  ChevronRight,
} from "lucide-react";
import { DashboardLayout } from "@/features/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

// Mock pricing data
const mockProducts = [
  { id: "1", name: "Industrial Servo Motor", currentPrice: 245, cost: 180, competitorAvg: 260 },
  { id: "2", name: "Hydraulic Pump Assembly", currentPrice: 890, cost: 650, competitorAvg: 920 },
  { id: "3", name: "CNC Controller Board", currentPrice: 1250, cost: 850, competitorAvg: 1180 },
  { id: "4", name: "Precision Ball Bearing", currentPrice: 45, cost: 28, competitorAvg: 48 },
];

const mockCompetitors = [
  { name: "TechSupply Co", priceIndex: 105, marketShare: "23%" },
  { name: "Industrial Direct", priceIndex: 98, marketShare: "18%" },
  { name: "GlobalParts Inc", priceIndex: 112, marketShare: "15%" },
  { name: "MegaTrade", priceIndex: 95, marketShare: "12%" },
];

const pricingStrategies = [
  { 
    id: "competitive", 
    name: "Competitive Pricing", 
    description: "Match or undercut competitor prices",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  { 
    id: "value", 
    name: "Value-Based Pricing", 
    description: "Price based on perceived customer value",
    icon: Target,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  { 
    id: "cost-plus", 
    name: "Cost-Plus Pricing", 
    description: "Add fixed margin to product cost",
    icon: Calculator,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  { 
    id: "dynamic", 
    name: "Dynamic Pricing", 
    description: "AI-adjusted based on demand & competition",
    icon: Sparkles,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export default function PricingPage() {
  const [selectedProduct, setSelectedProduct] = useState(mockProducts[0]);
  const [selectedStrategy, setSelectedStrategy] = useState("competitive");
  const [targetMargin, setTargetMargin] = useState([35]);
  const [priceAdjustment, setPriceAdjustment] = useState(0);

  const calculatedPrice = selectedProduct.cost * (1 + targetMargin[0] / 100);
  const adjustedPrice = calculatedPrice * (1 + priceAdjustment / 100);
  const currentMargin = ((selectedProduct.currentPrice - selectedProduct.cost) / selectedProduct.currentPrice) * 100;
  const projectedMargin = ((adjustedPrice - selectedProduct.cost) / adjustedPrice) * 100;
  const vsCompetitor = ((adjustedPrice - selectedProduct.competitorAvg) / selectedProduct.competitorAvg) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pricing Strategy</h1>
            <p className="text-muted-foreground mt-1">
              Optimize your pricing for maximum profitability with AI-powered insights
            </p>
          </div>
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync Prices
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Margin</p>
                  <p className="text-2xl font-bold text-foreground">32.4%</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+2.1% vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Price Index</p>
                  <p className="text-2xl font-bold text-foreground">98.5</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Minus className="h-3 w-3" />
                <span>1.5% below market avg</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Impact</p>
                  <p className="text-2xl font-bold text-foreground">+$24.5K</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>From optimizations</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Products Tracked</p>
                  <p className="text-2xl font-bold text-foreground">156</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <span>12 need attention</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pricing Calculator */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Price Calculator
                </CardTitle>
                <CardDescription>
                  Calculate optimal pricing based on costs and margins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Selection */}
                <div className="space-y-2">
                  <Label>Select Product</Label>
                  <Select
                    value={selectedProduct.id}
                    onValueChange={(v) => setSelectedProduct(mockProducts.find(p => p.id === v) || mockProducts[0])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${product.currentPrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Current Metrics */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Unit Cost</p>
                    <p className="text-xl font-bold text-foreground">${selectedProduct.cost}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                    <p className="text-xl font-bold text-foreground">${selectedProduct.currentPrice}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Competitor Avg</p>
                    <p className="text-xl font-bold text-foreground">${selectedProduct.competitorAvg}</p>
                  </div>
                </div>

                {/* Target Margin Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Target Margin</Label>
                    <span className="text-sm font-medium text-primary">{targetMargin[0]}%</span>
                  </div>
                  <Slider
                    value={targetMargin}
                    onValueChange={setTargetMargin}
                    max={60}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5%</span>
                    <span>60%</span>
                  </div>
                </div>

                {/* Price Adjustment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Price Adjustment</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fine-tune the calculated price up or down</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex gap-2">
                    {[-10, -5, 0, 5, 10].map((adj) => (
                      <Button
                        key={adj}
                        variant={priceAdjustment === adj ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPriceAdjustment(adj)}
                        className="flex-1"
                      >
                        {adj > 0 ? `+${adj}%` : adj === 0 ? "Base" : `${adj}%`}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Result */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-foreground">Recommended Price</span>
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Optimized
                    </Badge>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-foreground">
                      ${adjustedPrice.toFixed(2)}
                    </span>
                    <div className="flex flex-col mb-1">
                      <span className={`text-sm font-medium ${vsCompetitor < 0 ? "text-emerald-600" : vsCompetitor > 5 ? "text-red-500" : "text-muted-foreground"}`}>
                        {vsCompetitor > 0 ? "+" : ""}{vsCompetitor.toFixed(1)}% vs competitors
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {projectedMargin.toFixed(1)}% margin
                      </span>
                    </div>
                  </div>
                </div>

                <Button className="w-full">Apply Price to Product</Button>
              </CardContent>
            </Card>

            {/* Pricing Strategies */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Strategies</CardTitle>
                <CardDescription>
                  Select a strategy that aligns with your business goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {pricingStrategies.map((strategy) => (
                    <motion.button
                      key={strategy.id}
                      onClick={() => setSelectedStrategy(strategy.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedStrategy === strategy.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-lg ${strategy.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <strategy.icon className={`h-5 w-5 ${strategy.color}`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{strategy.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{strategy.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Competitor Price Index */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Competitor Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockCompetitors.map((competitor, index) => (
                  <div key={competitor.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{competitor.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          competitor.priceIndex < 100 ? "text-emerald-600" : "text-red-500"
                        }`}>
                          {competitor.priceIndex}
                        </span>
                        {competitor.priceIndex < 100 ? (
                          <TrendingDown className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <TrendingUp className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={competitor.priceIndex} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground w-10">{competitor.marketShare}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View All Competitors
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Increase CNC Controller</p>
                      <p className="text-xs text-muted-foreground">
                        Raise by 5% - competitors priced 8% higher
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="h-3 w-3 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Bundle Opportunity</p>
                      <p className="text-xs text-muted-foreground">
                        Motor + Bearing combo could boost margin 12%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Demand Surge Alert</p>
                      <p className="text-xs text-muted-foreground">
                        Hydraulic pumps up 23% - consider dynamic pricing
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Margin Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Margin Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">High Margin (&gt;40%)</span>
                    <span className="font-medium text-emerald-600">24 products</span>
                  </div>
                  <Progress value={24} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Medium (25-40%)</span>
                    <span className="font-medium text-foreground">89 products</span>
                  </div>
                  <Progress value={57} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Low (&lt;25%)</span>
                    <span className="font-medium text-amber-600">43 products</span>
                  </div>
                  <Progress value={28} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
