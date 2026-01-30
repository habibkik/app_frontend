import { TrendingUp } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function MarketIntelligencePage() {
  return (
    <PlaceholderPage
      title="Market Intelligence"
      description="Real-time market data and competitive insights"
      icon={TrendingUp}
      features={[
        "Price monitoring",
        "Competitor tracking",
        "Demand forecasting",
        "Market trends",
        "Custom alerts",
        "Industry reports",
      ]}
    />
  );
}
