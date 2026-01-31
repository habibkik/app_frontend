import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Search, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  mockComponentParts,
  getQuotesForComponent,
  ComparisonSelection,
  mockSupplierQuotes,
} from "@/data/components";

export default function ComponentsPage() {
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

  const handleToggleExpand = (componentId: string) => {
    setExpandedComponent((prev) => (prev === componentId ? null : componentId));
  };

  const handleSelectQuote = (componentId: string, quoteId: string) => {
    setSelections((prev) =>
      prev.map((sel) =>
        sel.componentId === componentId ? { ...sel, selectedQuoteId: quoteId } : sel
      )
    );
  };

  const handleCreateOrder = () => {
    toast({
      title: "Purchase Order Created",
      description: "Your order has been submitted to the selected suppliers.",
    });
  };

  const handleLoadComparison = (loadedSelections: ComparisonSelection[]) => {
    // Merge loaded selections with current parts (in case parts changed)
    const mergedSelections = mockComponentParts.map((part) => {
      const loaded = loadedSelections.find((s) => s.componentId === part.id);
      return loaded || { componentId: part.id, selectedQuoteId: null };
    });
    setSelections(mergedSelections);
  };

  const getSelectedQuote = (componentId: string) => {
    const selection = selections.find((s) => s.componentId === componentId);
    return mockSupplierQuotes.find((q) => q.id === selection?.selectedQuoteId) || null;
  };

  // Calculate totals for save dialog
  const selectedQuotes = selections
    .map((s) => mockSupplierQuotes.find((q) => q.id === s.selectedQuoteId))
    .filter(Boolean);
  
  const totalCost = selections.reduce((sum, sel) => {
    const part = mockComponentParts.find((p) => p.id === sel.componentId);
    const quote = mockSupplierQuotes.find((q) => q.id === sel.selectedQuoteId);
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
              <h1 className="text-2xl font-bold text-foreground">Component Supply</h1>
              <p className="text-muted-foreground">
                Compare suppliers and build optimal component packages
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
                      placeholder="Search components..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
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
                const quotes = getQuotesForComponent(part.id);
                const selectedQuote = getSelectedQuote(part.id);
                const isExpanded = expandedComponent === part.id;

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
                    <SupplierQuoteList
                      component={part}
                      quotes={quotes}
                      selectedQuoteId={
                        selections.find((s) => s.componentId === part.id)?.selectedQuoteId || null
                      }
                      onSelectQuote={(quoteId) => handleSelectQuote(part.id, quoteId)}
                      isExpanded={isExpanded}
                    />
                  </div>
                );
              })}
            </div>

            {/* Cost Comparison Chart */}
            <CostComparisonChart parts={mockComponentParts} selections={selections} />
          </div>

          {/* Comparison Summary - Right Side */}
          <div className="space-y-4">
            <ComparisonSummary
              parts={mockComponentParts}
              selections={selections}
              onCreateOrder={handleCreateOrder}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
