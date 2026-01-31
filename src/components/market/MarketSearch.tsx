import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketAnalysisRequest } from "@/lib/market-intel-service";

interface MarketSearchProps {
  onAnalyze: (request: MarketAnalysisRequest) => void;
  isAnalyzing: boolean;
}

export function MarketSearch({ onAnalyze, isAnalyzing }: MarketSearchProps) {
  const [query, setQuery] = useState("");
  const [analysisType, setAnalysisType] = useState<MarketAnalysisRequest["type"]>("product");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isAnalyzing) return;

    onAnalyze({
      query: query.trim(),
      type: analysisType,
    });
  };

  const quickSearches = [
    { label: "Wireless Earbuds", query: "wireless earbuds" },
    { label: "Smart Home Devices", query: "smart home devices" },
    { label: "Sustainable Packaging", query: "sustainable packaging" },
    { label: "Electric Vehicles", query: "electric vehicles" },
  ];

  const handleQuickSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onAnalyze({
      query: searchQuery,
      type: analysisType,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Market Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Type Tabs */}
        <Tabs value={analysisType} onValueChange={(v) => setAnalysisType(v as typeof analysisType)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="competitor">Competitors</TabsTrigger>
            <TabsTrigger value="trend">Trends</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                analysisType === "competitor"
                  ? "Enter product or industry to analyze competitors..."
                  : analysisType === "trend"
                  ? "Enter market or category to analyze trends..."
                  : analysisType === "pricing"
                  ? "Enter product category for pricing analysis..."
                  : "Enter product or market to analyze..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              disabled={isAnalyzing}
            />
          </div>
          <Button type="submit" disabled={!query.trim() || isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </Button>
        </form>

        {/* Quick Searches */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground py-1">Quick search:</span>
          {quickSearches.map((item) => (
            <Button
              key={item.query}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => handleQuickSearch(item.query)}
              disabled={isAnalyzing}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
