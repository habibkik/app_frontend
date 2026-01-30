import { BarChart3 } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      description="Insights and performance metrics for your business"
      icon={BarChart3}
      features={[
        "Revenue & cost tracking",
        "Supplier performance",
        "Market trends analysis",
        "Custom reports",
        "Export to PDF/Excel",
        "Scheduled reports",
      ]}
    />
  );
}
