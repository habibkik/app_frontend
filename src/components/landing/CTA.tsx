import { motion } from "framer-motion";
import { Upload, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeroButton } from "@/components/ui/hero-button";

const CTA = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-28 bg-gradient-hero relative overflow-hidden">
      <div className="container mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            <span className="column-pill-light mb-8 inline-flex">
              <Sparkles className="w-3 h-3" />
              {t("cta.badge")}
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight mt-4">
            {t("cta.title1")}{" "}
            <span className="text-column-teal">{t("cta.title2")}</span>
          </h2>

          <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto">{t("cta.subtitle")}</p>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <HeroButton variant="columnPrimary" size="lg" onClick={() => navigate("/dashboard")}>
              <Upload className="w-5 h-5" /> {t("cta.uploadBtn")}
            </HeroButton>
            <HeroButton variant="columnOutline" size="lg" onClick={() => { document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" }); }}>
              <Sparkles className="w-5 h-5" /> {t("cta.howItWorks")}
            </HeroButton>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-8 text-sm text-white/40">
            {t("cta.trustText")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
