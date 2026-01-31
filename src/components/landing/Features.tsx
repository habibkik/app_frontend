import { motion } from "framer-motion";
import { 
  Camera, 
  Cpu, 
  Package, 
  Search, 
  TrendingUp, 
  DollarSign,
  Layers,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Image-First Intelligence",
    description: "Upload any product image and let AI extract components, specs, suppliers, and market data instantly.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Cpu,
    title: "AI Component Detection",
    description: "Automatically identify materials, parts, and manufacturing requirements from product photos.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: Search,
    title: "Smart Supplier Matching",
    description: "AI matches your product to verified suppliers worldwide based on image analysis.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Package,
    title: "Instant BOM Generation",
    description: "Generate complete Bill of Materials with cost estimates from a single product image.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: TrendingUp,
    title: "Market Intelligence",
    description: "Analyze competitors, market pricing, and demand trends for any product you photograph.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: DollarSign,
    title: "Pricing Strategy",
    description: "Get AI-recommended pricing with margin scenarios based on real market data.",
    color: "bg-rose-500/10 text-rose-500",
  },
  {
    icon: Layers,
    title: "Multi-Mode Analysis",
    description: "Same image, different insights. Switch between Buyer, Producer, and Seller views.",
    color: "bg-cyan-500/10 text-cyan-500",
  },
  {
    icon: Sparkles,
    title: "Content Generation",
    description: "Auto-generate product descriptions, social posts, and marketing copy from your analysis.",
    color: "bg-orange-500/10 text-orange-500",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background" id="features">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            AI-Powered Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            One Image Unlocks{" "}
            <span className="text-gradient-primary">Everything</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From component identification to market analysis — our AI transforms 
            any product image into actionable trade intelligence.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
