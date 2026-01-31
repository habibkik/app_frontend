import { motion } from "framer-motion";
import { Upload, Sparkles, BarChart3, Rocket } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Any Product",
    description: "Simply drop a product image — a photo from your phone, a supplier catalog, or any product you want to analyze.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "AI Analyzes Everything",
    description: "Our AI instantly identifies components, materials, costs, suppliers, and market data from your image.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Get Mode-Specific Insights",
    description: "Choose your goal: Find suppliers (Buyer), generate BOM (Producer), or analyze market (Seller).",
  },
  {
    step: "04",
    icon: Rocket,
    title: "Take Action",
    description: "Request quotes, source components, or launch products — all from a single image upload.",
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
            Image to{" "}
            <span className="text-gradient-primary">Intelligence</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            One image unlocks everything you need — suppliers, costs, components, 
            market data, and more. No forms, no catalogs, just snap and go.
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
