import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Sparkles, Filter, Search } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BOMUploadZone } from "@/components/bom/BOMUploadZone";
import { BOMComponentsTable } from "@/components/bom/BOMComponentsTable";
import { BOMCostSummary } from "@/components/bom/BOMCostSummary";
import { BOMSupplierMatchModal } from "@/components/bom/BOMSupplierMatchModal";
import { BOMExportActions } from "@/components/bom/BOMExportActions";
import { mockBOMComponents, componentCategories, BOMComponent } from "@/data/bom";

export default function BOMPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [productName, setProductName] = useState("Analyzed Product");
  const [components, setComponents] = useState<BOMComponent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [selectedComponent, setSelectedComponent] = useState<BOMComponent | null>(null);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);

  const handleAnalyze = async (files: File[]) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // Set mock results
    const fileName = files[0]?.name || "Product";
    setProductName(fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    setComponents(mockBOMComponents);
    setHasAnalysis(true);
    setIsAnalyzing(false);
  };

  const handleViewSuppliers = (component: BOMComponent) => {
    setSelectedComponent(component);
    setSupplierModalOpen(true);
  };

  const filteredComponents = components.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All Categories" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const confidence = 87; // Mock confidence score

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
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Reverse Engineering (BOM)
              </h1>
              <p className="text-muted-foreground">
                Analyze products and generate detailed bills of materials
              </p>
            </div>
          </div>

          {hasAnalysis && (
            <BOMExportActions components={components} productName={productName} />
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {!hasAnalysis ? (
            /* Upload Section */
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Powered Product Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BOMUploadZone onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                  
                  {/* Features Preview */}
                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <FeatureCard
                      title="Component Detection"
                      description="AI identifies all components from product images and specs"
                    />
                    <FeatureCard
                      title="Cost Estimation"
                      description="Get accurate cost breakdowns with market pricing data"
                    />
                    <FeatureCard
                      title="Supplier Matching"
                      description="Find verified suppliers for each identified component"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Analysis Results */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Cost Summary */}
              <BOMCostSummary components={components} confidence={confidence} />

              {/* Components Table */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle>
                      {productName} - Components ({filteredComponents.length})
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setHasAnalysis(false);
                        setComponents([]);
                      }}
                    >
                      New Analysis
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="table" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <TabsList>
                        <TabsTrigger value="table">Table View</TabsTrigger>
                        <TabsTrigger value="cards">Card View</TabsTrigger>
                      </TabsList>

                      {/* Filters */}
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search components..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-[200px]"
                          />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="w-[160px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {componentCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <TabsContent value="table">
                      <BOMComponentsTable
                        components={filteredComponents}
                        onViewSuppliers={handleViewSuppliers}
                      />
                    </TabsContent>

                    <TabsContent value="cards">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredComponents.map((component) => (
                          <ComponentCard
                            key={component.id}
                            component={component}
                            onViewSuppliers={() => handleViewSuppliers(component)}
                          />
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Supplier Match Modal */}
        <BOMSupplierMatchModal
          open={supplierModalOpen}
          onOpenChange={setSupplierModalOpen}
          component={selectedComponent}
        />
      </div>
    </DashboardLayout>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg bg-muted/50 border border-border">
      <h4 className="font-medium text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ComponentCard({
  component,
  onViewSuppliers,
}: {
  component: BOMComponent;
  onViewSuppliers: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-foreground">{component.name}</h4>
          <p className="text-xs text-muted-foreground">{component.category}</p>
        </div>
        <span className="text-lg font-bold">${component.totalCost.toFixed(2)}</span>
      </div>

      {component.specifications && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {component.specifications}
        </p>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {component.quantity} {component.unit}
        </span>
        <Button variant="ghost" size="sm" onClick={onViewSuppliers}>
          {component.matchedSuppliers} suppliers
        </Button>
      </div>
    </motion.div>
  );
}
