import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Sparkles, Filter, Search, ImageIcon, Factory, Repeat2, Map, GitBranch } from "lucide-react";
import { DashboardLayout } from "@/features/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BOMUploadZone } from "@/components/bom/BOMUploadZone";
import { BOMComponentsTable } from "@/components/bom/BOMComponentsTable";
import { BOMCostSummary } from "@/components/bom/BOMCostSummary";
import { BOMSupplierMatchModal } from "@/components/bom/BOMSupplierMatchModal";
import { BOMExportActions } from "@/components/bom/BOMExportActions";
import { AIAnalysisPanel } from "@/components/bom/AIAnalysisPanel";
import { ContentGenerationPanel } from "@/components/bom/ContentGenerationPanel";
import { UniversalImageUpload } from "@/components/shared/UniversalImageUpload";
import { ProducerCompetition, SubstituteProducers } from "@/components/producer";
import { ProductArchitectureSelector, ArchitectureType } from "@/components/bom/ProductArchitectureSelector";
import { BOMTypeSelector, BOMType, SUPPLEMENTARY_ITEMS } from "@/components/bom/BOMTypeSelector";
import { BOMCompletenessChecklist } from "@/components/bom/BOMCompletenessChecklist";
import { BOMRiskClassification, KraljicBadge, classifyComponent } from "@/components/bom/BOMRiskClassification";
import { SupplierEcosystemMap } from "@/components/bom/SupplierEcosystemMap";
import { DualSourcePanel } from "@/components/bom/DualSourcePanel";
import { mockBOMComponents, componentCategories, BOMComponent } from "@/data/bom";
import { AnalyzedComponent } from "@/lib/ai-analysis-service";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

export default function BOMPage() {
  const fc = useFormatCurrency();
  const { 
    producerResults, 
    currentImage, 
    clearResults 
  } = useAnalysisStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [productName, setProductName] = useState("Analyzed Product");
  const [productCategory, setProductCategory] = useState("Electronics");
  const [components, setComponents] = useState<BOMComponent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [selectedComponent, setSelectedComponent] = useState<BOMComponent | null>(null);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [confidence, setConfidence] = useState(87);
  const [activeTab, setActiveTab] = useState<string>("ai-results");
  const [resultsTab, setResultsTab] = useState<string>("bom");
  const [architecture, setArchitecture] = useState<ArchitectureType | null>(null);
  const [bomType, setBomType] = useState<BOMType>("cbom");

  // Check for pre-populated results from the analysis store
  useEffect(() => {
    if (producerResults && producerResults.success) {
      const bomComponents: BOMComponent[] = producerResults.components.map((comp, index) => ({
        id: `ai-comp-${index + 1}`,
        name: comp.name,
        category: comp.category,
        quantity: comp.quantity,
        unit: comp.unit,
        unitCost: comp.estimatedUnitCost,
        totalCost: comp.estimatedUnitCost * comp.quantity,
        alternatives: Math.floor(Math.random() * 8) + 2,
        matchedSuppliers: Math.floor(Math.random() * 15) + 5,
        specifications: comp.specifications,
        material: comp.material,
      }));

      setProductName(producerResults.productName);
      setProductCategory(producerResults.productCategory);
      setComponents(bomComponents);
      setConfidence(producerResults.overallConfidence);
      setHasAnalysis(true);
      setActiveTab("ai-results");
    }
  }, [producerResults]);

  const handleAnalyze = async (files: File[]) => {
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const fileName = files[0]?.name || "Product";
    setProductName(fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    setComponents(mockBOMComponents);
    setHasAnalysis(true);
    setIsAnalyzing(false);
  };

  const handleAIAnalysisComplete = (analyzedComponents: AnalyzedComponent[], name: string) => {
    const bomComponents: BOMComponent[] = analyzedComponents.map((comp, index) => ({
      id: `ai-comp-${index + 1}`,
      name: comp.name,
      category: comp.category,
      quantity: comp.quantity,
      unit: comp.unit,
      unitCost: comp.estimatedUnitCost,
      totalCost: comp.estimatedUnitCost * comp.quantity,
      alternatives: Math.floor(Math.random() * 8) + 2,
      matchedSuppliers: Math.floor(Math.random() * 15) + 5,
      specifications: comp.specifications,
      material: comp.material,
    }));
    const avgConfidence = Math.round(
      analyzedComponents.reduce((sum, c) => sum + c.confidence, 0) / analyzedComponents.length
    );
    setProductName(name);
    setComponents(bomComponents);
    setConfidence(avgConfidence);
    setHasAnalysis(true);
  };

  const handleViewSuppliers = (component: BOMComponent) => {
    setSelectedComponent(component);
    setSupplierModalOpen(true);
  };

  const handleNewAnalysis = () => {
    setHasAnalysis(false);
    setComponents([]);
    clearResults("producer");
  };

  const totalCost = useMemo(() => components.reduce((s, c) => s + c.totalCost, 0), [components]);

  // Build display components based on BOM type
  const displayComponents = useMemo(() => {
    let base = [...components];
    if (bomType === "mbom") {
      const extras: BOMComponent[] = SUPPLEMENTARY_ITEMS
        .filter((s) => s.bomType === "mbom")
        .map((s) => ({
          id: s.id, name: s.name, category: s.category,
          quantity: s.quantity, unit: s.unit, unitCost: s.unitCost,
          totalCost: s.totalCost, alternatives: 0, matchedSuppliers: 0,
          specifications: s.notes,
        }));
      base = [...base, ...extras];
    } else if (bomType === "service") {
      base = SUPPLEMENTARY_ITEMS
        .filter((s) => s.bomType === "service")
        .map((s) => ({
          id: s.id, name: s.name, category: s.category,
          quantity: s.quantity, unit: s.unit, unitCost: s.unitCost,
          totalCost: s.totalCost, alternatives: 0, matchedSuppliers: 0,
          specifications: s.notes,
        }));
    }
    return base;
  }, [components, bomType]);

  const filteredComponents = displayComponents.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All Categories" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
            {architecture && (
              <Badge variant="outline" className="text-xs capitalize">{architecture}</Badge>
            )}
          </div>

          {hasAnalysis && (
            <BOMExportActions components={components} productName={productName} />
          )}
        </motion.div>

        {/* Product Architecture Selector */}
        {!hasAnalysis && (
          <ProductArchitectureSelector value={architecture} onChange={setArchitecture} />
        )}

        <AnimatePresence mode="wait">
          {!hasAnalysis ? (
            /* Upload Section */
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                  <TabsTrigger value="ai-results" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Image Analysis
                  </TabsTrigger>
                  <TabsTrigger value="file-upload" className="gap-2">
                    <ImageIcon className="h-4 w-4" />
                    File Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai-results">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        AI-Powered BOM Generation
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Upload a product image to automatically identify components,
                        estimate costs, and generate a complete bill of materials.
                      </p>
                    </div>
                    <UniversalImageUpload 
                      onAnalysisComplete={() => {}}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="file-upload">
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Product Analysis from Files
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <BOMUploadZone onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                          <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            <FeatureCard title="Component Detection" description="AI identifies all components from product images and specs" />
                            <FeatureCard title="Cost Estimation" description="Get accurate cost breakdowns with market pricing data" />
                            <FeatureCard title="Supplier Matching" description="Find verified suppliers for each identified component" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="lg:col-span-1">
                      <AIAnalysisPanel onAnalysisComplete={handleAIAnalysisComplete} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
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
              {/* Image Preview */}
              {currentImage && (
                <Card className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 flex-shrink-0 bg-muted/50 p-4">
                      <img src={`data:image/jpeg;base64,${currentImage}`} alt="Analyzed product" className="w-full h-32 object-contain rounded-lg" />
                    </div>
                    <div className="flex-1 p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{productName}</h3>
                        <p className="text-sm text-muted-foreground">{productCategory}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{components.length} components</Badge>
                          <Badge variant="outline">{confidence}% confidence</Badge>
                          {architecture && <Badge variant="outline" className="capitalize">{architecture}</Badge>}
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleNewAnalysis}>Analyze New Product</Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Results Tabs */}
              <Tabs value={resultsTab} onValueChange={setResultsTab}>
                <TabsList className="grid w-full max-w-3xl grid-cols-5 mb-6">
                  <TabsTrigger value="bom">BOM & Costs</TabsTrigger>
                  <TabsTrigger value="ecosystem" className="gap-1">
                    <Map className="h-3.5 w-3.5" />
                    Ecosystem
                  </TabsTrigger>
                  <TabsTrigger value="dual-source" className="gap-1">
                    <GitBranch className="h-3.5 w-3.5" />
                    Dual-Source
                  </TabsTrigger>
                  <TabsTrigger value="competition">
                    <Factory className="h-4 w-4 mr-1" />
                    Competition
                  </TabsTrigger>
                  <TabsTrigger value="substitutes">
                    <Repeat2 className="h-4 w-4 mr-1" />
                    Substitutes
                  </TabsTrigger>
                </TabsList>

                {/* BOM Tab */}
                <TabsContent value="bom" className="space-y-6">
                  <BOMCostSummary components={components} confidence={confidence} />

                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                      {/* BOM Type Selector */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <BOMTypeSelector value={bomType} onChange={setBomType} />
                        {bomType === "mbom" && <Badge variant="secondary" className="text-xs">+{SUPPLEMENTARY_ITEMS.filter(s => s.bomType === "mbom").length} mfg items</Badge>}
                        {bomType === "service" && <Badge variant="secondary" className="text-xs">Service parts only</Badge>}
                      </div>

                      <Card>
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <CardTitle>
                              {productName} - Components ({filteredComponents.length})
                            </CardTitle>
                            {!currentImage && (
                              <Button variant="outline" size="sm" onClick={handleNewAnalysis}>New Analysis</Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="table" className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <TabsList>
                                <TabsTrigger value="table">Table View</TabsTrigger>
                                <TabsTrigger value="cards">Card View</TabsTrigger>
                              </TabsList>
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="Search components..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-[200px]" />
                                </div>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                  <SelectTrigger className="w-[160px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {componentCategories.map((cat) => (
                                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <TabsContent value="table">
                              <BOMComponentsTable components={filteredComponents} onViewSuppliers={handleViewSuppliers} />
                            </TabsContent>

                            <TabsContent value="cards">
                              <div className="grid gap-4 sm:grid-cols-2">
                                {filteredComponents.map((component) => (
                                  <ComponentCard
                                    key={component.id}
                                    component={component}
                                    totalCost={totalCost}
                                    onViewSuppliers={() => handleViewSuppliers(component)}
                                  />
                                ))}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right sidebar panels */}
                    <div className="lg:col-span-1 space-y-4">
                      <BOMCompletenessChecklist components={components} />
                      <BOMRiskClassification components={components} />
                      <ContentGenerationPanel
                        productName={productName}
                        productCategory={productCategory}
                        components={components.map((c) => ({
                          name: c.name, category: c.category, material: c.material, specifications: c.specifications,
                        }))}
                        attributes={{
                          componentCount: String(components.length),
                          estimatedCost: fc(components.reduce((sum, c) => sum + c.totalCost, 0)),
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Ecosystem Tab */}
                <TabsContent value="ecosystem">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <SupplierEcosystemMap components={components} />
                  </motion.div>
                </TabsContent>

                {/* Dual-Source Tab */}
                <TabsContent value="dual-source">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <DualSourcePanel components={components} />
                  </motion.div>
                </TabsContent>

                {/* Competition Tab */}
                <TabsContent value="competition">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <ProducerCompetition competitors={producerResults?.competition || []} />
                  </motion.div>
                </TabsContent>

                {/* Substitutes Tab */}
                <TabsContent value="substitutes">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <SubstituteProducers producers={producerResults?.substituteCompetition || []} />
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        <BOMSupplierMatchModal open={supplierModalOpen} onOpenChange={setSupplierModalOpen} component={selectedComponent} />
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
  totalCost,
  onViewSuppliers,
}: {
  component: BOMComponent;
  totalCost: number;
  onViewSuppliers: () => void;
}) {
  const fc = useFormatCurrency();
  const { quadrant } = classifyComponent(component, totalCost);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-foreground">{component.name}</h4>
          <p className="text-xs text-muted-foreground">{component.category}</p>
        </div>
        <span className="text-lg font-bold">{fc(component.totalCost)}</span>
      </div>

      <div className="mb-2">
        <KraljicBadge quadrant={quadrant} />
      </div>

      {component.specifications && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{component.specifications}</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{component.quantity} {component.unit}</span>
        <Button variant="ghost" size="sm" onClick={onViewSuppliers}>{component.matchedSuppliers} suppliers</Button>
      </div>
    </motion.div>
  );
}
