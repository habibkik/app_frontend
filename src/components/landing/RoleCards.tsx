import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const roleKeys = ["buyer", "producer", "seller"] as const;

const tabLabels: Record<string, string> = {
  buyer: "Pour les acheteurs",
  producer: "Pour les producteurs",
  seller: "Pour les vendeurs",
};

const featureIcons: Record<string, { icon: string; label: string }[]> = {
  buyer: [
    { icon: "🔍", label: "Correspondance fournisseurs par IA" },
    { icon: "💬", label: "Système de devis instantané" },
    { icon: "📊", label: "Outils de comparaison de prix" },
    { icon: "📦", label: "Suivi des commandes" },
  ],
  producer: [
    { icon: "⚙️", label: "Planification de production" },
    { icon: "📋", label: "Génération de nomenclature" },
    { icon: "💹", label: "Optimisation des coûts" },
    { icon: "🌍", label: "Conformité export" },
  ],
  seller: [
    { icon: "🛍️", label: "Gestion des commandes" },
    { icon: "📈", label: "Analyse des ventes" },
    { icon: "🔄", label: "Synchronisation inventaire" },
    { icon: "⭐", label: "Gestion des avis" },
  ],
};

const scrollRows: Record<string, { icon: string; label: string; value: string }[]> = {
  buyer: [
    { icon: "🏭", label: "Fournisseur vérifié", value: "+3 devis" },
    { icon: "📦", label: "Commande confirmée", value: "$2,340.00" },
    { icon: "🔍", label: "Analyse IA terminée", value: "<2 secondes" },
    { icon: "✅", label: "Correspondance trouvée", value: "99.2% match" },
    { icon: "💰", label: "Devis comparé", value: "-18% prix" },
    { icon: "🚚", label: "Livraison planifiée", value: "J+14" },
  ],
  producer: [
    { icon: "⚙️", label: "Production planifiée", value: "500 unités" },
    { icon: "📊", label: "Coût optimisé", value: "-12%" },
    { icon: "🛒", label: "Acheteur connecté", value: "Paris, FR" },
    { icon: "📋", label: "Nomenclature générée", value: "48 composants" },
    { icon: "💹", label: "Prix dynamique", value: "+8% marge" },
    { icon: "🌍", label: "Export validé", value: "180 pays" },
  ],
  seller: [
    { icon: "🛍️", label: "Nouvelle commande", value: "$5,200.00" },
    { icon: "👤", label: "Prospect qualifié", value: "TechCorp" },
    { icon: "📈", label: "Ventes ce mois", value: "+34%" },
    { icon: "🔄", label: "Inventaire synchronisé", value: "Auto" },
    { icon: "💬", label: "Message acheteur", value: "En attente" },
    { icon: "⭐", label: "Avis reçu", value: "5 étoiles" },
  ],
};

const RoleCards = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState<string>("buyer");

  return (
    <section className="py-28 bg-column" id="roles">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="column-pill mb-4">{t("roleCards.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-column-navy mb-6 tracking-tight mt-4">
            {t("roleCards.title")}{" "}
            <span className="text-column-teal">{t("roleCards.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-column-body">{t("roleCards.subtitle")}</p>
        </motion.div>

        {/* Tabbed card */}
        <div
          className="bg-column-card max-w-5xl mx-auto overflow-hidden"
          style={{
            borderRadius: 16,
            boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
          }}
        >
          {/* Tab bar */}
          <div className="flex items-center gap-2 p-4 border-b border-border">
            {roleKeys.map((key) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  active === key
                    ? "bg-column-navy text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tabLabels[key]}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[420px]">
            {/* Left column */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`left-${active}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="p-8 flex flex-col justify-center"
              >
                <span className="text-xs text-column-muted font-medium uppercase tracking-wider">
                  {t(`roleCards.${active}.subtitle`)}
                </span>
                <h3 className="text-2xl font-bold text-column-navy mt-1 mb-6 tracking-tight">
                  {t(`roleCards.${active}.title`)}
                </h3>

                <div className="space-y-3 mb-6">
                  {featureIcons[active].map((f) => (
                    <div key={f.label} className="flex items-center gap-3 text-sm text-column-navy">
                      <span className="text-base">{f.icon}</span>
                      {f.label}
                    </div>
                  ))}
                </div>

                <div className="relative pl-6 mb-6">
                  <span className="absolute left-0 top-0 text-4xl text-column-muted leading-none select-none">
                    "
                  </span>
                  <p className="text-column-body text-sm leading-relaxed">
                    {t(`roleCards.${active}.description`)}
                  </p>
                </div>

                <a href={`#${active}s`}>
                  <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-column-navy/20 text-column-navy font-semibold text-sm hover:bg-muted transition-all duration-200 group">
                    {t(`roleCards.${active}.button`)}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </a>
              </motion.div>
            </AnimatePresence>

            {/* Right column — scrolling rows */}
            <div className="p-8 flex items-center">
              <div
                className="w-full overflow-hidden rounded-xl"
                style={{
                  height: 320,
                  maskImage:
                    "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
                }}
              >
                <div key={active} className="scroll-track flex flex-col gap-3">
                  {[0, 1].map((set) =>
                    scrollRows[active].map((row, i) => (
                      <div
                        key={`${set}-${i}`}
                        className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3"
                      >
                        <span className="text-lg shrink-0">{row.icon}</span>
                        <span className="text-sm text-muted-foreground flex-1">
                          {row.label}
                        </span>
                        <span className="text-sm font-bold text-column-navy whitespace-nowrap">
                          {row.value}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleCards;
