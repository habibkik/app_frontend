import { motion } from "framer-motion";
import { Camera, Cpu, Package, Search, TrendingUp, DollarSign, Layers, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const featureKeys = [
  { icon: Camera, key: "imageIntel" },
  { icon: Cpu, key: "componentDetection" },
  { icon: Search, key: "supplierMatching" },
  { icon: Package, key: "bomGeneration" },
  { icon: TrendingUp, key: "marketIntel" },
  { icon: DollarSign, key: "pricingStrategy" },
  { icon: Layers, key: "multiMode" },
  { icon: Sparkles, key: "contentGen" },
];

const Features = () => {
  const { t } = useTranslation();

  return (
    <section className="py-28 bg-column" id="features">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="column-pill mb-4">{t("features.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-column-navy mb-6 tracking-tight mt-4">
            {t("features.title")}{" "}<span className="text-column-teal">{t("features.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-column-body">{t("features.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureKeys.map((feature, index) => (
            <motion.div key={feature.key} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }} className="column-card p-6">
              <div className="w-12 h-12 rounded-xl border border-column-card flex items-center justify-center mb-4 bg-gray-50">
                <feature.icon className="w-6 h-6 text-column-navy" />
              </div>
              <h3 className="text-base font-semibold text-column-navy mb-2">{t(`features.items.${feature.key}`)}</h3>
              <p className="text-sm text-column-body leading-relaxed">{t(`features.items.${feature.key}Desc`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
