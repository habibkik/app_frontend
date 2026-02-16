import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { SocialPublisher } from "@/features/seller/components/SocialPublisher";
import { useTranslation } from "react-i18next";

export default function SocialPublisherPage() {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("socialPublisher.title")}</h1>
          <p className="text-muted-foreground">{t("socialPublisher.subtitle")}</p>
        </div>
        <SocialPublisher />
      </div>
    </DashboardLayout>
  );
}
