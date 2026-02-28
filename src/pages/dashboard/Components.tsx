import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Package, Search, Filter, History, Trash2, Loader2, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/features/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ComponentCard } from "@/components/components/ComponentCard";
import { SupplierQuoteList } from "@/components/components/SupplierQuoteList";
import { ComparisonSummary } from "@/components/components/ComparisonSummary";
import { CostComparisonChart } from "@/components/components/CostComparisonChart";
import { SaveComparisonDialog } from "@/components/components/SaveComparisonDialog";
import { LoadComparisonDialog } from "@/components/components/LoadComparisonDialog";
import { SupplyChainFlow } from "@/components/components/SupplyChainFlow";
import { SupplyChainRiskPanel } from "@/components/components/SupplyChainRiskPanel";
import { ComponentSupplierDetailModal } from "@/components/components/ComponentSupplierDetailModal";
import {
  mockComponentParts,
  getQuotesForComponent,
  ComparisonSelection,
  mockSupplierQuotes,
  SupplierQuote,
} from "@/data/components";
import { calculateSupplyChainRisk } from "@/lib/supply-chain-risk";
import { useComponentSupplierStore, type ComponentSupplierMatch } from "@/stores/componentSupplierStore";
import { supabase } from "@/integrations/supabase/client";

export default function ComponentsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [selections, setSelections] = useState<ComparisonSelection[]>(
    mockComponentParts.map((part) => ({
      componentId: part.id,
      selectedQuoteId: null,
    }))
  );
  const [selectedSupplier, setSelectedSupplier] = useState<ComponentSupplierMatch | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState<Set<string>>(new Set());
  const [aiQuotes, setAiQuotes] = useState<Record<string, SupplierQuote[]>>({});

  // Component supplier store
  const { searchHistory, clearHistory, addSearchResult, getSuppliersByComponent } = useComponentSupplierStore();

  // All quotes: AI-generated (if available) or mock fallback
  const getQuotes = useCallback((componentId: string): SupplierQuote[] => {
    return aiQuotes[componentId] || getQuotesForComponent(componentId);
  }, [aiQuotes]);

  // All supplier quotes for risk/flow (merge AI + mock)
  const allQuotes = useMemo(() => {
    const merged = [...mockSupplierQuotes];
    Object.values(aiQuotes).forEach(quotes => {
      quotes.forEach(q => {
        if (!merged.find(m => m.id === q.id)) merged.push(q);
      });
    });
    return merged;
  }, [aiQuotes]);

  // Calculate supply chain risk
  const riskScore = useMemo(() => {
    return calculateSupplyChainRisk(mockComponentParts, allQuotes);
  }, [allQuotes]);

  // Get unique categories
  const categories = Array.from(new Set(mockComponentParts.map((p) => p.category)));

  // Filter components
  const filteredParts = mockComponentParts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || part.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const fetchAISuppliers = useCallback(async (componentId: string) => {
    const part = mockComponentParts.find(p => p.id === componentId);
    if (!part) return;

    // Don't refetch if already loaded
    if (aiQuotes[componentId]) return;

    setLoadingComponents(prev => new Set(prev).add(componentId));

    try {
      const { data, error } = await supabase.functions.invoke("component-sourcing", {
        body: {
          componentName: part.name,
          category: part.category,
          material: part.specifications,
          specifications: part.description,
          quantity: part.requiredQuantity,
        },
      });

      if (error) throw error;
      if (!data?.success || !data?.suppliers) throw new Error("No suppliers returned");

      // Convert AI suppliers to SupplierQuote format
      const quotes: SupplierQuote[] = data.suppliers.map((s: any, i: number) => ({
        id: `ai-${componentId}-${i}`,
        supplierId: s.supplierId || `ai-sup-${i}`,
        supplierName: s.name,
        supplierLogo: s.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
        supplierLocation: s.location,
        componentId,
        unitPrice: s.unitPrice,
        moq: s.moq,
        leadTime: s.leadTime,
        leadTimeDays: s.leadTimeDays,
        rating: s.rating,
        certifications: s.certifications || [],
        inStock: s.inStock,
        stockQuantity: s.stockQuantity || 0,
        industry: s.industry,
        specializations: s.specializations || [],
        description: s.description,
        yearEstablished: s.yearEstablished,
        verified: s.verified ?? true,
      }));

      setAiQuotes(prev => ({ ...prev, [componentId]: quotes }));

      // Save to search history store
      addSearchResult({
        componentId,
        componentName: part.name,
        category: part.category,
        suppliers: quotes.map(q => ({
          id: q.id,
          supplierId: q.supplierId,
          name: q.supplierName,
          logo: q.supplierLogo,
          location: q.supplierLocation,
          unitPrice: q.unitPrice,
          moq: q.moq,
          leadTime: q.leadTime,
          leadTimeDays: q.leadTimeDays,
          rating: q.rating,
          certifications: q.certifications,
          inStock: q.inStock,
          stockQuantity: q.stockQuantity,
          industry: q.industry,
          specializations: q.specializations,
          description: q.description,
          yearEstablished: q.yearEstablished,
          verified: q.verified,
        })),
      });

      if (data.marketInsight) {
        toast({
          title: "AI Sourcing Complete",
          description: data.marketInsight.slice(0, 120) + "...",
        });
      }
    } catch (err: any) {
      console.error("AI sourcing error:", err);
      // Keep mock data as fallback – no toast needed since mock data still shows
    } finally {
      setLoadingComponents(prev => {
        const next = new Set(prev);
        next.delete(componentId);
        return next;
      });
    }
  }, [aiQuotes, addSearchResult, toast]);

  const handleToggleExpand = (componentId: string) => {
    const isExpanding = expandedComponent !== componentId;
    setExpandedComponent((prev) => (prev === componentId ? null : componentId));
    
    // Trigger AI sourcing when expanding
    if (isExpanding) {
      fetchAISuppliers(componentId);
    }
  };

  const handleSelectQuote = (componentId: string, quoteId: string) => {
    setSelections((prev) =>
      prev.map((sel) =>
        sel.componentId === componentId ? { ...sel, selectedQuoteId: quoteId } : sel
      )
    );
  };

  const handleSupplierClick = (quote: SupplierQuote) => {
    const supplierMatch: ComponentSupplierMatch = {
      id: quote.id,
      supplierId: quote.supplierId,
      name: quote.supplierName,
      logo: quote.supplierLogo,
      location: quote.supplierLocation,
      unitPrice: quote.unitPrice,
      moq: quote.moq,
      leadTime: quote.leadTime,
      leadTimeDays: quote.leadTimeDays,
      rating: quote.rating,
      certifications: quote.certifications,
      inStock: quote.inStock,
      stockQuantity: quote.stockQuantity,
      geoLocation: quote.geoLocation,
      contact: quote.contact,
      businessProfile: quote.businessProfile,
      employees: quote.employees,
      industry: quote.industry,
      specializations: quote.specializations,
      description: quote.description,
      yearEstablished: quote.yearEstablished,
      verified: quote.verified,
    };
    setSelectedSupplier(supplierMatch);
    setIsDetailModalOpen(true);
  };

  const handleCreateOrder = () => {
    toast({
      title: t("pages.componentSupply.purchaseOrderCreated"),
      description: t("pages.componentSupply.orderSubmitted"),
    });
  };

  const handleLoadComparison = (loadedSelections: ComparisonSelection[]) => {
    const mergedSelections = mockComponentParts.map((part) => {
      const loaded = loadedSelections.find((s) => s.componentId === part.id);
      return loaded || { componentId: part.id, selectedQuoteId: null };
    });
    setSelections(mergedSelections);
  };

  const getSelectedQuote = (componentId: string) => {
    const selection = selections.find((s) => s.componentId === componentId);
    const quotes = getQuotes(componentId);
    return quotes.find((q) => q.id === selection?.selectedQuoteId) || null;
  };

  // Calculate totals for save dialog
  const selectedQuotes = selections
    .map((s) => {
      const quotes = getQuotes(s.componentId);
      return quotes.find((q) => q.id === s.selectedQuoteId);
    })
    .filter(Boolean);

  const totalCost = selections.reduce((sum, sel) => {
    const part = mockComponentParts.find((p) => p.id === sel.componentId);
    const quotes = getQuotes(sel.componentId);
    const quote = quotes.find((q) => q.id === sel.selectedQuoteId);
    if (!part || !quote) return sum;
    return sum + quote.unitPrice * part.requiredQuantity;
  }, 0);

  const completionPercent = (selectedQuotes.length / mockComponentParts.length) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("pages.componentSupply.title")}</h1>
              <p className="text-muted-foreground">
                {t("pages.componentSupply.subtitle")}
              </p>
            </div>
          </div>

          {/* Save/Load Actions */}
          <div className="flex items-center gap-2">
            <LoadComparisonDialog onLoad={handleLoadComparison} />
            <SaveComparisonDialog
              selections={selections}
              totalCost={totalCost}
              completionPercent={completionPercent}
              onSave={() => {}}
            />
          </div>
        </motion.div>

        {/* Supply Chain Overview */}
        <div className="grid gap-4 lg:grid-cols-2">
          <SupplyChainFlow parts={mockComponentParts} quotes={allQuotes} />
          <SupplyChainRiskPanel riskScore={riskScore} />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Component List - Left Side */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       placeholder={t("pages.componentSupply.searchPlaceholder")}
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="pl-9"
                     />
                   </div>
                   <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                     <SelectTrigger className="w-full sm:w-[180px]">
                       <Filter className="h-4 w-4 mr-2" />
                       <SelectValue placeholder={t("pages.componentSupply.categoryLabel")} />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">{t("pages.componentSupply.allCategories")}</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Component Cards */}
            <div className="space-y-3">
              {filteredParts.map((part, index) => {
                const isExpanded = expandedComponent === part.id;
                const isLoading = loadingComponents.has(part.id);
                const quotes = getQuotes(part.id);
                const hasAiQuotes = !!aiQuotes[part.id];
                const selectedQuote = getSelectedQuote(part.id);

                return (
                  <div key={part.id} className="space-y-2">
                    <ComponentCard
                      component={part}
                      quotes={quotes}
                      selectedQuote={selectedQuote}
                      isExpanded={isExpanded}
                      onToggle={() => handleToggleExpand(part.id)}
                      index={index}
                    />
                    {/* Loading indicator */}
                    {isExpanded && isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20"
                      >
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-primary">Finding AI-powered supplier recommendations...</span>
                      </motion.div>
                    )}
                    {/* AI badge when loaded */}
                    {isExpanded && hasAiQuotes && !isLoading && (
                      <div className="flex items-center gap-1.5 px-4 py-1">
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Sparkles className="h-3 w-3" /> AI-Sourced Suppliers
                        </Badge>
                      </div>
                    )}
                    <SupplierQuoteList
                      component={part}
                      quotes={quotes}
                      selectedQuoteId={
                        selections.find((s) => s.componentId === part.id)?.selectedQuoteId || null
                      }
                      onSelectQuote={(quoteId) => handleSelectQuote(part.id, quoteId)}
                      onSupplierClick={handleSupplierClick}
                      isExpanded={isExpanded}
                    />
                  </div>
                );
              })}
            </div>

            {/* Cost Comparison Chart */}
            <CostComparisonChart parts={mockComponentParts} selections={selections} />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Comparison Summary */}
            <ComparisonSummary
              parts={mockComponentParts}
              selections={selections}
              onCreateOrder={handleCreateOrder}
            />

            {/* Search History */}
            {searchHistory.length > 0 && (
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle className="text-sm flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <History className="h-4 w-4" />
                       {t("pages.componentSupply.searchHistory")}
                     </div>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={clearHistory}
                       className="h-6 px-2 text-xs"
                     >
                       <Trash2 className="h-3 w-3 mr-1" />
                       {t("pages.componentSupply.clear")}
                     </Button>
                   </CardTitle>
                 </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {searchHistory.slice(0, 10).map((result) => (
                        <div
                          key={result.id}
                          className="p-2 rounded-lg bg-muted/50 text-sm"
                        >
                          <div className="font-medium">{result.componentName}</div>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {result.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {result.suppliers.length} suppliers
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Supplier Detail Modal */}
      <ComponentSupplierDetailModal
        supplier={selectedSupplier}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSupplier(null);
        }}
        onContact={(supplier) => {
           toast({
             title: t("pages.componentSupply.quoteRequested"),
             description: `${t("pages.componentSupply.yourRequestHasBeenSent")} ${supplier.name}.`,
           });
           setIsDetailModalOpen(false);
         }}
      />
    </DashboardLayout>
  );
}
