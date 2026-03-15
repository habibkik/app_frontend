import { DashboardLayout } from "@/features/dashboard";
import { SupplierInvitationManager } from "@/components/rfqs/SupplierInvitationManager";

export default function SupplierPortalManagePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <SupplierInvitationManager />
      </div>
    </DashboardLayout>
  );
}
