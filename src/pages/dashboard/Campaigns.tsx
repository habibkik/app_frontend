import { Megaphone } from "lucide-react";
import { PlaceholderPage } from "@/features/dashboard";

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
