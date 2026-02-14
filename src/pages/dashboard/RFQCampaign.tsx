import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/features/dashboard";
import { RFQCampaignBuilder } from "@/components/rfqs/RFQCampaignBuilder";

export default function RFQCampaignPage() {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("rfqCampaign.pageTitle")}</h1>
          <p className="text-muted-foreground mt-1">{t("rfqCampaign.pageSubtitle")}</p>
        </div>
        <RFQCampaignBuilder />
      </div>
    </DashboardLayout>
  );
}
