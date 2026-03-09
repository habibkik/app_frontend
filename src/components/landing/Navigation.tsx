import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-column backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a
            href="/"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-column-navy flex items-center justify-center">
              <span className="text-base sm:text-lg font-bold text-white">T</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-column-navy tracking-tight">
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
                className={`text-sm font-medium transition-colors duration-200 ${
                  link.highlight
                    ? "column-pill-nav px-3 py-1.5 rounded-full border border-column-card text-column-navy hover:bg-white/60"
                    : "text-column-navy/70 hover:text-column-navy"
                }`}
              >
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
            <Link to="/login" className="text-sm font-medium text-column-navy/70 hover:text-column-navy transition-colors duration-200">
              {t("landingNav.signIn")}
            </Link>
            <HeroButton variant="columnNavFilled" size="sm" asChild>
              <Link to="/signup" className="flex items-center gap-1">
                {t("landingNav.getStarted")} <ChevronRight className="w-4 h-4" />
              </Link>
            </HeroButton>
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-column-navy"
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
              className="md:hidden overflow-hidden border-t border-[hsl(0_0%_0%/0.06)]"
            >
              <div className="py-4 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-column-navy/80 hover:text-column-navy hover:bg-[hsl(0_0%_100%/0.6)] active:bg-[hsl(0_0%_100%/0.8)] transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="pt-3 mt-2 border-t border-[hsl(0_0%_0%/0.06)] space-y-2">
                  <div className="flex justify-start px-3 pb-1">
                    <LanguageSelector variant="outline" showLabel />
                  </div>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-column-navy/80 hover:text-column-navy hover:bg-[hsl(0_0%_100%/0.6)] transition-colors"
                  >
                    {t("landingNav.signIn")}
                  </Link>
                  <div className="px-3">
                    <HeroButton variant="columnNavFilled" size="default" className="w-full" asChild>
                      <Link to="/signup" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-1">
                        {t("landingNav.getStarted")} <ChevronRight className="w-4 h-4" />
                      </Link>
                    </HeroButton>
                  </div>
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
