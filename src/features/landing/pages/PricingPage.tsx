/**
 * Pricing Landing Page
 * Show pricing plans and features
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Check,
  X,
  Zap,
  Building2,
  Rocket,
  ArrowRight,
  HelpCircle,
  Bot,
  Moon,
  Sun,
  Shield,
  Headphones,
} from "lucide-react";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const plans = [
  {
    name: "Starter",
    description: "Perfect for individuals and small teams getting started",
    price: 49,
    period: "month",
    icon: Zap,
    color: "primary",
    popular: false,
    features: [
      { name: "Up to 100 AI analyses/month", included: true },
      { name: "5 supplier contacts/month", included: true },
      { name: "Basic market intelligence", included: true },
      { name: "Email support", included: true },
      { name: "1 team member", included: true },
      { name: "Advanced analytics", included: false },
      { name: "API access", included: false },
      { name: "Custom integrations", included: false },
    ],
  },
  {
    name: "Professional",
    description: "For growing businesses that need more power",
    price: 149,
    period: "month",
    icon: Rocket,
    color: "emerald",
    popular: true,
    features: [
      { name: "Unlimited AI analyses", included: true },
      { name: "50 supplier contacts/month", included: true },
      { name: "Advanced market intelligence", included: true },
      { name: "Priority support", included: true },
      { name: "Up to 5 team members", included: true },
      { name: "Advanced analytics", included: true },
      { name: "API access", included: true },
      { name: "Custom integrations", included: false },
    ],
  },
  {
    name: "Enterprise",
    description: "For large organizations with custom requirements",
    price: null,
    period: "month",
    icon: Building2,
    color: "amber",
    popular: false,
    features: [
      { name: "Unlimited everything", included: true },
      { name: "Unlimited supplier contacts", included: true },
      { name: "White-label options", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Unlimited team members", included: true },
      { name: "Custom AI models", included: true },
      { name: "Full API access", included: true },
      { name: "Custom integrations", included: true },
    ],
  },
];

const faqs = [
  {
    question: "What does 'AI that never sleeps' mean?",
    answer: "Our AI agents work 24/7 to monitor markets, track competitor prices, analyze supplier changes, and alert you to opportunities—even while you're asleep. This means you never miss a deal or get caught off-guard by market changes.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the next billing cycle.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, we offer a 14-day free trial on all plans. No credit card required to start. You'll have full access to all features during the trial period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans. All payments are processed securely through Stripe.",
  },
  {
    question: "How does the AI analysis work?",
    answer: "Simply upload a product image, and our AI will identify the product, find matching suppliers, compare prices, suggest alternatives, and provide market insights—all in seconds. The AI uses advanced vision models and is trained on millions of B2B products.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our service for any reason, contact our support team for a full refund.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sun className="h-5 w-5 text-amber-500" />
              <Moon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              AI That Works While You Sleep
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Simple, transparent pricing for powerful AI-driven B2B intelligence.
            </p>
            <p className="text-muted-foreground">
              All plans include our 24/7 AI agents that never stop working for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-emerald-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <Card className={`h-full ${plan.popular ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`h-12 w-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                      plan.color === 'primary' ? 'bg-primary/10' :
                      plan.color === 'emerald' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                    }`}>
                      <plan.icon className={`h-6 w-6 ${
                        plan.color === 'primary' ? 'text-primary' :
                        plan.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="pt-4">
                      {plan.price ? (
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                          <span className="text-muted-foreground">/{plan.period}</span>
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-foreground">Custom</div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className={`w-full ${
                        plan.popular ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link to="/signup">
                        {plan.price ? 'Start Free Trial' : 'Contact Sales'}
                      </Link>
                    </Button>

                    <div className="pt-4 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature.name} className="flex items-center gap-3">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Benefits Banner */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">24/7 AI Agents</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI works around the clock, monitoring markets and finding opportunities while you sleep.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center p-6"
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Enterprise Security</h3>
                <p className="text-sm text-muted-foreground">
                  Bank-level encryption, SOC 2 compliance, and GDPR-ready data protection on all plans.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center p-6"
              >
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">World-Class Support</h3>
                <p className="text-sm text-muted-foreground">
                  Expert support team ready to help you succeed, with priority response for paid plans.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions? We've got answers. If you can't find what you're looking for,
              feel free to contact our support team.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AccordionItem value={`item-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-8">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start Your Free 14-Day Trial
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              No credit card required. Full access to all features. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Talk to Sales</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
