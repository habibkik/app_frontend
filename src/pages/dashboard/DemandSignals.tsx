import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { DemandSignalsDashboard } from "@/features/seller/components/DemandSignalsDashboard";

export default function DemandSignals() {
  return (
    <DashboardLayout>
      <DemandSignalsDashboard />
    </DashboardLayout>
  );
}
