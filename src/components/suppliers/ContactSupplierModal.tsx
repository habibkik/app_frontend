import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Supplier } from "@/data/suppliers";
import { useToast } from "@/hooks/use-toast";
import { useConversations } from "@/contexts/ConversationsContext";

const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  company: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  inquiryType: z.enum(["quote", "product", "partnership", "general"], {
    required_error: "Please select an inquiry type",
  }),
  subject: z
    .string()
    .trim()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactSupplierModalProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inquiryTypes = [
  { value: "quote", label: "Request a Quote" },
  { value: "product", label: "Product Inquiry" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "general", label: "General Inquiry" },
];

export function ContactSupplierModal({
  supplier,
  open,
  onOpenChange,
}: ContactSupplierModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createConversation, setActiveConversationId, getConversationBySupplier } = useConversations();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      inquiryType: undefined,
      subject: "",
      message: "",
    },
  });

  // Check if there's an existing conversation with this supplier
  const existingConversation = supplier ? getConversationBySupplier(supplier.id) : undefined;

  const onSubmit = async (data: ContactFormValues) => {
    if (!supplier) return;
    
    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Create the conversation
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
      title: "Message Sent!",
      description: `Your inquiry has been sent to ${supplier.name}. View it in Conversations.`,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard/conversations")}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          View
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
          <DialogTitle>Contact {supplier.name}</DialogTitle>
          <DialogDescription>
            Send a message to this supplier. They typically respond within{" "}
            {supplier.responseTime}.
          </DialogDescription>
        </DialogHeader>

        {/* Existing Conversation Banner */}
        {existingConversation && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>You have an existing conversation with this supplier</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleViewConversation}>
              View Chat
            </Button>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inquiryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inquiry Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {inquiryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inquiry about your PCB assembly services"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your requirements, quantities needed, timeline, and any specific questions..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
