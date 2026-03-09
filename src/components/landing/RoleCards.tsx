import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Factory, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HeroButton } from "@/components/ui/hero-button";

const roleKeys = [
  { key: "buyer", icon: ShoppingCart, href: "#buyers" },
  { key: "producer", icon: Factory, href: "#producers" },
  { key: "seller", icon: Store, href: "#sellers" },
];

const RoleCards = () => {
  const { t } = useTranslation();

  return (
    <section className="py-28 bg-column" id="roles">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="column-pill mb-4">{t("roleCards.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-column-navy mb-6 tracking-tight mt-4">
            {t("roleCards.title")}{" "}<span className="text-column-teal">{t("roleCards.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-column-body">{t("roleCards.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roleKeys.map((role, index) => {
            const features = t(`roleCards.${role.key}.features`, { returnObjects: true }) as string[];
            return (
              <motion.div key={role.key} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.12 }} className="column-card overflow-hidden">
                <div className="p-8">
                  <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center mb-6">
                    <role.icon className="w-7 h-7 text-column-navy" />
                  </div>
                  <div className="mb-6">
                    <span className="text-xs text-column-muted font-medium uppercase tracking-wider">{t(`roleCards.${role.key}.subtitle`)}</span>
                    <h3 className="text-2xl font-bold text-column-navy mt-1 tracking-tight">{t(`roleCards.${role.key}.title`)}</h3>
                  </div>
                  <p className="text-column-body mb-6 leading-relaxed">{t(`roleCards.${role.key}.description`)}</p>
                  <ul className="space-y-3 mb-8">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-column-navy">
                        <span className="w-1.5 h-1.5 rounded-full bg-column-teal flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a href={role.href}>
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-column-navy/20 text-column-navy font-semibold text-sm hover:bg-gray-50 transition-all duration-200 group">
                      {t(`roleCards.${role.key}.button`)}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RoleCards;
