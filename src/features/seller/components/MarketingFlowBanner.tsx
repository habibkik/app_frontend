import { useLocation, useNavigate } from "react-router-dom";
import { Package, TrendingUp, Palette, Send, Globe, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useContentStudioStore } from "@/stores/contentStudioStore";

const STEPS = [
  { label: "Products", icon: Package, path: "/dashboard/products" },
  { label: "Intelligence", icon: TrendingUp, path: "/dashboard/market" },
  { label: "Content Studio", icon: Palette, path: "/dashboard/content-studio" },
  { label: "Publisher", icon: Send, path: "/dashboard/publisher" },
  { label: "Website", icon: Globe, path: "/dashboard/website" },
] as const;

export function MarketingFlowBanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const sellerResults = useAnalysisStore((s) => s.sellerResults);
  const socialPosts = useContentStudioStore((s) => s.socialPosts);

  const getStepStatus = (path: string) => {
    if (location.pathname === path) return "active";
    if (path === "/dashboard/market" && sellerResults) return "complete";
    if (path === "/dashboard/content-studio" && socialPosts.length > 0) return "complete";
    return "pending";
  };

  return (
    <div className="flex items-center gap-1 p-2 rounded-lg border bg-card overflow-x-auto">
      {STEPS.map((step, i) => {
        const status = getStepStatus(step.path);
        const Icon = step.icon;
        return (
          <div key={step.path} className="flex items-center shrink-0">
            <button
              onClick={() => navigate(step.path)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                status === "active" && "bg-primary text-primary-foreground",
                status === "complete" && "bg-primary/10 text-primary hover:bg-primary/20",
                status === "pending" && "text-muted-foreground hover:bg-muted",
              )}
            >
              {status === "complete" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}
