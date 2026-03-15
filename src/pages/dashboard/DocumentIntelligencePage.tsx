import { DashboardLayout } from "@/features/dashboard";
import { DocumentIntelligence } from "@/components/rfqs/DocumentIntelligence";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function DocumentIntelligencePage() {
  const navigate = useNavigate();

  const handleImportToRFQ = (fields: any) => {
    // Store in sessionStorage for the RFQ creation page to pick up
    sessionStorage.setItem("rfq_import_fields", JSON.stringify(fields));
    toast.success("Fields ready for import! Redirecting to RFQs…");
    navigate("/dashboard/rfqs");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <DocumentIntelligence onImportToRFQ={handleImportToRFQ} />
      </div>
    </DashboardLayout>
  );
}
