import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, Mail, FileText, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const emailFormSchema = z.object({
  senderName: z.string().min(2),
  senderEmail: z.string().email(),
  senderCompany: z.string().min(2),
  subject: z.string().min(5),
  message: z.string().min(20),
});

const rfqFormSchema = z.object({
  senderName: z.string().min(2),
  senderEmail: z.string().email(),
  senderCompany: z.string().min(2),
  quantity: z.coerce.number().min(1),
  unit: z.string().min(1),
  targetPrice: z.coerce.number().optional(),
  deliveryLocation: z.string().min(3),
  requirements: z.string().min(10),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;
type RFQFormValues = z.infer<typeof rfqFormSchema>;

interface ProductSupplier {
  id: string; name: string; matchScore: number; priceRange: { min: number; max: number }; moq: number; leadTime: string; location: string; verified: boolean;
}

interface ProductInfo { name: string; category: string; specifications: Record<string, string>; }

interface ProductSupplierContactModalProps {
  supplier: ProductSupplier | null;
  product: ProductInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const units = ["units", "pieces", "kg", "tons", "meters", "sets", "boxes", "pallets"];

export function ProductSupplierContactModal({ supplier, product, open, onOpenChange }: ProductSupplierContactModalProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "rfq">("email");
  const { toast } = useToast();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { senderName: "", senderEmail: "", senderCompany: "", subject: product ? `Inquiry about ${product.name}` : "", message: "" },
  });

  const rfqForm = useForm<RFQFormValues>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: { senderName: "", senderEmail: "", senderCompany: "", quantity: supplier?.moq || 100, unit: "units", targetPrice: undefined, deliveryLocation: "", requirements: "" },
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    if (!supplier) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    toast({ title: t("common.success"), description: t("outreach.messageSent") });
    setIsSubmitting(false);
    emailForm.reset();
    onOpenChange(false);
  };

  const onRFQSubmit = async (data: RFQFormValues) => {
    if (!supplier || !product) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    toast({ title: t("rfqCampaign.sentTitle"), description: t("rfqCampaign.sentDesc", { count: 1 }) });
    setIsSubmitting(false);
    rfqForm.reset();
    onOpenChange(false);
  };

  if (!supplier || !product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("suppliers.contactSupplier")} - {supplier.name}
            {supplier.verified && <Badge variant="secondary" className="text-xs">{t("supplierDetail.verified")}</Badge>}
          </DialogTitle>
          <DialogDescription>{t("rfqCampaign.customizeMessageDesc")}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="h-6 w-6 text-primary" /></div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{product.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{supplier.location}</span><span>•</span><span>MOQ: {supplier.moq}</span><span>•</span><span>${supplier.priceRange.min}-${supplier.priceRange.max}/{t("bomComponents.unitCost")}</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "email" | "rfq")} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="gap-2"><Mail className="h-4 w-4" />{t("contact.viaEmail")}</TabsTrigger>
            <TabsTrigger value="rfq" className="gap-2"><FileText className="h-4 w-4" />{t("rfqCampaign.sendRfq")}</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="flex-1 overflow-auto mt-4">
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={emailForm.control} name="senderName" render={({ field }) => (
                    <FormItem><FormLabel>{t("auth.firstName")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={emailForm.control} name="senderEmail" render={({ field }) => (
                    <FormItem><FormLabel>{t("auth.email")}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={emailForm.control} name="senderCompany" render={({ field }) => (
                  <FormItem><FormLabel>{t("auth.companyName")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={emailForm.control} name="subject" render={({ field }) => (
                  <FormItem><FormLabel>{t("contentStudio.subject")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={emailForm.control} name="message" render={({ field }) => (
                  <FormItem><FormLabel>{t("contact.message")}</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />...</> : <><Send className="h-4 w-4 mr-2" />{t("common.submit")}</>}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="rfq" className="flex-1 overflow-auto mt-4">
            <Form {...rfqForm}>
              <form onSubmit={rfqForm.handleSubmit(onRFQSubmit)} className="space-y-4">
                {/* Simplified for brevity, similar structure to above */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={rfqForm.control} name="senderName" render={({ field }) => (<FormItem><FormLabel>{t("auth.firstName")}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                  <FormField control={rfqForm.control} name="senderEmail" render={({ field }) => (<FormItem><FormLabel>{t("auth.email")}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                </div>
                <FormField control={rfqForm.control} name="senderCompany" render={({ field }) => (<FormItem><FormLabel>{t("auth.companyName")}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={rfqForm.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>{t("bomComponents.qty")}</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                  <FormField control={rfqForm.control} name="unit" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("bomComponents.unit")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{units.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={rfqForm.control} name="targetPrice" render={({ field }) => (<FormItem><FormLabel>{t("bomSupplierMatch.estPrice")}</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                </div>
                <FormField control={rfqForm.control} name="deliveryLocation" render={({ field }) => (<FormItem><FormLabel>{t("supplierDetail.location")}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                <FormField control={rfqForm.control} name="requirements" render={({ field }) => (<FormItem><FormLabel>{t("rfqCampaign.customizeMessage")}</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" disabled={isSubmitting}>{t("rfqCampaign.sendRfq")}</Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
