import { motion } from "framer-motion";
import { Search, MessageSquare, FileCheck, Package } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Discover Suppliers",
    description: "Use our AI-powered search to find verified suppliers that match your exact product specifications and quality requirements.",
  },
  {
    step: "02",
    icon: MessageSquare,
    title: "Request Quotes",
    description: "Send detailed RFQs to multiple suppliers simultaneously. Compare pricing, MOQ, and lead times in one dashboard.",
  },
  {
    step: "03",
    icon: FileCheck,
    title: "Negotiate & Verify",
    description: "Communicate directly with suppliers, request samples, and verify credentials before committing to orders.",
  },
  {
    step: "04",
    icon: Package,
    title: "Order & Track",
    description: "Place orders securely through our platform and track production, shipping, and delivery in real-time.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden" id="how-it-works">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            From Search to{" "}
            <span className="text-gradient-primary">Delivery</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our streamlined process takes the complexity out of global trade, 
            helping you source and order with confidence.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="relative">
                {/* Step Number */}
                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">{step.step}</span>
                </div>

                {/* Icon Container */}
                <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mb-6">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
