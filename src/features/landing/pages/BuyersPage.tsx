/**
 * Buyers Landing Page
 * Showcase features and AI benefits for Buyers
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  ImageIcon,
  Zap,
  Clock,
  Shield,
  TrendingDown,
  Globe,
  MessageSquare,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  Moon,
  Sun,
} from "lucide-react";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: ImageIcon,
    title: "AI Image Analysis",
    description: "Upload any product image and instantly discover matching suppliers worldwide with pricing and MOQ details.",
  },
  {
    icon: Search,
    title: "Smart Supplier Discovery",
    description: "Find verified suppliers across 50+ countries with real-time availability and quality ratings.",
  },
  {
    icon: TrendingDown,
    title: "Price Comparison",
    description: "Compare prices from multiple suppliers at once. Get substitute product recommendations for better deals.",
  },
  {
    icon: FileText,
    title: "Automated RFQs",
    description: "Generate and send professional RFQs to multiple suppliers with a single click.",
  },
  {
    icon: MessageSquare,
    title: "Centralized Communication",
    description: "Manage all supplier conversations in one place with real-time translation support.",
  },
  {
    icon: Shield,
    title: "Verified Suppliers",
    description: "Access our vetted network of manufacturers with quality certifications and trade assurance.",
  },
];

const aiFeatures = [
  {
    title: "Works While You Sleep",
    description: "Our AI agents continuously monitor supplier prices, track shipments, and alert you to opportunities 24/7.",
    icon: Moon,
  },
  {
    title: "Instant Analysis",
    description: "Get detailed product specifications, market pricing, and supplier recommendations in seconds, not hours.",
    icon: Zap,
  },
  {
    title: "Never Misses a Deal",
    description: "AI monitors price changes across thousands of suppliers, alerting you when prices drop.",
    icon: TrendingDown,
  },
  {
    title: "Global Intelligence",
    description: "Analyze suppliers from China, India, Vietnam, Europe, and North America simultaneously.",
    icon: Globe,
  },
];

const benefits = [
  "Reduce sourcing time by 80%",
  "Access 100,000+ verified suppliers",
  "Real-time price monitoring",
  "Automated quote comparisons",
  "Quality-assured manufacturers",
  "Multi-language support",
];

export default function BuyersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Bot className="h-3 w-3 mr-1" />
              AI-Powered Sourcing
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Find Perfect Suppliers
              <span className="block text-primary">While You Sleep</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload a product image and let our AI discover the best suppliers, compare prices,
              and handle negotiations—all automatically, 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
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
              <Moon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              AI That Never Sleeps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI agents work around the clock, across every timezone, ensuring you never miss
              an opportunity or waste time on manual research.
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Source Smarter
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to streamline your procurement process from discovery to delivery.
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

      {/* Benefits Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Buyers Choose Us
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of procurement professionals who've transformed their sourcing
                operations with AI-powered automation.
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
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
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
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI Analysis Demo</h3>
                    <p className="text-sm text-muted-foreground">See it in action</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">Upload product image</span>
                    <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Bot className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">AI identifies product specs</span>
                    <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">15 suppliers found</span>
                    <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <TrendingDown className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">Best price: $45.20/unit</span>
                    <Badge variant="secondary" className="ml-auto text-xs">-23%</Badge>
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
              Ready to Transform Your Sourcing?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 10,000+ buyers who source smarter with AI. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
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
