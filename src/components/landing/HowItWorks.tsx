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
    <section className="py-28 bg-column relative overflow-hidden" id="how-it-works">
      <div className="container mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="column-pill mb-4">{t("howItWorks.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-column-navy mb-6 tracking-tight mt-4">
            {t("howItWorks.title")}{" "}<span className="text-column-teal">{t("howItWorks.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-column-body">{t("howItWorks.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div key={step.step} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.12 }} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-14 left-[60%] w-[80%] border-t border-dashed border-gray-300" />
              )}
              <div className="relative">
                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-md border-2 border-column-navy flex items-center justify-center bg-column">
                  <span className="text-xs font-bold text-column-navy">{step.step}</span>
                </div>
                <div className="w-24 h-24 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center mb-6">
                  <step.icon className="w-10 h-10 text-column-navy" />
                </div>
                <h3 className="text-xl font-semibold text-column-navy mb-3 tracking-tight">{step.title}</h3>
                <p className="text-column-body leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
