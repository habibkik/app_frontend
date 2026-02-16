import { Globe } from "lucide-react";
import { PlaceholderPage } from "@/features/dashboard";
import { useTranslation } from "react-i18next";

export default function WebsiteBuilderPage() {
  const { t } = useTranslation();
  return (
    <PlaceholderPage
      title={t("sidebar.websiteBuilder")}
      description={t("pages.websiteBuilder.description", "Build and customize your business storefront")}
      icon={Globe}
      features={[
        "Drag & drop editor",
        "Product catalog",
        "Custom domain",
        "SEO optimization",
        "Mobile responsive",
        "Analytics integration",
      ]}
    />
  );
}
