import { motion } from "framer-motion";
import { Camera, Cpu, Package, Search, TrendingUp, DollarSign, Layers, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const featureKeys = [
  { icon: Camera, key: "imageIntel", color: "bg-primary/10 text-primary" },
  { icon: Cpu, key: "componentDetection", color: "bg-amber-500/10 text-amber-500" },
  { icon: Search, key: "supplierMatching", color: "bg-blue-500/10 text-blue-500" },
  { icon: Package, key: "bomGeneration", color: "bg-emerald-500/10 text-emerald-500" },
  { icon: TrendingUp, key: "marketIntel", color: "bg-purple-500/10 text-purple-500" },
  { icon: DollarSign, key: "pricingStrategy", color: "bg-rose-500/10 text-rose-500" },
  { icon: Layers, key: "multiMode", color: "bg-cyan-500/10 text-cyan-500" },
  { icon: Sparkles, key: "contentGen", color: "bg-orange-500/10 text-orange-500" },
];

const Features = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-background" id="features">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">{t("features.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t("features.title")}{" "}<span className="text-gradient-primary">{t("features.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground">{t("features.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureKeys.map((feature, index) => (
            <motion.div key={feature.key} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t(`features.items.${feature.key}`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`features.items.${feature.key}Desc`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;