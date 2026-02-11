import { motion } from "framer-motion";
import { Upload, Sparkles, BarChart3, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";

const stepIcons = [Upload, Sparkles, BarChart3, Rocket];
const stepNums = ["01", "02", "03", "04"];

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = stepNums.map((num, i) => ({
    step: num,
    icon: stepIcons[i],
    title: t(`howItWorks.steps.step${i + 1}Title`),
    description: t(`howItWorks.steps.step${i + 1}Desc`),
  }));

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="how-it-works">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(hsl(var(--primary)) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      </div>

      <div className="container mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">{t("howItWorks.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t("howItWorks.title")}{" "}<span className="text-gradient-primary">{t("howItWorks.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground">{t("howItWorks.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div key={step.step} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.15 }} className="relative">
              {index < steps.length - 1 && (<div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />)}
              <div className="relative">
                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">{step.step}</span>
                </div>
                <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mb-6">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;