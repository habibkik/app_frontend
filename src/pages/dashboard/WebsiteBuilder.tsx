import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { WebsiteBuilder } from "@/features/seller/components/website-builder/WebsiteBuilder";
import { MarketingFlowBanner } from "@/features/seller/components/MarketingFlowBanner";

export default function WebsiteBuilderPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <MarketingFlowBanner />
        <WebsiteBuilder />
      </div>
    </DashboardLayout>
  );
}
