import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Grid3X3, List, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SupplierCard } from "@/components/suppliers/SupplierCard";
import { SupplierDetailModal } from "@/components/suppliers/SupplierDetailModal";
import { 
  SupplierFiltersPanel, 
  SupplierFilters, 
  defaultFilters 
} from "@/components/suppliers/SupplierFilters";
import { mockSuppliers, Supplier } from "@/data/suppliers";
import { useToast } from "@/hooks/use-toast";

type SortOption = "rating" | "reviews" | "response" | "minOrder";

export default function SuppliersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SupplierFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and sort suppliers
  const filteredSuppliers = useMemo(() => {
    let result = [...mockSuppliers];

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
  }, [searchQuery, filters, sortBy]);

  const handleContact = (supplier: Supplier) => {
    toast({
      title: "Contact Request Sent",
      description: `Your inquiry has been sent to ${supplier.name}. They typically respond within ${supplier.responseTime}.`,
    });
  };

  const handleSave = (supplier: Supplier) => {
    toast({
      title: "Supplier Saved",
      description: `${supplier.name} has been added to your saved suppliers.`,
    });
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supplier Search</h1>
          <p className="text-muted-foreground mt-1">
            Find and connect with verified suppliers worldwide
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
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
          <div className="flex flex-wrap gap-2 items-center">
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
            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredSuppliers.length} of {mockSuppliers.length} suppliers
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

        {/* Supplier Detail Modal */}
        <SupplierDetailModal
          supplier={selectedSupplier}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onContact={handleContact}
          onSave={handleSave}
        />
      </div>
    </DashboardLayout>
  );
}
