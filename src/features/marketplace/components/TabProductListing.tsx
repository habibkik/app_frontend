import { useState } from "react";
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
import { Plus, Trash2, Save, ArrowRight, Search, LayoutGrid, List, Sparkles, X, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductImageUploader } from "./ProductImageUploader";
import { toast } from "sonner";
import { useMarketplaceStore } from "../store/marketplaceStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

      const { data, error } = await supabase.from("marketplace_listings").insert([payload]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, status) => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-listings"] });
      toast.success(status === "draft" ? "Saved as draft" : "Listing created");
      resetForm();
      setShowForm(false);
      if (status === "active") {
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
            <CardTitle className="text-lg">New Product Listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label>Product Title</Label>
              <div className="flex gap-2">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter product title" />
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
                <Save className="w-4 h-4 mr-1" /> Save as Draft
              </Button>
              <Button onClick={() => saveMutation.mutate("active")} disabled={saveMutation.isPending || !title}>
                Continue to Publishing <ArrowRight className="w-4 h-4 ml-1" />
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
