import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

const testimonialData = [
  { quoteKey: "quote1", roleKey: "role1", author: "Sarah Chen", company: "TechCorp Industries", avatar: "SC", rating: 5 },
  { quoteKey: "quote2", roleKey: "role2", author: "Marco Rodriguez", company: "Rodriguez Manufacturing", avatar: "MR", rating: 5 },
  { quoteKey: "quote3", roleKey: "role3", author: "Priya Sharma", company: "Global Retail Co", avatar: "PS", rating: 5 },
];

const Testimonials = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-muted/30" id="testimonials">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">{t("testimonials.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t("testimonials.title")}{" "}<span className="text-gradient-accent">{t("testimonials.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground">{t("testimonials.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialData.map((testimonial, index) => (
            <motion.div key={testimonial.author} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.15 }} className="bg-card rounded-2xl p-8 border border-border relative">
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Quote className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-1 mb-4 mt-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (<Star key={i} className="w-4 h-4 fill-warning text-warning" />))}
              </div>
              <p className="text-foreground/80 leading-relaxed mb-6">"{t(`testimonials.items.${testimonial.quoteKey}`)}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{testimonial.avatar}</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{t(`testimonials.items.${testimonial.roleKey}`)} at {testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;