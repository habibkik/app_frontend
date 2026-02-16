import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Supplier } from "@/data/suppliers";
import { useToast } from "@/hooks/use-toast";
import { useConversations } from "@/contexts/ConversationsContext";

const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  company: z.string().trim().min(2, "Company name must be at least 2 characters").max(100),
  inquiryType: z.enum(["quote", "product", "partnership", "general"]),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().trim().min(20, "Message must be at least 20 characters").max(2000),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactSupplierModalProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactSupplierModal({ supplier, open, onOpenChange }: ContactSupplierModalProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createConversation, setActiveConversationId, getConversationBySupplier } = useConversations();

  const inquiryTypes = [
    { value: "quote", label: t("rfqCampaign.templateQuick") },
    { value: "product", label: "Product Inquiry" },
    { value: "partnership", label: "Partnership Opportunity" },
    { value: "general", label: t("rfqCampaign.templateCustom") },
  ];

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", company: "", inquiryType: undefined, subject: "", message: "" },
  });

  const existingConversation = supplier ? getConversationBySupplier(supplier.id) : undefined;

  const onSubmit = async (data: ContactFormValues) => {
    if (!supplier) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const conversationId = createConversation({
      supplier,
      subject: data.subject,
      message: data.message,
      inquiryType: inquiryTypes.find(t => t.value === data.inquiryType)?.label || data.inquiryType,
      senderName: data.name,
      senderEmail: data.email,
      senderCompany: data.company,
    });
    setActiveConversationId(conversationId);
    setIsSubmitting(false);
    toast({
      title: t("common.success"),
      description: t("outreach.messageSent"),
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/conversations")}>
          <MessageSquare className="h-4 w-4 mr-2" />{t("common.view")}
        </Button>
      ),
    });
    form.reset();
    onOpenChange(false);
  };

  const handleViewConversation = () => {
    if (existingConversation) {
      setActiveConversationId(existingConversation.id);
      navigate("/dashboard/conversations");
      onOpenChange(false);
    }
  };

  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t("suppliers.contactSupplier")} - {supplier.name}</DialogTitle>
          <DialogDescription>{t("suppliers.details.responseTime")}: {supplier.responseTime}</DialogDescription>
        </DialogHeader>

        {existingConversation && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>You have an existing conversation</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleViewConversation}>{t("common.view")}</Button>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>{t("auth.firstName")}</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>{t("auth.email")}</FormLabel><FormControl><Input type="email" placeholder="john@company.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="company" render={({ field }) => (
                <FormItem><FormLabel>{t("auth.companyName")}</FormLabel><FormControl><Input placeholder="Acme Inc." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="inquiryType" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("contact.inquiryType")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger></FormControl>
                    <SelectContent>{inquiryTypes.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="subject" render={({ field }) => (
              <FormItem><FormLabel>{t("contentStudio.subject")}</FormLabel><FormControl><Input placeholder={t("rfqCampaign.emailSubjectPlaceholder")} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="message" render={({ field }) => (
              <FormItem><FormLabel>{t("rfqCampaign.customizeMessage")}</FormLabel><FormControl><Textarea placeholder={t("rfqCampaign.customizeMessageDesc")} className="min-h-[120px] resize-none" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("common.submit")}...</> : <><Send className="h-4 w-4 mr-2" />{t("common.submit")}</>}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
