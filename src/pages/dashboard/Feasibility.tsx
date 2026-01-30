import { Factory } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function FeasibilityPage() {
  return (
    <PlaceholderPage
      title="Production Feasibility"
      description="Analyze production capabilities and requirements"
      icon={Factory}
      features={[
        "Capacity planning",
        "Cost analysis",
        "Timeline estimation",
        "Resource allocation",
        "Risk assessment",
        "Feasibility reports",
      ]}
    />
  );
}
