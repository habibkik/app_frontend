/**
 * Quick Actions Component - Mode-specific quick action buttons
 */
import { FileText, Users, TrendingUp, DollarSign, Package, Factory, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardMode } from "@/features/dashboard";

interface QuickActionsProps {
  mode: DashboardMode;
  config: { label: string };
}

export function QuickActions({ mode, config }: QuickActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actionsConfig: Record<DashboardMode, { icon: React.ElementType; labelKey: string; path: string }[]> = {
    buyer: [
      { icon: FileText, labelKey: "quickActions.buyer.createRfq", path: "/dashboard/rfqs" },
      { icon: Users, labelKey: "quickActions.buyer.browseSuppliers", path: "/dashboard/suppliers" },
      { icon: TrendingUp, labelKey: "quickActions.buyer.viewAnalytics", path: "/dashboard/analytics" },
    ],
    producer: [
      { icon: Package, labelKey: "quickActions.producer.componentSupply", path: "/dashboard/components" },
      { icon: Factory, labelKey: "quickActions.producer.checkFeasibility", path: "/dashboard/feasibility" },
      { icon: TrendingUp, labelKey: "quickActions.producer.goToMarket", path: "/dashboard/gtm" },
    ],
    seller: [
      { icon: TrendingUp, labelKey: "quickActions.seller.marketIntelligence", path: "/dashboard/market" },
      { icon: Map, labelKey: "quickActions.seller.viewHeatMap", path: "/dashboard/heatmap" },
      { icon: DollarSign, labelKey: "quickActions.seller.pricingStrategy", path: "/dashboard/pricing" },
    ],
  };

  const actions = actionsConfig[mode];
  const modeLabel = t(`modeSelector.${mode}`);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("quickActions.title")}</CardTitle>
        <CardDescription>{t("quickActions.description", { mode: modeLabel })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button key={action.labelKey} className="w-full justify-start" variant="outline" onClick={() => navigate(action.path)}>
            <action.icon className="mr-2 h-4 w-4" />
            {t(action.labelKey)}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}