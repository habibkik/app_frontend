import { DashboardLayout } from "@/features/dashboard";
import { RFxCopilot } from "@/components/rfqs/RFxCopilot";

export default function RFxCopilotPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <RFxCopilot />
      </div>
    </DashboardLayout>
  );
}
