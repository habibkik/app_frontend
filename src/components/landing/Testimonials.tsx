import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "TradePlatform cut our supplier discovery time by 70%. The AI matching is incredibly accurate and the verified supplier network gives us confidence in every order.",
    author: "Sarah Chen",
    role: "Head of Procurement",
    company: "TechCorp Industries",
    avatar: "SC",
    rating: 5,
  },
  {
    quote: "As a manufacturer, getting direct access to qualified buyers has transformed our business. We've increased our export volume by 3x in just 6 months.",
    author: "Marco Rodriguez",
    role: "CEO",
    company: "Rodriguez Manufacturing",
    avatar: "MR",
    rating: 5,
  },
  {
    quote: "The RFQ system is brilliant. I can compare quotes from 10+ suppliers in minutes instead of spending weeks on emails and calls.",
    author: "Priya Sharma",
    role: "Supply Chain Manager",
    company: "Global Retail Co",
    avatar: "PS",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-muted/30" id="testimonials">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Trusted by{" "}
            <span className="text-gradient-accent">Industry Leaders</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See how businesses around the world are transforming their trade 
            operations with our platform.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-card rounded-2xl p-8 border border-border relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Quote className="w-4 h-4 text-primary-foreground" />
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-4 mt-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground/80 leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
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
