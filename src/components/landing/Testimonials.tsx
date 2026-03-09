import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const testimonialData = [
  { quoteKey: "quote1", roleKey: "role1", author: "Sarah Chen", company: "TechCorp Industries", avatar: "SC", rating: 5 },
  { quoteKey: "quote2", roleKey: "role2", author: "Marco Rodriguez", company: "Rodriguez Manufacturing", avatar: "MR", rating: 5 },
  { quoteKey: "quote3", roleKey: "role3", author: "Priya Sharma", company: "Global Retail Co", avatar: "PS", rating: 5 },
];

const Testimonials = () => {
  const { t } = useTranslation();

  return (
    <section className="py-28 bg-column" id="testimonials">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="column-pill mb-4">{t("testimonials.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-column-navy mb-6 tracking-tight mt-4">
            {t("testimonials.title")}{" "}<span className="text-column-teal">{t("testimonials.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-column-body">{t("testimonials.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialData.map((testimonial, index) => (
            <motion.div key={testimonial.author} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.12 }} className="column-card p-8 relative">
              {/* Large decorative quote mark */}
              <span className="absolute top-6 left-8 text-6xl font-serif text-gray-200 leading-none select-none">"</span>
              <div className="flex items-center gap-1 mb-4 mt-8">
                {Array.from({ length: testimonial.rating }).map((_, i) => (<Star key={i} className="w-4 h-4 fill-warning text-warning" />))}
              </div>
              <p className="text-column-navy leading-relaxed mb-6 text-base">"{t(`testimonials.items.${testimonial.quoteKey}`)}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-column-navy">{testimonial.avatar}</span>
                </div>
                <div>
                  <div className="font-semibold text-column-navy">{testimonial.author}</div>
                  <div className="text-sm text-column-muted">{t(`testimonials.items.${testimonial.roleKey}`)} at {testimonial.company}</div>
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
