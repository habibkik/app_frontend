import { DollarSign } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function PricingPage() {
  return (
    <PlaceholderPage
      title="Pricing Strategy"
      description="Optimize your pricing for maximum profitability"
      icon={DollarSign}
      features={[
        "Dynamic pricing",
        "Competitor price tracking",
        "Margin analysis",
        "Price recommendations",
        "A/B testing",
        "Bulk price updates",
      ]}
    />
  );
}
