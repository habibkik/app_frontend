import { DashboardLayout } from "@/features/dashboard";
import { ProcurementKnowledgeBrain } from "@/components/rfqs/ProcurementKnowledgeBrain";

export default function KnowledgeBrainPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <ProcurementKnowledgeBrain />
      </div>
    </DashboardLayout>
  );
}
