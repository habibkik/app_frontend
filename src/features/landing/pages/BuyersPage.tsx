/**
 * Buyers Landing Page
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, ImageIcon, Zap, Clock, Shield, TrendingDown, Globe, MessageSquare,
  FileText, CheckCircle2, ArrowRight, Sparkles, Bot, Moon, Sun,
} from "lucide-react";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const featureIcons = [ImageIcon, Search, TrendingDown, FileText, MessageSquare, Shield];
const aiIcons = [Moon, Zap, TrendingDown, Globe];

export default function BuyersPage() {
  const { t } = useTranslation();

  const features = Array.from({ length: 6 }, (_, i) => ({
    icon: featureIcons[i],
    title: t(`buyersPage.feat${i + 1}`),
    description: t(`buyersPage.feat${i + 1}Desc`),
  }));

  const aiFeatures = Array.from({ length: 4 }, (_, i) => ({
    icon: aiIcons[i],
    title: t(`buyersPage.ai${i + 1}`),
    description: t(`buyersPage.ai${i + 1}Desc`),
  }));

  const benefits = Array.from({ length: 6 }, (_, i) => t(`buyersPage.benefit${i + 1}`));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Bot className="h-3 w-3 mr-1" />
              {t("buyersPage.badge")}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              {t("buyersPage.heroTitle1")}
              <span className="block text-primary">{t("buyersPage.heroTitle2")}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{t("buyersPage.heroSubtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link to="/signup">{t("buyersPage.startFreeTrial")} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">{t("buyersPage.watchDemo")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <InteractiveDemo />

      {/* AI Never Sleeps */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sun className="h-6 w-6 text-amber-500" />
              <Moon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("buyersPage.aiTitle")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("buyersPage.aiSubtitle")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiFeatures.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full bg-card hover:shadow-lg transition-shadow border-primary/10">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("buyersPage.featuresTitle")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("buyersPage.featuresSubtitle")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full hover:shadow-lg transition-all hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{t("buyersPage.whyTitle")}</h2>
              <p className="text-lg text-muted-foreground mb-8">{t("buyersPage.whySubtitle")}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t("buyersPage.demoTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("buyersPage.demoSubtitle")}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: ImageIcon, text: t("buyersPage.demoStep1"), right: <CheckCircle2 className="h-4 w-4 text-primary ml-auto" /> },
                    { icon: Bot, text: t("buyersPage.demoStep2"), right: <CheckCircle2 className="h-4 w-4 text-primary ml-auto" /> },
                    { icon: Globe, text: t("buyersPage.demoStep3"), right: <CheckCircle2 className="h-4 w-4 text-primary ml-auto" /> },
                    { icon: TrendingDown, text: t("buyersPage.demoStep4"), right: <Badge variant="secondary" className="ml-auto text-xs">-23%</Badge> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-foreground">{item.text}</span>
                      {item.right}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("buyersPage.ctaTitle")}</h2>
            <p className="text-xl text-muted-foreground mb-8">{t("buyersPage.ctaSubtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link to="/signup">{t("buyersPage.getStartedFree")} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">{t("buyersPage.viewPricing")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}