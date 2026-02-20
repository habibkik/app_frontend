import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const orderSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email("Invalid email").max(255),
  address: z.string().trim().max(500).optional(),
  quantity: z.number().int().min(1, "Min quantity is 1").max(99999),
});

interface Props {
  productName: string;
  userId: string;
}

export const OrderForm: React.FC<Props> = ({ productName, userId }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", quantity: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = orderSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Validation error");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("content_orders" as any).insert({
        user_id: userId,
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        email: parsed.data.email,
        address: parsed.data.address || null,
        quantity: parsed.data.quantity,
        product_name: productName,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Order submitted successfully!");
    } catch (err) {
      console.error("Order submit error:", err);
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
          <CheckCircle className="h-12 w-12 text-primary" />
          <p className="text-lg font-semibold">Order Submitted!</p>
          <p className="text-sm text-muted-foreground">Thank you for your interest in {productName}.</p>
          <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", email: "", address: "", quantity: 1 }); }}>
            Submit Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order {productName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="order-name">Name *</Label>
            <Input id="order-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order-email">Email *</Label>
            <Input id="order-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order-phone">Phone</Label>
            <Input id="order-phone" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} maxLength={30} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order-qty">Quantity *</Label>
            <Input id="order-qty" type="number" min={1} max={99999} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="order-address">Address</Label>
            <Input id="order-address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} maxLength={500} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Order
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
