import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  AlertTriangle, TrendingUp, DollarSign, Eye, Percent, Activity, X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  product_name: string;
  quantity: number;
  created_at: string;
  status: OrderStatus;
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
  stock_count: number;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  processing: { label: "Processing", className: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
  shipped: { label: "Shipped", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  delivered: { label: "Delivered", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const MOCK_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

function getOrderStatus(index: number): OrderStatus {
  return MOCK_STATUSES[index % MOCK_STATUSES.length];
}

function getStockCount(product: Product): number {
  // Simulate stock from product data — in real app this would be a DB column
  return product.stock_count ?? Math.floor(Math.random() * 50);
}

export default function OrdersStockPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", current_price: 0, cost: 0, category: "", sku: "", description: "", stock_count: 0 });
  const [saving, setSaving] = useState(false);
  const [orderFilter, setOrderFilter] = useState<"all" | "recent" | "pending" | "shipped" | "delivered">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [ordersRes, productsRes] = await Promise.all([
      supabase.from("content_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (ordersRes.data) {
      setOrders(ordersRes.data.map((o: any, i: number) => ({
        ...o,
        status: getOrderStatus(i),
      })));
    }
    if (productsRes.data) {
      setProducts(productsRes.data.map((p: any) => ({
        ...p,
        stock_count: Math.floor(Math.random() * 30) + 1, // Simulated stock
      })));
    }
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
      setNewProduct({ name: "", current_price: 0, cost: 0, category: "", sku: "", description: "", stock_count: 0 });
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
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const conversionRate = totalOrders > 0 ? Math.min(((totalOrders / Math.max(totalOrders * 8, 1)) * 100), 100) : 0; // Simulated
  const activeOrders = orders.filter((o) => o.status === "pending" || o.status === "processing" || o.status === "shipped").length;
  const uniqueCustomers = new Set(orders.map((o) => o.email)).size;
  const lowStockProducts = products.filter((p) => p.stock_count < 5);

  const filteredOrders = orderFilter === "all" ? orders
    : orderFilter === "recent" ? orders.slice(0, 10)
    : orders.filter((o) => o.status === orderFilter);

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
            <h1 className="text-2xl font-bold text-foreground">{t("pages.ordersStock.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("pages.ordersStock.subtitle")}</p>
          </div>
          <Button onClick={() => setShowAddProduct(true)}>
            <Plus className="h-4 w-4 mr-2" /> {t("pages.ordersStock.addProduct")}
          </Button>
        </div>

        {/* Low Stock Alert Banner */}
        {lowStockProducts.length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{t("pages.ordersStock.lowStockAlert")}</p>
              <p className="text-xs text-muted-foreground">
                {lowStockProducts.map((p) => p.name).join(", ")} — {t("pages.ordersStock.lowStockDesc")}
              </p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground truncate">${totalRevenue.toFixed(0)}</p>
                  <p className="text-[10px] text-muted-foreground">{t("pages.ordersStock.totalRevenue")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground truncate">${aov.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">{t("pages.ordersStock.avgOrderValue")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Percent className="h-4 w-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground truncate">{conversionRate.toFixed(1)}%</p>
                  <p className="text-[10px] text-muted-foreground">{t("pages.ordersStock.conversionRate")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground truncate">{activeOrders}</p>
                  <p className="text-[10px] text-muted-foreground">Active Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-violet-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground truncate">{uniqueCustomers}</p>
                  <p className="text-[10px] text-muted-foreground">Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-rose-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground truncate">{products.length}</p>
                  <p className="text-[10px] text-muted-foreground">Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-1.5" /> Orders</TabsTrigger>
            <TabsTrigger value="stock"><Package className="h-4 w-4 mr-1.5" /> Inventory</TabsTrigger>
            <TabsTrigger value="customers"><Users className="h-4 w-4 mr-1.5" /> Customers</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1.5" /> Analytics</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Order History</CardTitle>
                <Select value={orderFilter} onValueChange={(v: any) => setOrderFilter(v)}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="recent">Recent 10</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No orders yet. Orders will appear here when customers submit orders from your published websites.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Order ID</TableHead>
                          <TableHead className="text-xs">Customer</TableHead>
                          <TableHead className="text-xs">Product</TableHead>
                          <TableHead className="text-xs">Qty</TableHead>
                          <TableHead className="text-xs">Total</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => {
                          const prod = products.find((p) => p.name === order.product_name);
                          const total = prod ? prod.current_price * order.quantity : 0;
                          const statusCfg = STATUS_CONFIG[order.status];
                          return (
                            <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedOrder(order)}>
                              <TableCell className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8)}</TableCell>
                              <TableCell className="text-sm font-medium">{order.name}</TableCell>
                              <TableCell className="text-sm">{order.product_name}</TableCell>
                              <TableCell className="text-sm">{order.quantity}</TableCell>
                              <TableCell className="text-sm font-medium">${total.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`text-[10px] font-semibold ${statusCfg.className}`}>
                                  {statusCfg.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}>
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  </Button>
                                </div>
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
                          <TableHead className="text-xs">Stock</TableHead>
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
                          const isLowStock = product.stock_count < 5;
                          return (
                            <TableRow key={product.id} className={isLowStock ? "bg-destructive/5" : ""}>
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
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  {isLowStock && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                                  <span className={`text-sm font-medium ${isLowStock ? "text-destructive" : ""}`}>
                                    {product.stock_count}
                                  </span>
                                </div>
                              </TableCell>
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
                          <TableHead className="text-xs">Total Spent</TableHead>
                          <TableHead className="text-xs">Last Order</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from(new Map(orders.map((o) => [o.email, o])).values()).map((customer) => {
                          const customerOrders = orders.filter((o) => o.email === customer.email);
                          const totalSpent = customerOrders.reduce((sum, o) => {
                            const prod = products.find((p) => p.name === o.product_name);
                            return sum + (prod ? prod.current_price * o.quantity : 0);
                          }, 0);
                          return (
                            <TableRow key={customer.email}>
                              <TableCell className="text-sm font-medium">{customer.name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{customer.email}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{customer.phone || "—"}</TableCell>
                              <TableCell><Badge variant="secondary" className="text-xs">{customerOrders.length}</Badge></TableCell>
                              <TableCell className="text-sm font-medium text-primary">${totalSpent.toFixed(2)}</TableCell>
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
                      <span className="text-sm text-muted-foreground">Average Order Value</span>
                      <span className="text-sm font-semibold">${aov.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pending Orders</span>
                      <span className="text-sm font-semibold">{orders.filter((o) => o.status === "pending").length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Shipped Orders</span>
                      <span className="text-sm font-semibold">{orders.filter((o) => o.status === "shipped").length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Delivered Orders</span>
                      <span className="text-sm font-semibold">{orders.filter((o) => o.status === "delivered").length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estimated Revenue</span>
                      <span className="text-sm font-semibold text-primary">${totalRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Order Status Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {(Object.entries(STATUS_CONFIG) as [OrderStatus, typeof STATUS_CONFIG[OrderStatus]][]).map(([status, cfg]) => {
                      const count = orders.filter((o) => o.status === status).length;
                      return (
                        <div key={status} className="text-center p-3 rounded-lg border bg-card">
                          <Badge variant="outline" className={`text-xs mb-2 ${cfg.className}`}>{cfg.label}</Badge>
                          <p className="text-2xl font-bold text-foreground">{count}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order Details
              {selectedOrder && (
                <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[selectedOrder.status].className}`}>
                  {STATUS_CONFIG[selectedOrder.status].label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (() => {
            const prod = products.find((p) => p.name === selectedOrder.product_name);
            const total = prod ? prod.current_price * selectedOrder.quantity : 0;
            return (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Order ID</p>
                    <p className="font-mono text-xs">#{selectedOrder.id.slice(0, 12)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Date</p>
                    <p className="text-xs">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground text-xs">Name:</span> <span className="font-medium">{selectedOrder.name}</span></div>
                    <div><span className="text-muted-foreground text-xs">Email:</span> {selectedOrder.email}</div>
                    {selectedOrder.phone && <div><span className="text-muted-foreground text-xs">Phone:</span> {selectedOrder.phone}</div>}
                    {selectedOrder.address && <div className="col-span-2"><span className="text-muted-foreground text-xs">Address:</span> {selectedOrder.address}</div>}
                  </div>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</p>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{selectedOrder.product_name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {selectedOrder.quantity} × ${prod?.current_price.toFixed(2) || "—"}</p>
                    </div>
                    <p className="text-lg font-bold text-primary">${total.toFixed(2)}</p>
                  </div>
                </div>
                {/* Status Timeline */}
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Timeline</p>
                  <div className="flex items-center gap-1">
                    {(["pending", "processing", "shipped", "delivered"] as OrderStatus[]).map((s, i) => {
                      const statusIdx = ["pending", "processing", "shipped", "delivered"].indexOf(selectedOrder.status);
                      const isCompleted = i <= statusIdx;
                      const isCurrent = i === statusIdx;
                      return (
                        <React.Fragment key={s}>
                          <div className={`flex flex-col items-center flex-1`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} ${isCurrent ? "ring-2 ring-primary/30" : ""}`}>
                              {isCompleted ? "✓" : i + 1}
                            </div>
                            <span className={`text-[10px] mt-1 ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                              {STATUS_CONFIG[s].label}
                            </span>
                          </div>
                          {i < 3 && <div className={`h-0.5 flex-1 mt-[-12px] ${i < statusIdx ? "bg-primary" : "bg-muted"}`} />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
