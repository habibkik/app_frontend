import { motion } from "framer-motion";
import { ArrowRight, Upload, Camera, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HeroButton } from "@/components/ui/hero-button";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-8"
          >
            <Camera className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground/90">
              Start with a Single Image
            </span>
          </motion.div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            Snap a Photo.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Unlock Insights.
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
            No complex forms. No product catalogs. Just upload an image 
            and let AI do the rest — suppliers, costs, market data, all in seconds.
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <HeroButton 
              variant="accent" 
              size="lg"
              onClick={() => navigate("/dashboard")}
            >
              <Upload className="w-5 h-5" />
              Upload Your First Image
            </HeroButton>
            <HeroButton 
              variant="outline" 
              size="lg"
              onClick={() => {
                // Scroll to demo section
                document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Sparkles className="w-5 h-5" />
              See How It Works
            </HeroButton>
          </motion.div>

          {/* Trust Text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-sm text-primary-foreground/50"
          >
            No signup required • Instant results • 100% free to try
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
