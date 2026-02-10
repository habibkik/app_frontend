import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { HeroButton } from "@/components/ui/hero-button";
import { LanguageSelector } from "@/components/LanguageSelector";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navLinks = [
    { label: t("landingNav.tryDemo"), href: "/#demo", highlight: true },
    { label: t("landingNav.forBuyers"), href: "/buyers" },
    { label: t("landingNav.forSellers"), href: "/sellers" },
    { label: t("landingNav.forProducers"), href: "/producers" },
    { label: t("landingNav.pricing"), href: "/pricing" },
  ];

  const handleNavClick = (href: string) => {
    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      if (location.pathname === '/' || location.pathname === path) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(path || '/');
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      navigate(href);
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.a
            href="/"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-xl font-bold text-primary-foreground">
              TradePlatform
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center gap-8"
          >
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm font-medium transition-colors ${
                  link.highlight 
                    ? "text-primary-foreground flex items-center gap-1" 
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                {link.highlight && <Sparkles className="h-3.5 w-3.5" />}
                {link.label}
              </button>
            ))}
          </motion.div>

          {/* Desktop CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-4"
          >
            <LanguageSelector variant="ghost" />
            <HeroButton variant="ghost" size="sm" asChild>
              <Link to="/login">{t("landingNav.signIn")}</Link>
            </HeroButton>
            <HeroButton variant="primary" size="sm" asChild>
              <Link to="/signup">{t("landingNav.getStarted")}</Link>
            </HeroButton>
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-primary-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-6 space-y-4">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={`block py-2 text-base font-medium transition-colors text-left w-full ${
                      link.highlight 
                        ? "text-primary-foreground flex items-center gap-1" 
                        : "text-primary-foreground/70 hover:text-primary-foreground"
                    }`}
                  >
                    {link.highlight && <Sparkles className="h-4 w-4" />}
                    {link.label}
                  </button>
                ))}
                <div className="pt-4 space-y-3">
                  <div className="flex justify-start pb-2">
                    <LanguageSelector variant="outline" showLabel />
                  </div>
                  <HeroButton variant="ghost" size="default" className="w-full" asChild>
                    <Link to="/login">{t("landingNav.signIn")}</Link>
                  </HeroButton>
                  <HeroButton variant="primary" size="default" className="w-full" asChild>
                    <Link to="/signup">{t("landingNav.getStarted")}</Link>
                  </HeroButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;