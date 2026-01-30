import { Wrench } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function BOMPage() {
  return (
    <PlaceholderPage
      title="Reverse Engineering (BOM)"
      description="Analyze and break down product bills of materials"
      icon={Wrench}
      features={[
        "Upload product specs",
        "AI component identification",
        "Cost estimation",
        "Alternative suggestions",
        "Supplier matching",
        "BOM export",
      ]}
    />
  );
}
