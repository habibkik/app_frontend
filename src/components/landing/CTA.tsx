import { motion } from "framer-motion";
import { ArrowRight, Upload, Camera, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeroButton } from "@/components/ui/hero-button";

const CTA = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-8">
            <Camera className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground/90">{t("cta.badge")}</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            {t("cta.title1")}{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{t("cta.title2")}</span>
          </h2>

          <p className="text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto">{t("cta.subtitle")}</p>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <HeroButton variant="accent" size="lg" onClick={() => navigate("/dashboard")}>
              <Upload className="w-5 h-5" /> {t("cta.uploadBtn")}
            </HeroButton>
            <HeroButton variant="outline" size="lg" onClick={() => { document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" }); }}>
              <Sparkles className="w-5 h-5" /> {t("cta.howItWorks")}
            </HeroButton>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-8 text-sm text-primary-foreground/50">
            {t("cta.trustText")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;