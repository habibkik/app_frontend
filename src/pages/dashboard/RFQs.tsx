import { FileText } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function RFQsPage() {
  return (
    <PlaceholderPage
      title="My RFQs"
      description="Manage your requests for quotation"
      icon={FileText}
      features={[
        "Create new RFQs",
        "Track quote responses",
        "Compare supplier quotes",
        "Negotiate pricing",
        "Award contracts",
        "RFQ templates",
      ]}
    />
  );
}
