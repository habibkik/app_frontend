import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Factory, Store } from "lucide-react";
import { HeroButton } from "@/components/ui/hero-button";

const roles = [
  {
    icon: ShoppingCart,
    title: "For Buyers",
    subtitle: "Source products globally",
    description: "Find verified suppliers, compare quotes, and manage orders from manufacturers worldwide. Our AI helps you discover the perfect match for your requirements.",
    features: ["AI-powered supplier matching", "Instant RFQ system", "Price comparison tools", "Order tracking"],
    gradient: "from-blue-600 to-blue-400",
    buttonText: "Start Sourcing",
    href: "#buyers",
  },
  {
    icon: Factory,
    title: "For Producers",
    subtitle: "Manage production & pricing",
    description: "Streamline your production workflow, set competitive pricing, and connect directly with global buyers looking for your products.",
    features: ["Production management", "Dynamic pricing tools", "Capacity planning", "Direct buyer access"],
    gradient: "from-emerald-600 to-emerald-400",
    buttonText: "List Products",
    href: "#producers",
  },
  {
    icon: Store,
    title: "For Sellers",
    subtitle: "Expand your reach",
    description: "List your products on our global marketplace, receive qualified leads, and grow your B2B sales with powerful analytics.",
    features: ["Global marketplace", "Lead management", "Sales analytics", "Inventory sync"],
    gradient: "from-amber-600 to-amber-400",
    buttonText: "Open Store",
    href: "#sellers",
  },
];

const RoleCards = () => {
  return (
    <section className="py-24 bg-muted/30" id="roles">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Choose Your Role
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Built for Every Side of{" "}
            <span className="text-gradient-accent">Global Trade</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're sourcing products, manufacturing goods, or selling 
            to businesses, we have the tools you need to succeed.
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative bg-card rounded-3xl border border-border overflow-hidden hover:shadow-xl transition-all duration-500"
            >
              {/* Gradient Header */}
              <div className={`h-2 bg-gradient-to-r ${role.gradient}`} />
              
              <div className="p-8">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground font-medium">
                    {role.subtitle}
                  </span>
                  <h3 className="text-2xl font-bold text-foreground mt-1">
                    {role.title}
                  </h3>
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {role.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${role.gradient}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a href={role.href}>
                  <HeroButton variant="secondary" className="w-full group/btn">
                    {role.buttonText}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </HeroButton>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleCards;
