/**
 * Producers Landing Page
 * Showcase features and AI benefits for Producers/Manufacturers
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Factory,
  FileSpreadsheet,
  Calculator,
  Layers,
  Truck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  Moon,
  Sun,
  Zap,
  Clock,
  Cog,
  Package,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
import { ProducerInteractiveDemo } from "@/components/landing/ProducerInteractiveDemo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: FileSpreadsheet,
    title: "AI BOM Analysis",
    description: "Upload product images and get instant Bill of Materials with component costs and sourcing options.",
  },
  {
    icon: Calculator,
    title: "Cost Estimation",
    description: "Real-time cost calculations with material, labor, and overhead breakdowns.",
  },
  {
    icon: Layers,
    title: "Component Sourcing",
    description: "Find the best suppliers for each component with price comparisons across markets.",
  },
  {
    icon: ClipboardCheck,
    title: "Feasibility Analysis",
    description: "AI-powered feasibility studies for new products with risk assessment and timelines.",
  },
  {
    icon: Truck,
    title: "Supply Chain Optimization",
    description: "Optimize your supply chain with multi-source strategies and lead time predictions.",
  },
  {
    icon: BarChart3,
    title: "Go-To-Market Planning",
    description: "Strategic GTM recommendations based on market demand and competitive landscape.",
  },
];

const aiFeatures = [
  {
    title: "Instant BOM Generation",
    description: "Upload a product photo and get a complete Bill of Materials in seconds, not days.",
    icon: Zap,
  },
  {
    title: "24/7 Cost Monitoring",
    description: "AI tracks component prices globally and alerts you to savings opportunities.",
    icon: Moon,
  },
  {
    title: "Predictive Lead Times",
    description: "AI forecasts supply chain delays and suggests alternative sources proactively.",
    icon: Clock,
  },
  {
    title: "Automated Optimization",
    description: "Continuous optimization of your BOM for cost, quality, and availability.",
    icon: Cog,
  },
];

const benefits = [
  "Reduce BOM creation time by 90%",
  "Cut component costs by 25%",
  "AI-powered cost estimation",
  "Real-time supply chain insights",
  "Multi-supplier comparisons",
  "Risk assessment automation",
];

export default function ProducersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              <Factory className="h-3 w-3 mr-1" />
              AI-Powered Manufacturing
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Engineer Smarter
              <span className="block text-amber-600 dark:text-amber-400">Build Faster</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform product images into complete BOMs instantly. Let AI handle cost estimation,
              component sourcing, and feasibility analysis while you focus on innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2 bg-amber-600 hover:bg-amber-700">
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Watch Demo</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Never Sleeps Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sun className="h-6 w-6 text-amber-500" />
              <Moon className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your AI Engineering Assistant
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              While your team sleeps, AI continuously optimizes your BOMs, tracks component prices,
              and identifies supply chain risks.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
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

      {/* Interactive Demo Section */}
      <ProducerInteractiveDemo />

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Manufacture Smarter
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From concept to production—AI tools that streamline every step of your manufacturing process.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
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

      {/* Benefits Section */}
      <section className="py-20 bg-amber-500/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Producers Choose Us
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join leading manufacturers who've transformed their product development with
                AI-powered BOM management and cost optimization.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-2xl p-8 border border-amber-500/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-xl bg-amber-600 flex items-center justify-center">
                    <FileSpreadsheet className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI BOM Analysis Demo</h3>
                    <p className="text-sm text-muted-foreground">Instant results</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Components identified</span>
                    </div>
                    <Badge variant="secondary">24 parts</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Total cost estimate</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">$847.50</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Suppliers matched</span>
                    </div>
                    <Badge variant="secondary">18 sources</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Potential savings</span>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">-23%</Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your Manufacturing?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join innovative manufacturers using AI to cut costs and accelerate time-to-market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2 bg-amber-600 hover:bg-amber-700">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
