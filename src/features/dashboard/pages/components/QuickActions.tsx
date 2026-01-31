/**
 * Quick Actions Component
 * Mode-specific quick action buttons
 */
import { 
  FileText, 
  Users, 
  TrendingUp,
  DollarSign,
  Package,
  Factory,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardMode } from "@/features/dashboard";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  path: string;
}

const actionsConfig: Record<DashboardMode, QuickAction[]> = {
  buyer: [
    { icon: FileText, label: "Create New RFQ", path: "/dashboard/rfqs" },
    { icon: Users, label: "Browse Suppliers", path: "/dashboard/suppliers" },
    { icon: TrendingUp, label: "View Analytics", path: "/dashboard/analytics" },
  ],
  producer: [
    { icon: Package, label: "Component Supply", path: "/dashboard/components" },
    { icon: Factory, label: "Check Feasibility", path: "/dashboard/feasibility" },
    { icon: TrendingUp, label: "Go-To-Market", path: "/dashboard/gtm" },
  ],
  seller: [
    { icon: TrendingUp, label: "Market Intelligence", path: "/dashboard/market" },
    { icon: DollarSign, label: "Pricing Strategy", path: "/dashboard/pricing" },
    { icon: FileText, label: "Launch Campaign", path: "/dashboard/campaigns" },
  ],
};

interface QuickActionsProps {
  mode: DashboardMode;
  config: { label: string };
}

export function QuickActions({ mode, config }: QuickActionsProps) {
  const navigate = useNavigate();
  const actions = actionsConfig[mode];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks for {config.label.toLowerCase()}s</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            className="w-full justify-start"
            variant="outline"
            onClick={() => navigate(action.path)}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
