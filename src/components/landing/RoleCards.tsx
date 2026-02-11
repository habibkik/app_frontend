import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Factory, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HeroButton } from "@/components/ui/hero-button";

const roleKeys = [
  { key: "buyer", icon: ShoppingCart, gradient: "from-blue-600 to-blue-400", href: "#buyers" },
  { key: "producer", icon: Factory, gradient: "from-emerald-600 to-emerald-400", href: "#producers" },
  { key: "seller", icon: Store, gradient: "from-amber-600 to-amber-400", href: "#sellers" },
];

const RoleCards = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-muted/30" id="roles">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">{t("roleCards.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t("roleCards.title")}{" "}<span className="text-gradient-accent">{t("roleCards.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground">{t("roleCards.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roleKeys.map((role, index) => {
            const features = t(`roleCards.${role.key}.features`, { returnObjects: true }) as string[];
            return (
              <motion.div key={role.key} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.15 }} className="group relative bg-card rounded-3xl border border-border overflow-hidden hover:shadow-xl transition-all duration-500">
                <div className={`h-2 bg-gradient-to-r ${role.gradient}`} />
                <div className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <role.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="mb-6">
                    <span className="text-sm text-muted-foreground font-medium">{t(`roleCards.${role.key}.subtitle`)}</span>
                    <h3 className="text-2xl font-bold text-foreground mt-1">{t(`roleCards.${role.key}.title`)}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{t(`roleCards.${role.key}.description`)}</p>
                  <ul className="space-y-3 mb-8">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${role.gradient}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a href={role.href}>
                    <HeroButton variant="secondary" className="w-full group/btn">
                      {t(`roleCards.${role.key}.button`)}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </HeroButton>
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