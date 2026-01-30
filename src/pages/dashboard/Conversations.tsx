import { MessageSquare } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function ConversationsPage() {
  return (
    <PlaceholderPage
      title="Conversations"
      description="Chat with suppliers and manage communications"
      icon={MessageSquare}
      features={[
        "Real-time messaging",
        "File sharing",
        "Message threads",
        "Read receipts",
        "Search conversations",
        "Archive & organize",
      ]}
    />
  );
}
