import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { supportedLanguages, LanguageCode } from "@/i18n";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isRTL: boolean;
  direction: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<LanguageCode>(
    (i18n.language?.split("-")[0] as LanguageCode) || "en"
  );

  const languageConfig = supportedLanguages.find((l) => l.code === language);
  const isRTL = languageConfig?.dir === "rtl";
  const direction = isRTL ? "rtl" : "ltr";

  const setLanguage = (lang: LanguageCode) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  useEffect(() => {
    // Update document direction and language
    document.documentElement.dir = direction;
    document.documentElement.lang = language;

    // Add/remove RTL class for Tailwind
    if (isRTL) {
      document.documentElement.classList.add("rtl");
      document.documentElement.style.setProperty("font-family", "'Cairo', sans-serif", "important");
      document.body.style.setProperty("font-family", "'Cairo', sans-serif", "important");
    } else {
      document.documentElement.classList.remove("rtl");
      document.documentElement.style.removeProperty("font-family");
      document.body.style.removeProperty("font-family");
    }
  }, [language, direction, isRTL]);

  useEffect(() => {
    // Sync with i18n language changes
    const handleLanguageChange = (lng: string) => {
      const langCode = lng.split("-")[0] as LanguageCode;
      if (supportedLanguages.some((l) => l.code === langCode)) {
        setLanguageState(langCode);
      }
    };

    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, direction }}>
      {children}
    </LanguageContext.Provider>
  );
}
