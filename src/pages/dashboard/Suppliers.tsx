import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Grid3X3, List, ArrowUpDown, Sparkles, ImageIcon, DollarSign, Package, Clock, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/features/dashboard";
import { SupplierCard } from "@/components/suppliers/SupplierCard";
import { SupplierDetailModal } from "@/components/suppliers/SupplierDetailModal";
import { ContactSupplierModal } from "@/components/suppliers/ContactSupplierModal";
import { 
  SupplierFiltersPanel, 
  SupplierFilters, 
  defaultFilters 
} from "@/components/suppliers/SupplierFilters";
import { ImageSupplierDiscovery } from "@/components/buyer/ImageSupplierDiscovery";
import { UniversalImageUpload } from "@/components/shared/UniversalImageUpload";
import { mockSuppliers, Supplier } from "@/data/suppliers";
import { useSavedSuppliers } from "@/contexts/SavedSuppliersContext";
import { useAnalysisStore, type SupplierMatch } from "@/stores/analysisStore";
import { useDiscoveredSuppliersStore } from "@/stores/discoveredSuppliersStore";
import { useToast } from "@/hooks/use-toast";
import { analyzeForSourcing } from "@/features/agents/miromind/api";

type SortOption = "rating" | "reviews" | "response" | "minOrder";

export default function SuppliersPage() {
  const { toast } = useToast();
  const { saveSupplier, removeSupplier, isSupplierSaved } = useSavedSuppliers();
  const { 
    buyerResults, 
    currentImage, 
    setBuyerResults, 
    setAnalyzing, 
    setAnalysisProgress,
    clearResults,
  } = useAnalysisStore();
  
  // Discovered suppliers store for AI results persistence
  const { 
    discoveredSuppliers, 
    addFromAnalysis, 
    clearDiscovered 
  } = useDiscoveredSuppliersStore();
  
  const [activeTab, setActiveTab] = useState<string>(buyerResults ? "ai-results" : "browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SupplierFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactSupplier, setContactSupplier] = useState<Supplier | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  // Auto-save AI results to discovered suppliers store
  useEffect(() => {
    if (buyerResults) {
      addFromAnalysis(
        buyerResults.suggestedSuppliers,
        buyerResults.substituteSuppliers || [],
        crypto.randomUUID()
      );
    }
  }, [buyerResults, addFromAnalysis]);

  // Handle image analysis completion
  const handleAnalysisComplete = async () => {
    if (!currentImage) return;
    
    try {
      setAnalyzing(true);
      
      // Simulate progress
      const steps = [
        "Identifying product...",
        "Analyzing specifications...",
        "Matching suppliers...",
        "Comparing prices...",
        "Finding alternatives...",
      ];
      
      for (let i = 0; i < steps.length; i++) {
        setAnalysisProgress((i / steps.length) * 100, steps[i]);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      
      // Call the API
      const result = await analyzeForSourcing({
        imageBase64: currentImage,
        mimeType: "image/jpeg",
      });
      
      setBuyerResults(result);
      setActiveTab("ai-results");
      setAnalysisProgress(100, "Complete!");
      
      toast({
        title: "Analysis Complete",
        description: `Found ${result.suggestedSuppliers.length} matching suppliers for your product.`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle contacting AI-matched supplier
  const handleContactAISupplier = (supplier: SupplierMatch) => {
    toast({
      title: "Contact Request Sent",
      description: `Your inquiry has been sent to ${supplier.name}.`,
    });
  };

  // Handle new analysis
  const handleNewAnalysis = () => {
    clearResults("buyer");
    setActiveTab("browse");
  };

  // Merge mock suppliers with discovered suppliers
  const allSuppliers = useMemo(() => {
    const combinedMap = new Map<string, Supplier>();
    
    // Add mock suppliers first
    mockSuppliers.forEach((s) => combinedMap.set(s.id, s));
    
    // Add/update with discovered suppliers (AI results take precedence)
    discoveredSuppliers.forEach((s) => combinedMap.set(s.id, s));
    
    return Array.from(combinedMap.values());
  }, [discoveredSuppliers]);

  // Filter and sort suppliers
  const filteredSuppliers = useMemo(() => {
    let result = [...allSuppliers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.industry.toLowerCase().includes(query) ||
          s.specializations.some((spec) => spec.toLowerCase().includes(query)) ||
          s.location.city.toLowerCase().includes(query) ||
          s.location.country.toLowerCase().includes(query)
      );
    }

    // Industry filter
    if (filters.industries.length > 0) {
      result = result.filter((s) => filters.industries.includes(s.industry));
    }

    // Country filter
    if (filters.countries.length > 0) {
      result = result.filter((s) =>
        filters.countries.includes(s.location.countryCode)
      );
    }

    // Certification filter
    if (filters.certifications.length > 0) {
      result = result.filter((s) =>
        filters.certifications.some((cert) => s.certifications.includes(cert))
      );
    }

    // Verified filter
    if (filters.verifiedOnly) {
      result = result.filter((s) => s.verified);
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter((s) => s.rating >= filters.minRating);
    }

    // Min order filter
    if (filters.maxMinOrder < 50000) {
      result = result.filter((s) => s.minOrderValue <= filters.maxMinOrder);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "reviews":
          return b.reviewCount - a.reviewCount;
        case "response":
          return a.responseTime.localeCompare(b.responseTime);
        case "minOrder":
          return a.minOrderValue - b.minOrderValue;
      default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, filters, sortBy, allSuppliers]);

  const handleContact = (supplier: Supplier) => {
    setContactSupplier(supplier);
    setIsContactModalOpen(true);
  };

  const handleSave = (supplier: Supplier) => {
    const isSaved = isSupplierSaved(supplier.id);
    if (isSaved) {
      removeSupplier(supplier.id);
      toast({
        title: "Supplier Removed",
        description: `${supplier.name} has been removed from your saved suppliers.`,
      });
    } else {
      saveSupplier(supplier);
      toast({
        title: "Supplier Saved",
        description: `${supplier.name} has been added to your saved suppliers.`,
      });
    }
  };

  const handleCardClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const activeFilterCount =
    filters.industries.length +
    filters.countries.length +
    filters.certifications.length +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxMinOrder < 50000 ? 1 : 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Supplier Discovery</h1>
            <p className="text-muted-foreground mt-1">
              Find suppliers by uploading a product image or browse our network
            </p>
          </div>
        </div>

        {/* Tabs for AI Results vs Browse */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ai-results" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Results
              {buyerResults && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {buyerResults.suggestedSuppliers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-2">
              <Search className="h-4 w-4" />
              Browse All
            </TabsTrigger>
          </TabsList>

          {/* AI Results Tab */}
          <TabsContent value="ai-results" className="mt-6">
            <AnimatePresence mode="wait">
              {buyerResults ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ImageSupplierDiscovery
                    result={buyerResults}
                    imagePreview={currentImage ? `data:image/jpeg;base64,${currentImage}` : undefined}
                    onContactSupplier={handleContactAISupplier}
                    onNewAnalysis={handleNewAnalysis}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* AI Team Feature Section */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left: Upload Zone */}
                    <div className="space-y-4">
                      <div className="text-center lg:text-left">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto lg:mx-0 mb-4 shadow-lg shadow-primary/20">
                          <ImageIcon className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          Drop Your Product Image
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Our AI instantly identifies your product and activates a dedicated agent team.
                        </p>
                      </div>
                      <UniversalImageUpload 
                        onAnalysisComplete={handleAnalysisComplete}
                      />
                    </div>

                    {/* Right: AI Agent Team Benefits */}
                    <div className="bg-gradient-to-br from-muted/50 to-muted rounded-2xl p-6 border border-border/50">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">AI Agent Team</h4>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Working 24/7 for you</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Feature 1: Supplier Matching */}
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <Search className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground text-sm">Best Supplier Deals</h5>
                            <p className="text-xs text-muted-foreground">
                              Agents scan thousands of suppliers to find the best prices, MOQs, and terms for your exact product.
                            </p>
                          </div>
                        </div>

                        {/* Feature 2: Price Negotiation */}
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground text-sm">Price Intelligence</h5>
                            <p className="text-xs text-muted-foreground">
                              Get real-time market pricing data and leverage insights to negotiate better deals.
                            </p>
                          </div>
                        </div>

                        {/* Feature 3: Substitutes */}
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground text-sm">Smart Substitutes</h5>
                            <p className="text-xs text-muted-foreground">
                              Discover alternative products that match your specs at better prices or availability.
                            </p>
                          </div>
                        </div>

                        {/* Feature 4: Continuous Monitoring */}
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="h-5 w-5 text-orange-500" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground text-sm">24/7 Monitoring</h5>
                            <p className="text-xs text-muted-foreground">
                              Agents continuously monitor for price drops, new suppliers, and better opportunities.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Powered by MiroMind AI</span>
                          <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Browse Tab */}
          <TabsContent value="browse" className="mt-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, industry, location, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <div className="flex gap-2">
                {/* Mobile Filter Button */}
                <div className="lg:hidden">
                  <SupplierFiltersPanel
                    filters={filters}
                    onFiltersChange={setFilters}
                    resultCount={filteredSuppliers.length}
                  />
                </div>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[160px] h-11">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                    <SelectItem value="response">Fastest Response</SelectItem>
                    <SelectItem value="minOrder">Lowest Min. Order</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden sm:flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-none h-11 w-11"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-none h-11 w-11"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 items-center mb-4">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.verifiedOnly && (
                  <Badge variant="secondary" className="gap-1">
                    Verified only
                    <button
                      onClick={() => setFilters({ ...filters, verifiedOnly: false })}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.industries.map((industry) => (
                  <Badge key={industry} variant="secondary" className="gap-1">
                    {industry}
                    <button
                      onClick={() =>
                        setFilters({
                          ...filters,
                          industries: filters.industries.filter((i) => i !== industry),
                        })
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {filters.countries.map((code) => (
                  <Badge key={code} variant="secondary" className="gap-1">
                    {code}
                    <button
                      onClick={() =>
                        setFilters({
                          ...filters,
                          countries: filters.countries.filter((c) => c !== code),
                        })
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {filters.minRating > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.minRating}+ stars
                    <button
                      onClick={() => setFilters({ ...filters, minRating: 0 })}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setFilters(defaultFilters)}
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Main Content */}
            <div className="flex gap-6">
              {/* Desktop Filters Sidebar */}
              <SupplierFiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                resultCount={filteredSuppliers.length}
              />

              {/* Results */}
              <div className="flex-1">
                {/* Results Count & Clear AI Button */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredSuppliers.length} of {allSuppliers.length} suppliers
                    {discoveredSuppliers.length > 0 && (
                      <span className="ml-1">
                        ({discoveredSuppliers.length} AI discovered)
                      </span>
                    )}
                  </span>
                  {discoveredSuppliers.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => clearDiscovered()}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear AI Results
                    </Button>
                  )}
                </div>

                {/* Supplier Grid/List */}
                {filteredSuppliers.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                        : "space-y-4"
                    }
                  >
                    {filteredSuppliers.map((supplier, index) => (
                      <motion.div
                        key={supplier.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <SupplierCard
                          supplier={supplier}
                          onContact={handleContact}
                          onSave={handleSave}
                          onClick={handleCardClick}
                          onNameClick={handleCardClick}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No suppliers found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or filters to find more results.
                    </p>
                    <Button variant="outline" onClick={() => {
                      setSearchQuery("");
                      setFilters(defaultFilters);
                    }}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Supplier Detail Modal */}
        <SupplierDetailModal
          supplier={selectedSupplier}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onContact={handleContact}
          onSave={handleSave}
        />

        {/* Contact Supplier Modal */}
        <ContactSupplierModal
          supplier={contactSupplier}
          open={isContactModalOpen}
          onOpenChange={setIsContactModalOpen}
        />
      </div>
    </DashboardLayout>
  );
}
