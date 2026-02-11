/**
 * Dashboard Stats Component - Mode-specific statistics display
 */
import { motion } from "framer-motion";
import { TrendingUp, Users, FileText, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMode } from "@/features/dashboard";

interface DashboardStatsProps {
  mode: DashboardMode;
}

export function DashboardStats({ mode }: DashboardStatsProps) {
  const { t } = useTranslation();

  const statsConfig: Record<DashboardMode, { titleKey: string; value: string; change: string; positive: boolean; icon: React.ElementType }[]> = {
    buyer: [
      { titleKey: "dashboardStats.buyer.activeRfqs", value: "24", change: "+12%", positive: true, icon: FileText },
      { titleKey: "dashboardStats.buyer.suppliersFound", value: "156", change: "+8%", positive: true, icon: Users },
      { titleKey: "dashboardStats.buyer.savedThisMonth", value: "$12.4K", change: "+23%", positive: true, icon: DollarSign },
      { titleKey: "dashboardStats.buyer.responseRate", value: "89%", change: "+5%", positive: true, icon: TrendingUp },
    ],
    producer: [
      { titleKey: "dashboardStats.producer.bomsGenerated", value: "18", change: "+4%", positive: true, icon: FileText },
      { titleKey: "dashboardStats.producer.componentsSourced", value: "342", change: "+15%", positive: true, icon: Users },
      { titleKey: "dashboardStats.producer.productionValue", value: "$84.2K", change: "+12%", positive: true, icon: DollarSign },
      { titleKey: "dashboardStats.producer.costAccuracy", value: "96%", change: "+2%", positive: true, icon: TrendingUp },
    ],
    seller: [
      { titleKey: "dashboardStats.seller.marketAnalyses", value: "89", change: "+6%", positive: true, icon: FileText },
      { titleKey: "dashboardStats.seller.productsListed", value: "1,247", change: "+18%", positive: true, icon: Users },
      { titleKey: "dashboardStats.seller.revenueMtd", value: "$45.8K", change: "-3%", positive: false, icon: DollarSign },
      { titleKey: "dashboardStats.seller.winRate", value: "4.2%", change: "+0.8%", positive: true, icon: TrendingUp },
    ],
  };

  const stats = statsConfig[mode];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div key={stat.titleKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t(stat.titleKey)}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs mt-1">
                {stat.positive ? <ArrowUpRight className="h-3 w-3 text-success mr-1" /> : <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />}
                <span className={stat.positive ? "text-success" : "text-destructive"}>{stat.change}</span>
                <span className="text-muted-foreground ml-1">{t("dashboardStats.fromLastMonth")}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}