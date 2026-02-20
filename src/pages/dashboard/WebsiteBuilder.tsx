import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { WebsiteBuilder } from "@/features/seller/components/website-builder/WebsiteBuilder";

export default function WebsiteBuilderPage() {
  return (
    <DashboardLayout>
      <WebsiteBuilder />
    </DashboardLayout>
  );
}
