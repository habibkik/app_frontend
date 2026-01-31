import { useState } from "react";
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

// Mock competitor data
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompetitor, setSelectedCompetitor] = useState(mockCompetitors[0]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompetitorUrl, setNewCompetitorUrl] = useState("");

  const filteredCompetitors = mockCompetitors.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.website.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-emerald-500" />;
      case "stable":
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return "text-red-500";
    if (change < 0) return "text-emerald-500";
    return "text-muted-foreground";
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Competitor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Competitor</DialogTitle>
                  <DialogDescription>
                    Enter a competitor's website URL to start tracking their products and pricing.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Website URL</Label>
                    <Input
                      placeholder="https://competitor-website.com"
                      value={newCompetitorUrl}
                      onChange={(e) => setNewCompetitorUrl(e.target.value)}
                    />
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">AI-Powered Analysis</p>
                        <p className="text-xs text-muted-foreground">
                          Our AI will automatically detect products, pricing, and key information from the competitor's website.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>
                    Start Tracking
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

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
                            <DropdownMenuItem>
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
      </div>
    </DashboardLayout>
  );
}
