import { DashboardLayout } from "@/features/dashboard";
import { PricingOptimizerComponent } from "@/features/seller/components/PricingOptimizerComponent";
import { useTranslation } from "react-i18next";

export default function PricingPage() {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("pricingOptimizer.title", "Pricing Strategy")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("pricingOptimizer.subtitle", "Optimize your pricing for maximum profitability with AI-powered insights")}
          </p>
        </div>
        <PricingOptimizerComponent />
      </div>
    </DashboardLayout>
  );
}
