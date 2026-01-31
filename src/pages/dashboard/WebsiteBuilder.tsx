import { Globe } from "lucide-react";
import { PlaceholderPage } from "@/features/dashboard";

export default function WebsiteBuilderPage() {
  return (
    <PlaceholderPage
      title="Website Builder"
      description="Build and customize your business storefront"
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
