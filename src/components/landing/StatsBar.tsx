import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const StatsBar = () => {
  const { t } = useTranslation();

  const stats = [
    { value: "$2.5B+", label: t("hero.stats.tradeVolume") },
    { value: "50K+", label: t("hero.stats.suppliers") },
    { value: "99.2%", label: t("hero.stats.accuracy") },
    { value: "<2s", label: t("hero.stats.analysisTime") },
  ];

  return (
    <section className="py-20 bg-column">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex items-center">
                <div className="text-center px-8 py-4">
                  <div className="text-3xl md:text-5xl font-bold text-column-teal tracking-tight">{stat.value}</div>
                  <div className="text-sm text-column-muted mt-1">{stat.label}</div>
                </div>
                {index < stats.length - 1 && (
                  <div className="hidden md:block w-px h-12 bg-gray-300/50" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsBar;
