import { DashboardLayout } from "@/features/dashboard";
import { DailyReportViewer } from "@/features/seller/components/DailyReportViewer";

export default function DailyReportPage() {
  return (
    <DashboardLayout>
      <DailyReportViewer />
    </DashboardLayout>
  );
}
