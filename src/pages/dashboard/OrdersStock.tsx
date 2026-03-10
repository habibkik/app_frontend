import React, { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingCart, Package, Users, BarChart3, Plus, Trash2, Loader2,
  AlertTriangle, TrendingUp, DollarSign, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  product_name: string;
  quantity: number;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  current_price: number;
  cost: number;
  image_url: string | null;
  category: string | null;
  sku: string | null;
  status: string;
  description: string | null;
}

export default function OrdersStockPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", current_price: 0, cost: 0, category: "", sku: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [orderFilter, setOrderFilter] = useState<"all" | "recent">("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [ordersRes, productsRes] = await Promise.all([
      supabase.from("content_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (ordersRes.data) setOrders(ordersRes.data);
    if (productsRes.data) setProducts(productsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) { toast.error("Product name required"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("products").insert({
        user_id: user.id,
        name: newProduct.name,
        current_price: newProduct.current_price,
        cost: newProduct.cost,
        category: newProduct.category || null,
        sku: newProduct.sku || null,
        description: newProduct.description || null,
      });
      if (error) throw error;
      toast.success("Product added!");
      setShowAddProduct(false);
      setNewProduct({ name: "", current_price: 0, cost: 0, category: "", sku: "", description: "" });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    const { error } = await supabase.from("content_orders").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast.success("Order removed");
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product removed");
  };

  // Stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => {
    const prod = products.find((p) => p.name === o.product_name);
    return sum + (prod ? prod.current_price * o.quantity : 0);
  }, 0);
  const uniqueCustomers = new Set(orders.map((o) => o.email)).size;
  const lowStockProducts = products.filter((p) => p.status === "active");
  const recentOrders = orderFilter === "recent" ? orders.slice(0, 10) : orders;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orders & Stock</h1>
            <p className="text-sm text-muted-foreground">Manage orders from your published websites and track inventory</p>
          </div>
          <Button onClick={() => setShowAddProduct(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Estimated Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{uniqueCustomers}</p>
                  <p className="text-xs text-muted-foreground">Unique Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-1.5" /> Orders</TabsTrigger>
            <TabsTrigger value="stock"><Package className="h-4 w-4 mr-1.5" /> Stock</TabsTrigger>
            <TabsTrigger value="customers"><Users className="h-4 w-4 mr-1.5" /> Customers</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1.5" /> Analytics</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Order History</CardTitle>
                <Select value={orderFilter} onValueChange={(v: any) => setOrderFilter(v)}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="recent">Recent 10</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No orders yet. Orders will appear here when customers submit orders from your published websites.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Customer</TableHead>
                          <TableHead className="text-xs">Product</TableHead>
                          <TableHead className="text-xs">Qty</TableHead>
                          <TableHead className="text-xs">Email</TableHead>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="text-sm font-medium">{order.name}</TableCell>
                            <TableCell className="text-sm">{order.product_name}</TableCell>
                            <TableCell className="text-sm">{order.quantity}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{order.email}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteOrder(order.id)}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Tab */}
          <TabsContent value="stock">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Product Inventory</CardTitle>
                <Button size="sm" onClick={() => setShowAddProduct(true)}>
                  <Plus className="h-3 w-3 mr-1" /> Add Product
                </Button>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No products yet. Add products to track your inventory.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Product</TableHead>
                          <TableHead className="text-xs">SKU</TableHead>
                          <TableHead className="text-xs">Category</TableHead>
                          <TableHead className="text-xs">Cost</TableHead>
                          <TableHead className="text-xs">Price</TableHead>
                          <TableHead className="text-xs">Margin</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => {
                          const margin = product.current_price > 0 ? ((product.current_price - product.cost) / product.current_price * 100) : 0;
                          return (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="h-8 w-8 rounded object-cover" />
                                  ) : (
                                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>
                                  )}
                                  <span className="text-sm font-medium">{product.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{product.sku || "—"}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{product.category || "—"}</TableCell>
                              <TableCell className="text-sm">${product.cost.toFixed(2)}</TableCell>
                              <TableCell className="text-sm font-medium">${product.current_price.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant={margin > 30 ? "default" : margin > 0 ? "secondary" : "destructive"} className="text-xs">
                                  {margin.toFixed(0)}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={product.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                                  {product.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteProduct(product.id)}>
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader><CardTitle className="text-base">Customer List</CardTitle></CardHeader>
              <CardContent>
                {uniqueCustomers === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No customers yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Customer</TableHead>
                          <TableHead className="text-xs">Email</TableHead>
                          <TableHead className="text-xs">Phone</TableHead>
                          <TableHead className="text-xs">Orders</TableHead>
                          <TableHead className="text-xs">Last Order</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from(new Map(orders.map((o) => [o.email, o])).values()).map((customer) => {
                          const customerOrders = orders.filter((o) => o.email === customer.email);
                          return (
                            <TableRow key={customer.email}>
                              <TableCell className="text-sm font-medium">{customer.name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{customer.email}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{customer.phone || "—"}</TableCell>
                              <TableCell><Badge variant="secondary" className="text-xs">{customerOrders.length}</Badge></TableCell>
                              <TableCell className="text-xs text-muted-foreground">{new Date(customerOrders[0].created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Top Products</CardTitle></CardHeader>
                <CardContent>
                  {(() => {
                    const productCounts = orders.reduce<Record<string, number>>((acc, o) => {
                      acc[o.product_name] = (acc[o.product_name] || 0) + o.quantity;
                      return acc;
                    }, {});
                    const sorted = Object.entries(productCounts).sort(([, a], [, b]) => b - a).slice(0, 5);
                    if (sorted.length === 0) return <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>;
                    return (
                      <div className="space-y-3">
                        {sorted.map(([name, qty], i) => (
                          <div key={name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                              <span className="text-sm font-medium">{name}</span>
                            </div>
                            <Badge variant="secondary">{qty} units</Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4" /> Order Summary</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Orders</span>
                      <span className="text-sm font-semibold">{totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Quantity Ordered</span>
                      <span className="text-sm font-semibold">{orders.reduce((sum, o) => sum + o.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg. Order Quantity</span>
                      <span className="text-sm font-semibold">{totalOrders > 0 ? (orders.reduce((sum, o) => sum + o.quantity, 0) / totalOrders).toFixed(1) : "0"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Unique Products Ordered</span>
                      <span className="text-sm font-semibold">{new Set(orders.map((o) => o.product_name)).size}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estimated Revenue</span>
                      <span className="text-sm font-semibold text-primary">${totalRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Product Name *</Label>
              <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g. E-Bike Model X" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Cost</Label>
                <Input type="number" value={newProduct.cost} onChange={(e) => setNewProduct({ ...newProduct, cost: Number(e.target.value) })} min={0} step={0.01} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Price</Label>
                <Input type="number" value={newProduct.current_price} onChange={(e) => setNewProduct({ ...newProduct, current_price: Number(e.target.value) })} min={0} step={0.01} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">SKU</Label>
                <Input value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} placeholder="SKU-001" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Category</Label>
                <Input value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="Electronics" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Description</Label>
              <Input value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Product description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduct(false)}>Cancel</Button>
            <Button onClick={handleAddProduct} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</> : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
