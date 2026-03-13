/**
 * Producers Landing Page
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Factory, FileSpreadsheet, Calculator, Layers, Truck, CheckCircle2, ArrowRight,
  Sparkles, Bot, Moon, Sun, Zap, Clock, Cog, Package, BarChart3, ClipboardCheck,
} from "lucide-react";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
import { ProducerInteractiveDemo } from "@/components/landing/ProducerInteractiveDemo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const featureIcons = [FileSpreadsheet, Calculator, Layers, ClipboardCheck, Truck, BarChart3];
const aiIcons = [Zap, Moon, Clock, Cog];

export default function ProducersPage() {
  const { t } = useTranslation();

  const features = Array.from({ length: 6 }, (_, i) => ({
    icon: featureIcons[i],
    title: t(`producersPage.feat${i + 1}`),
    description: t(`producersPage.feat${i + 1}Desc`),
  }));

  const aiFeatures = Array.from({ length: 4 }, (_, i) => ({
    icon: aiIcons[i],
    title: t(`producersPage.ai${i + 1}`),
    description: t(`producersPage.ai${i + 1}Desc`),
  }));

  const benefits = Array.from({ length: 6 }, (_, i) => t(`producersPage.benefit${i + 1}`));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              <Factory className="h-3 w-3 mr-1" />
              {t("producersPage.badge")}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              {t("producersPage.heroTitle1")}
              <span className="block text-amber-600 dark:text-amber-400">{t("producersPage.heroTitle2")}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{t("producersPage.heroSubtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2 bg-amber-600 hover:bg-amber-700">
                <Link to="/signup">{t("producersPage.startFreeTrial")} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">{t("producersPage.watchDemo")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sun className="h-6 w-6 text-amber-500" />
              <Moon className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("producersPage.aiTitle")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("producersPage.aiSubtitle")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiFeatures.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full bg-card hover:shadow-lg transition-shadow border-amber-500/10">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
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

      <ProducerInteractiveDemo />

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("producersPage.featuresTitle")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("producersPage.featuresSubtitle")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full hover:shadow-lg transition-all hover:border-amber-500/30">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
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
      <section className="py-20 bg-amber-500/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{t("producersPage.whyTitle")}</h2>
              <p className="text-lg text-muted-foreground mb-8">{t("producersPage.whySubtitle")}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-2xl p-8 border border-amber-500/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-xl bg-amber-600 flex items-center justify-center">
                    <FileSpreadsheet className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t("producersPage.demoTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("producersPage.demoSubtitle")}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{t("producersPage.demoRow1")}</span>
                    </div>
                    <Badge variant="secondary">{t("producersPage.demoRow1Val")}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{t("producersPage.demoRow2")}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t("producersPage.demoRow2Val")}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{t("producersPage.demoRow3")}</span>
                    </div>
                    <Badge variant="secondary">{t("producersPage.demoRow3Val")}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{t("producersPage.demoRow4")}</span>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">-23%</Badge>
                  </div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("producersPage.ctaTitle")}</h2>
            <p className="text-xl text-muted-foreground mb-8">{t("producersPage.ctaSubtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2 bg-amber-600 hover:bg-amber-700">
                <Link to="/signup">{t("producersPage.getStartedFree")} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">{t("producersPage.viewPricing")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}