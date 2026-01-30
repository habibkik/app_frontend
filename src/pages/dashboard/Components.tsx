import { Package } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function ComponentsPage() {
  return (
    <PlaceholderPage
      title="Component Supply"
      description="Source components for your production needs"
      icon={Package}
      features={[
        "Component database",
        "Supplier comparison",
        "Price tracking",
        "Inventory alerts",
        "Bulk ordering",
        "Quality certifications",
      ]}
    />
  );
}
