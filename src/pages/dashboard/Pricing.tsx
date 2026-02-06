import { DashboardLayout } from "@/features/dashboard";
import { PricingOptimizerComponent } from "@/features/seller/components/PricingOptimizerComponent";

export default function PricingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pricing Strategy</h1>
          <p className="text-muted-foreground mt-1">
            Optimize your pricing for maximum profitability with AI-powered insights
          </p>
        </div>
        <PricingOptimizerComponent />
      </div>
    </DashboardLayout>
  );
}
