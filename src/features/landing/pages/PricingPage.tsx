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
import { useTranslation } from "react-i18next";

export default function PricingPage() {
  const { t } = useTranslation();

  const plans = [
    {
      nameKey: "starter",
      descKey: "starterDesc",
      price: 49,
      icon: Zap,
      color: "primary",
      popular: false,
      features: [
        { key: "feat_100analyses", included: true },
        { key: "feat_5contacts", included: true },
        { key: "feat_basicIntel", included: true },
        { key: "feat_emailSupport", included: true },
        { key: "feat_1member", included: true },
        { key: "feat_advancedAnalytics", included: false },
        { key: "feat_apiAccess", included: false },
        { key: "feat_customIntegrations", included: false },
      ],
    },
    {
      nameKey: "professional",
      descKey: "professionalDesc",
      price: 149,
      icon: Rocket,
      color: "emerald",
      popular: true,
      features: [
        { key: "feat_unlimitedAnalyses", included: true },
        { key: "feat_50contacts", included: true },
        { key: "feat_advancedIntel", included: true },
        { key: "feat_prioritySupport", included: true },
        { key: "feat_5members", included: true },
        { key: "feat_advancedAnalytics", included: true },
        { key: "feat_apiAccess", included: true },
        { key: "feat_customIntegrations", included: false },
      ],
    },
    {
      nameKey: "enterprise",
      descKey: "enterpriseDesc",
      price: null,
      icon: Building2,
      color: "amber",
      popular: false,
      features: [
        { key: "feat_unlimitedEverything", included: true },
        { key: "feat_unlimitedContacts", included: true },
        { key: "feat_whiteLabel", included: true },
        { key: "feat_dedicatedManager", included: true },
        { key: "feat_unlimitedMembers", included: true },
        { key: "feat_customModels", included: true },
        { key: "feat_fullApi", included: true },
        { key: "feat_customIntegrations", included: true },
      ],
    },
  ];

  const faqs = Array.from({ length: 6 }, (_, i) => ({
    question: t(`pricingPage.faq${i + 1}q`),
    answer: t(`pricingPage.faq${i + 1}a`),
  }));

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
              {t("pricingPage.heroTitle")}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              {t("pricingPage.heroSubtitle")}
            </p>
            <p className="text-muted-foreground">
              {t("pricingPage.heroNote")}
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
                key={plan.nameKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-emerald-600 text-white">{t("pricingPage.mostPopular")}</Badge>
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
                    <CardTitle className="text-xl">{t(`pricingPage.${plan.nameKey}`)}</CardTitle>
                    <CardDescription className="text-sm">{t(`pricingPage.${plan.descKey}`)}</CardDescription>
                    <div className="pt-4">
                      {plan.price ? (
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                          <span className="text-muted-foreground">/{t("pricingPage.month")}</span>
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-foreground">{t("pricingPage.custom")}</div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link to="/signup">
                        {plan.price ? t("pricingPage.startFreeTrial") : t("pricingPage.contactSales")}
                      </Link>
                    </Button>

                    <div className="pt-4 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature.key} className="flex items-center gap-3">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                            {t(`pricingPage.${feature.key}`)}
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
              {[
                { icon: Bot, title: t("pricingPage.aiAgents"), desc: t("pricingPage.aiAgentsDesc"), bg: "bg-primary/10", color: "text-primary" },
                { icon: Shield, title: t("pricingPage.enterpriseSecurity"), desc: t("pricingPage.enterpriseSecurityDesc"), bg: "bg-emerald-500/10", color: "text-emerald-600" },
                { icon: Headphones, title: t("pricingPage.worldClassSupport"), desc: t("pricingPage.worldClassSupportDesc"), bg: "bg-amber-500/10", color: "text-amber-600" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-6"
                >
                  <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
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
              {t("pricingPage.faqTitle")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("pricingPage.faqSubtitle")}
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
              {t("pricingPage.ctaTitle")}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("pricingPage.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link to="/signup">
                  {t("pricingPage.getStartedFree")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">{t("pricingPage.talkToSales")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}