import { Search } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function SuppliersPage() {
  return (
    <PlaceholderPage
      title="Supplier Search"
      description="Find and connect with verified suppliers worldwide"
      icon={Search}
      features={[
        "AI-powered supplier matching",
        "Advanced filtering & sorting",
        "Supplier verification badges",
        "Direct messaging",
        "Save & compare suppliers",
        "Request quotes instantly",
      ]}
    />
  );
}
