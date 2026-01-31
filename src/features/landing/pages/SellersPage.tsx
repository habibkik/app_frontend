/**
 * Sellers Landing Page
 * Showcase features and AI benefits for Sellers
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  BarChart3,
  Target,
  DollarSign,
  Eye,
  Megaphone,
  Globe,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  Moon,
  Sun,
  LineChart,
  Users,
  Bell,
} from "lucide-react";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
import { SellerInteractiveDemo } from "@/components/landing/SellerInteractiveDemo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: BarChart3,
    title: "Market Intelligence",
    description: "Get real-time insights on market trends, demand patterns, and competitive positioning.",
  },
  {
    icon: Eye,
    title: "Competitor Tracking",
    description: "Monitor competitor pricing, products, and strategies with automated AI analysis.",
  },
  {
    icon: DollarSign,
    title: "Dynamic Pricing",
    description: "AI-optimized pricing recommendations based on market conditions and competition.",
  },
  {
    icon: Target,
    title: "Buyer Intent Signals",
    description: "Identify high-intent buyers and optimize your outreach for maximum conversion.",
  },
  {
    icon: Megaphone,
    title: "Campaign Automation",
    description: "Launch and manage marketing campaigns with AI-driven targeting and optimization.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Expand into new markets with localized content and multi-currency support.",
  },
];

const aiFeatures = [
  {
    title: "24/7 Market Monitoring",
    description: "AI tracks competitor prices, market trends, and buyer behavior around the clock.",
    icon: Moon,
  },
  {
    title: "Instant Competitive Intel",
    description: "Get detailed competitor analysis in seconds—pricing, products, strengths, and weaknesses.",
    icon: Zap,
  },
  {
    title: "Never Miss an Opportunity",
    description: "Automated alerts when buyers show interest or competitors change strategies.",
    icon: Bell,
  },
  {
    title: "Predictive Analytics",
    description: "AI forecasts demand trends and optimal pricing windows for maximum profit.",
    icon: LineChart,
  },
];

const benefits = [
  "Increase revenue by 35%",
  "Real-time competitor tracking",
  "AI-powered pricing optimization",
  "Automated market research",
  "Lead scoring and prioritization",
  "Campaign performance analytics",
];

export default function SellersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              <TrendingUp className="h-3 w-3 mr-1" />
              AI-Powered Sales
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Outsmart Competition
              <span className="block text-emerald-600 dark:text-emerald-400">While They Sleep</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Let AI monitor your market, track competitors, and optimize pricing 24/7.
              Close more deals while your competition catches up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
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
              <Moon className="h-6 w-6 text-emerald-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your AI Sales Team That Never Sleeps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              While competitors rely on manual research, your AI agents work 24/7 to find
              opportunities and optimize your market position.
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
                <Card className="h-full bg-card hover:shadow-lg transition-shadow border-emerald-500/10">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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
      <SellerInteractiveDemo />

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
              Everything You Need to Sell Smarter
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools to understand your market, outprice competitors, and close more deals.
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
                <Card className="h-full hover:shadow-lg transition-all hover:border-emerald-500/30">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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
      <section className="py-20 bg-emerald-500/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Sellers Choose Us
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of sellers who've increased revenue and market share with
                AI-powered competitive intelligence.
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
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
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
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl p-8 border border-emerald-500/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Market Intelligence Demo</h3>
                    <p className="text-sm text-muted-foreground">Real-time insights</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <span className="text-sm text-foreground">Competitor A dropped prices</span>
                    <Badge variant="secondary" className="bg-red-500/10 text-red-600">-12%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <span className="text-sm text-foreground">Demand surge detected</span>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">+45%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <span className="text-sm text-foreground">Optimal price recommendation</span>
                    <span className="text-sm font-semibold text-emerald-600">$156.00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <span className="text-sm text-foreground">High-intent buyers found</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">23 leads</Badge>
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
              Ready to Dominate Your Market?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 5,000+ sellers who've boosted revenue with AI-powered intelligence. Start free today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
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
