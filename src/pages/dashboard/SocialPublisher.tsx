import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { SocialPublisher } from "@/features/seller/components/SocialPublisher";

export default function SocialPublisherPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Social Publisher</h1>
          <p className="text-muted-foreground">Compose, schedule, and publish across all your social channels.</p>
        </div>
        <SocialPublisher />
      </div>
    </DashboardLayout>
  );
}
