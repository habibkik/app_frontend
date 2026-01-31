import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { supportedLanguages, LanguageCode } from "@/i18n";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  variant?: "default" | "ghost" | "outline";
  showLabel?: boolean;
  className?: string;
}

export function LanguageSelector({ 
  variant = "ghost", 
  showLabel = false,
  className 
}: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const currentLang = supportedLanguages.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={showLabel ? "default" : "icon"} className={cn("gap-2", className)}>
          <Globe className="h-4 w-4" />
          {showLabel && <span>{currentLang?.name}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as LanguageCode)}
            className={cn(
              "cursor-pointer",
              language === lang.code && "bg-accent"
            )}
          >
            <span className={lang.dir === "rtl" ? "font-arabic" : ""}>
              {lang.name}
            </span>
            {language === lang.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
