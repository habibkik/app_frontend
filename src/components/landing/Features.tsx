import { motion } from "framer-motion";
import { 
  Search, 
  TrendingUp, 
  Shield, 
  Globe, 
  Zap, 
  Users,
  BarChart3,
  MessageSquare
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Supplier Discovery",
    description: "AI-powered matching finds verified suppliers that meet your exact specifications across 180+ countries.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Pricing",
    description: "Get instant quotes and market intelligence to negotiate better deals with confidence.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Shield,
    title: "Verified & Secure",
    description: "Every supplier is thoroughly vetted. Trade with confidence backed by our protection guarantee.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Access manufacturers and suppliers from every major trade zone worldwide.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: Zap,
    title: "Instant RFQs",
    description: "Send requests for quotes to multiple suppliers simultaneously and get responses in hours, not days.",
    color: "bg-rose-500/10 text-rose-500",
  },
  {
    icon: Users,
    title: "Collaborative Tools",
    description: "Work with your team to evaluate suppliers, compare quotes, and make decisions together.",
    color: "bg-cyan-500/10 text-cyan-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track your sourcing performance, monitor supplier metrics, and optimize your supply chain.",
    color: "bg-indigo-500/10 text-indigo-500",
  },
  {
    icon: MessageSquare,
    title: "Integrated Messaging",
    description: "Communicate directly with suppliers in real-time with built-in translation and document sharing.",
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
            Platform Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="text-gradient-primary">Trade Globally</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From supplier discovery to order management, our platform provides 
            end-to-end tools for modern B2B trade.
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
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300"
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
