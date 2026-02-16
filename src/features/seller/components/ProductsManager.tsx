import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { Plus, Pencil, Trash2, Package, Upload } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string | null;
  image_url: string | null;
  cost: number;
  current_price: number;
  sku: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

const CATEGORIES = [
  "Electronics", "Clothing", "Home & Garden", "Beauty", "Sports",
  "Toys", "Automotive", "Food & Beverage", "Health", "Other"
];

const emptyForm = {
  name: "", category: "", cost: "", current_price: "", sku: "", description: "", status: "active"
};

export function ProductsManager() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const fc = useFormatCurrency();

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      setProducts((data as Product[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category || "",
      cost: String(p.cost),
      current_price: String(p.current_price),
      sku: p.sku || "",
      description: p.description || "",
      status: p.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: t("products.nameRequired"), variant: "destructive" });
      return;
    }
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: t("products.pleaseLogIn"), variant: "destructive" });
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category || null,
      cost: parseFloat(form.cost) || 0,
      current_price: parseFloat(form.current_price) || 0,
      sku: form.sku || null,
      description: form.description || null,
      status: form.status,
      user_id: user.id,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }

    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? t("products.productUpdated") : t("products.productCreated") });
      setDialogOpen(false);
      fetchProducts();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("products.productDeleted") });
      fetchProducts();
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    if (lines.length < 2) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
      const vals = line.split(",").map(v => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
      return {
        user_id: user.id,
        name: obj.name || "Unnamed",
        category: obj.category || null,
        cost: parseFloat(obj.cost) || 0,
        current_price: parseFloat(obj.current_price || obj.price) || 0,
        sku: obj.sku || null,
        description: obj.description || null,
        status: "active",
      };
    });

    const { error } = await supabase.from("products").insert(rows);
    if (error) {
      toast({ title: t("products.csvImportFailed"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("products.productsImported", { count: rows.length }) });
      fetchProducts();
    }
    e.target.value = "";
  };

  const margin = (p: Product) => p.current_price > 0 ? ((p.current_price - p.cost) / p.current_price * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("products.title")}</h1>
          <p className="text-muted-foreground">{t("products.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <label>
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
            <Button variant="outline" asChild>
              <span><Upload className="h-4 w-4 mr-2" />{t("products.importCSV")}</span>
            </Button>
          </label>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{t("products.addProduct")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? t("products.editProduct") : t("products.newProduct")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>{t("products.productName")} *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("products.category")}</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("products.sku")}</Label>
                    <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("products.cogs")}</Label>
                    <Input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
                  </div>
                  <div>
                    <Label>{t("products.sellingPrice")}</Label>
                    <Input type="number" value={form.current_price} onChange={e => setForm(f => ({ ...f, current_price: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>{t("competitorMonitor.description")}</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                </div>
                <div>
                  <Label>{t("common.status")}</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("products.active")}</SelectItem>
                      <SelectItem value="inactive">{t("products.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? t("products.saving") : editingId ? t("products.updateProduct") : t("products.createProduct")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">{t("products.loadingProducts")}</CardContent></Card>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">{t("products.noProducts")}</h3>
            <p className="text-muted-foreground mb-4">{t("products.noProductsDesc")}</p>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{t("products.addProduct")}</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("products.allProducts")} ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("products.productName")}</TableHead>
                  <TableHead>{t("products.category")}</TableHead>
                  <TableHead>{t("products.sku")}</TableHead>
                  <TableHead className="text-right">{t("products.cogs")}</TableHead>
                  <TableHead className="text-right">{t("competitorMonitor.price")}</TableHead>
                  <TableHead className="text-right">{t("products.margin")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{p.sku || "—"}</TableCell>
                    <TableCell className="text-right">{fc(p.cost)}</TableCell>
                    <TableCell className="text-right font-medium">{fc(p.current_price)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={Number(margin(p)) > 30 ? "default" : Number(margin(p)) > 10 ? "secondary" : "destructive"}>
                        {margin(p)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status === "active" ? t("products.active") : t("products.inactive")}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
