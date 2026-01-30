import { Bookmark } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function SavedSuppliersPage() {
  return (
    <PlaceholderPage
      title="Saved Suppliers"
      description="Access your bookmarked suppliers"
      icon={Bookmark}
      features={[
        "Organize with folders",
        "Add notes & tags",
        "Quick comparison view",
        "Export supplier list",
        "Share with team",
        "Activity tracking",
      ]}
    />
  );
}
