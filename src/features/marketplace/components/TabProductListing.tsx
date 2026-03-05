import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Save, ArrowRight, Search, LayoutGrid, List, Sparkles, X, Video, Download, PackageOpen, Pencil, Globe } from "lucide-react";
import { useAnalysisStore } from "@/stores/analysisStore";
import { supabase } from "@/integrations/supabase/client";
import { ProductImageUploader } from "./ProductImageUploader";
import { toast } from "sonner";
import { useMarketplaceStore } from "../store/marketplaceStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContentStudioStore } from "@/stores/contentStudioStore";

const CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Auto", "Sports", "Books", "Toys", "Health", "Food", "Services", "Other"];
const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
];

interface Variant {
  id: string;
  type: string;
  value: string;
  price: number;
  stock: number;
}

export function TabProductListing() {
  const queryClient = useQueryClient();
  const { setActiveTab, setSelectedListingId } = useMarketplaceStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importedFrom, setImportedFrom] = useState<string | null>(null);
  const [selectedMIProduct, setSelectedMIProduct] = useState<string>("custom");

  // Market Intelligence history
  const analysisHistory = useAnalysisStore((s) => s.history);
  const sellerResults = useAnalysisStore((s) => s.sellerResults);

  // Unique MI products (deduplicated by productName)
  const miProducts = useMemo(() => {
    const seen = new Set<string>();
    return analysisHistory.filter((item) => {
      if (seen.has(item.productName)) return false;
      seen.add(item.productName);
      return true;
    });
  }, [analysisHistory]);

  // Content Studio sources
  const { savedItems: studioItems, proImages: storeProImages } = useContentStudioStore();

  const { data: contentTemplates } = useQuery({
    queryKey: ["content-templates-for-import"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_templates")
        .select("id, product_name, content_json, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("new");
  const [sku, setSku] = useState("");
  const [stockQty, setStockQty] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [shippingWeight, setShippingWeight] = useState("");
  const [shippingDimensions, setShippingDimensions] = useState("");
  const [freeShipping, setFreeShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [schedulePublish, setSchedulePublish] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [productImages, setProductImages] = useState<{ id: string; url: string; name: string; isLowRes?: boolean }[]>([]);

  // Build unified import options
  const importOptions: { id: string; label: string; source: "studio" | "db"; date: string }[] = [
    ...studioItems.map((item) => ({
      id: `studio-${item.id}`,
      label: item.productName,
      source: "studio" as const,
      date: item.generatedAt,
    })),
    ...(contentTemplates || []).map((t: any) => ({
      id: `db-${t.id}`,
      label: t.product_name,
      source: "db" as const,
      date: t.created_at,
    })),
  ];

  const handleContentStudioImport = (optionId: string) => {
    if (!optionId) return;

    if (optionId.startsWith("studio-")) {
      const realId = optionId.replace("studio-", "");
      const item = studioItems.find((i) => i.id === realId);
      if (!item) return;

      setTitle(item.productName);
      setDescription(item.adCopy?.long || "");
      // Extract hashtags from social captions
      const allHashtags = item.socialCaptions?.flatMap((sc) => sc.hashtags || []) || [];
      setTags([...new Set(allHashtags)]);
      // Pull pro images from store
      const studioImgs = storeProImages
        .filter((img) => img.imageUrl)
        .map((img) => ({ id: img.id, url: img.imageUrl!, name: img.label }));
      if (studioImgs.length) setProductImages(studioImgs);

      setImportedFrom(item.productName);
      toast.success("Product data imported from Content Studio");
    } else if (optionId.startsWith("db-")) {
      const realId = optionId.replace("db-", "");
      const template = contentTemplates?.find((t: any) => t.id === realId);
      if (!template) return;

      const cj = template.content_json as any;
      setTitle(template.product_name);
      setDescription(cj?.descriptions?.long || cj?.adCopy?.long || "");
      // Extract hashtags
      const igTags: string[] = cj?.socialMedia?.instagram?.hashtags || [];
      const ttTags: string[] = cj?.socialMedia?.tiktok?.hashtags || [];
      setTags([...new Set([...igTags, ...ttTags])]);

      setImportedFrom(template.product_name);
      toast.success("Product data imported from Content Studio");
    }
  };

  const clearImport = () => {
    setImportedFrom(null);
    setSelectedMIProduct("custom");
    resetForm();
  };

  // Handle Market Intelligence product selection
  const handleProductSelect = (value: string) => {
    setSelectedMIProduct(value);

    if (value === "custom") {
      // Clear title so user can type manually
      setTitle("");
      return;
    }

    const miItem = miProducts.find((p) => p.id === value);
    if (!miItem) return;

    // Set title and category from MI
    setTitle(miItem.productName);
    if (miItem.productCategory) {
      const matchedCat = CATEGORIES.find(
        (c) => c.toLowerCase() === miItem.productCategory.toLowerCase()
      );
      if (matchedCat) setCategory(matchedCat);
    }

    // Fill pricing from seller results if product name matches
    if (sellerResults && sellerResults.productIdentification.name.toLowerCase() === miItem.productName.toLowerCase()) {
      if (sellerResults.pricingRecommendation?.suggested) {
        setPrice(sellerResults.pricingRecommendation.suggested.toString());
      }
      if (sellerResults.marketPriceRange?.max) {
        setCompareAtPrice(sellerResults.marketPriceRange.max.toString());
      }
    }

    // Auto-import from Content Studio if a matching template exists
    const matchingStudioItem = studioItems.find(
      (i) => i.productName.toLowerCase() === miItem.productName.toLowerCase()
    );
    const matchingDbTemplate = contentTemplates?.find(
      (t: any) => t.product_name.toLowerCase() === miItem.productName.toLowerCase()
    );

    if (matchingStudioItem) {
      handleContentStudioImport(`studio-${matchingStudioItem.id}`);
    } else if (matchingDbTemplate) {
      handleContentStudioImport(`db-${matchingDbTemplate.id}`);
    } else {
      setImportedFrom(miItem.productName);
      toast.success("Product imported from Market Intelligence");
    }
  };

  const { data: listings, isLoading } = useQuery({
    queryKey: ["marketplace-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (status: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        user_id: user.id,
        title, description,
        price: parseFloat(price) || 0,
        compare_at_price: parseFloat(compareAtPrice) || null,
        category, condition, sku,
        stock_quantity: parseInt(stockQty) || 0,
        low_stock_threshold: parseInt(lowStockThreshold) || 5,
        shipping_weight: parseFloat(shippingWeight) || null,
        shipping_dimensions: shippingDimensions || null,
        free_shipping: freeShipping,
        shipping_cost: parseFloat(shippingCost) || null,
        location, tags,
        images_json: JSON.parse(JSON.stringify(productImages)),
        variants_json: JSON.parse(JSON.stringify(variants)),
        schedule_at: schedulePublish && scheduleAt ? scheduleAt : null,
        status,
      };

      if (editingId) {
        const { data, error } = await supabase.from("marketplace_listings").update(payload).eq("id", editingId).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from("marketplace_listings").insert([payload]).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, status) => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-listings"] });
      toast.success(editingId ? "Listing updated" : (status === "draft" ? "Saved as draft" : "Listing created"));
      resetForm();
      setShowForm(false);
      if (status === "active" && !editingId) {
        setSelectedListingId(data.id);
        setActiveTab("connections");
      }
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marketplace_listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-listings"] });
      toast.success("Listing deleted");
    },
  });

  const resetForm = () => {
    setTitle(""); setDescription(""); setPrice(""); setCompareAtPrice("");
    setCategory(""); setCondition("new"); setSku(""); setStockQty("0");
    setLowStockThreshold("5"); setShippingWeight(""); setShippingDimensions("");
    setFreeShipping(false); setShippingCost(""); setLocation("");
    setTags([]); setTagInput(""); setVariants([]); setSchedulePublish(false); setScheduleAt("");
    setProductImages([]);
    setImportedFrom(null);
    setSelectedMIProduct("custom");
    setEditingId(null);
  };

  const loadListing = (l: any) => {
    setEditingId(l.id);
    setTitle(l.title || "");
    setDescription(l.description || "");
    setPrice(l.price?.toString() || "");
    setCompareAtPrice(l.compare_at_price?.toString() || "");
    setCategory(l.category || "");
    setCondition(l.condition || "new");
    setSku(l.sku || "");
    setStockQty(l.stock_quantity?.toString() || "0");
    setLowStockThreshold(l.low_stock_threshold?.toString() || "5");
    setShippingWeight(l.shipping_weight?.toString() || "");
    setShippingDimensions(l.shipping_dimensions || "");
    setFreeShipping(l.free_shipping || false);
    setShippingCost(l.shipping_cost?.toString() || "");
    setLocation(l.location || "");
    setTags(l.tags || []);
    setVariants(Array.isArray(l.variants_json) ? l.variants_json : []);
    setProductImages(Array.isArray(l.images_json) ? l.images_json : []);
    setSchedulePublish(!!l.schedule_at);
    setScheduleAt(l.schedule_at || "");
    setImportedFrom(null);
    setShowForm(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const addVariant = () => {
    setVariants([...variants, { id: crypto.randomUUID(), type: "Size", value: "", price: 0, stock: 0 }]);
  };

  const handleAiOptimize = async () => {
    if (!title) return toast.error("Enter a title first");
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("marketplace-ai", {
        body: { type: "optimize-title", payload: { title, category, platform: "general" } },
      });
      if (error) throw error;
      if (data?.result) {
        setTitle(data.result.trim());
        toast.success("Title optimized by AI");
      }
    } catch { toast.error("AI optimization failed"); }
    finally { setAiLoading(false); }
  };

  const filteredListings = (listings || []).filter((l: any) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Product Form */}
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create New Listing
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? "Edit Listing" : "New Product Listing"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Import from Content Studio */}
            {importOptions.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Download className="w-4 h-4" /> Import from Content Studio
                </Label>
                <Select onValueChange={handleContentStudioImport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Content Studio product to auto-fill..." />
                  </SelectTrigger>
                  <SelectContent>
                    {importOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label} — {new Date(opt.date).toLocaleDateString()}{" "}
                        <span className="text-muted-foreground text-xs">({opt.source === "studio" ? "Session" : "Saved"})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Imported banner */}
            {importedFrom && (
              <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                <PackageOpen className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm flex-1">
                  Imported from <strong>{importedFrom}</strong>
                </span>
                <Button variant="ghost" size="sm" onClick={clearImport}>
                  <X className="w-4 h-4" /> Clear
                </Button>
              </div>
            )}

            {/* Product Title — MI Dropdown + Manual Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" /> Product Title
              </Label>
              <Select value={selectedMIProduct} onValueChange={handleProductSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product or enter manually..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">✏️ Custom Product (Manual Entry)</SelectItem>
                  {miProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.productName} — {p.productCategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={selectedMIProduct === "custom" ? "Enter product title manually" : "Edit product title..."}
                />
                <Button variant="outline" size="sm" onClick={handleAiOptimize} disabled={aiLoading}>
                  <Sparkles className="w-4 h-4 mr-1" /> {aiLoading ? "..." : "AI"}
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your product..." rows={4} />
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Compare-at Price</Label>
                <Input type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="Original price" />
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SKU / Barcode</Label>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Optional" />
              </div>
            </div>

            {/* Media placeholder */}
            <ProductImageUploader
              images={productImages}
              onChange={setProductImages}
              maxImages={10}
            />

            <div className="space-y-2">
              <Label>Product Video</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
                <Video className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs">Upload video (up to 60s)</p>
              </div>
            </div>

            {/* Stock & Shipping */}
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Low Stock Alert</Label>
                <Input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Shipping Weight (kg)</Label>
                <Input type="number" value={shippingWeight} onChange={(e) => setShippingWeight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Dimensions (LxWxH cm)</Label>
                <Input value={shippingDimensions} onChange={(e) => setShippingDimensions(e.target.value)} placeholder="30x20x10" />
              </div>
              <div className="space-y-2 flex items-end gap-3">
                <div className="flex items-center gap-2">
                  <Switch checked={freeShipping} onCheckedChange={setFreeShipping} />
                  <Label>Free Shipping</Label>
                </div>
                {!freeShipping && (
                  <Input type="number" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} placeholder="Cost" className="w-24" />
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags / Keywords</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add a tag"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} />
                <Button variant="outline" size="sm" onClick={handleAddTag}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setTags(tags.filter((x) => x !== t))}>
                      {t} <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Variants */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Product Variants</Label>
                <Button variant="outline" size="sm" onClick={addVariant}><Plus className="w-3 h-3 mr-1" /> Add Variant</Button>
              </div>
              {variants.map((v, i) => (
                <div key={v.id} className="flex gap-2 items-center">
                  <Select value={v.type} onValueChange={(val) => { const nv = [...variants]; nv[i].type = val; setVariants(nv); }}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Size">Size</SelectItem>
                      <SelectItem value="Color">Color</SelectItem>
                      <SelectItem value="Material">Material</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input className="flex-1" placeholder="Value" value={v.value} onChange={(e) => { const nv = [...variants]; nv[i].value = e.target.value; setVariants(nv); }} />
                  <Input className="w-20" type="number" placeholder="Price" value={v.price || ""} onChange={(e) => { const nv = [...variants]; nv[i].price = parseFloat(e.target.value) || 0; setVariants(nv); }} />
                  <Input className="w-20" type="number" placeholder="Stock" value={v.stock || ""} onChange={(e) => { const nv = [...variants]; nv[i].stock = parseInt(e.target.value) || 0; setVariants(nv); }} />
                  <Button variant="ghost" size="sm" onClick={() => setVariants(variants.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
            </div>

            {/* Schedule */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={schedulePublish} onCheckedChange={setSchedulePublish} />
                <Label>Schedule for Later</Label>
              </div>
              {schedulePublish && (
                <Input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className="w-auto" />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</Button>
              <Button variant="secondary" onClick={() => saveMutation.mutate("draft")} disabled={saveMutation.isPending}>
                <Save className="w-4 h-4 mr-1" /> {editingId ? "Update Draft" : "Save as Draft"}
              </Button>
              <Button onClick={() => saveMutation.mutate("active")} disabled={saveMutation.isPending || !title}>
                {editingId ? "Save Changes" : "Continue to Publishing"} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">My Listings</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-8 w-48" />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                {viewMode === "grid" ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No listings yet</p>
              <p className="text-sm mb-4">Create your first product listing to start selling across platforms</p>
              {!showForm && <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" /> Create Listing</Button>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.title}</TableCell>
                    <TableCell>{l.currency} {l.price}</TableCell>
                    <TableCell>
                      <Badge variant={l.stock_quantity <= l.low_stock_threshold ? "destructive" : "secondary"}>
                        {l.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={l.status === "active" ? "default" : "secondary"}>{l.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => loadListing(l)}>
                          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedListingId(l.id); setActiveTab("connections"); }}>
                          Publish
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(l.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
