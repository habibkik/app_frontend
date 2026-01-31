/**
 * Dashboard Page - Image-First Entry Point
 * Central hub for all modes with universal image upload
 */
import { motion } from "framer-motion";
import { 
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/features/dashboard/components";
import { useDashboardMode } from "@/features/dashboard";
import { modeConfig } from "@/features/dashboard/config/navigation";
import { UniversalImageUpload } from "@/components/shared/UniversalImageUpload";
import { useAnalysisStore } from "@/stores/analysisStore";
import { DashboardStats } from "./components/DashboardStats";
import { RecentAnalyses } from "./components/RecentAnalyses";
import { QuickActions } from "./components/QuickActions";

function DashboardContent() {
  const { mode } = useDashboardMode();
  const config = modeConfig[mode];
  const navigate = useNavigate();
  const { history, isAnalyzing } = useAnalysisStore();

  const handleAnalysisComplete = () => {
    // Navigate to appropriate results page based on mode
    switch (mode) {
      case "buyer":
        navigate("/dashboard/suppliers");
        break;
      case "producer":
        navigate("/dashboard/bom");
        break;
      case "seller":
        navigate("/dashboard/market");
        break;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <motion.h1 
            key={mode}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
          >
            {config.label} Dashboard
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Upload a product image to get started with AI-powered analysis
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
        </div>
      </div>

      {/* Main Image Upload Section */}
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Product Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <UniversalImageUpload onAnalysisComplete={handleAnalysisComplete} />
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <DashboardStats mode={mode} />

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Analyses */}
        <div className="lg:col-span-2">
          <RecentAnalyses history={history} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions mode={mode} config={config} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
