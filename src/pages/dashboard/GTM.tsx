import { Rocket } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function GTMPage() {
  return (
    <PlaceholderPage
      title="Go-To-Market"
      description="Plan and execute your product launch strategy"
      icon={Rocket}
      features={[
        "Market research",
        "Competitive analysis",
        "Pricing strategy",
        "Channel planning",
        "Launch timeline",
        "Marketing assets",
      ]}
    />
  );
}
