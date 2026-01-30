import { Megaphone } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function CampaignsPage() {
  return (
    <PlaceholderPage
      title="Marketing & Campaigns"
      description="Create and manage marketing campaigns"
      icon={Megaphone}
      features={[
        "Campaign builder",
        "Email marketing",
        "Social media posting",
        "Audience targeting",
        "Performance tracking",
        "A/B testing",
      ]}
    />
  );
}
