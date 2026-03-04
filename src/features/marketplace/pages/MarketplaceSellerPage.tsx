import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Globe, BarChart3, Zap, Sparkles, Settings } from "lucide-react";
import { useMarketplaceStore, type MarketplaceTab } from "../store/marketplaceStore";
import { TabProductListing } from "../components/TabProductListing";
import { TabConnections } from "../components/TabConnections";
import { TabDashboard } from "../components/TabDashboard";
import { TabBulkAutomation } from "../components/TabBulkAutomation";
import { TabAITools } from "../components/TabAITools";
import { TabSettings } from "../components/TabSettings";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";

const TABS: { value: MarketplaceTab; label: string; icon: typeof Package; mobileLabel: string }[] = [
  { value: "products", label: "Product Listing", icon: Package, mobileLabel: "Products" },
  { value: "connections", label: "Connections & Publishing", icon: Globe, mobileLabel: "Connect" },
  { value: "dashboard", label: "Dashboard & Analytics", icon: BarChart3, mobileLabel: "Dashboard" },
  { value: "bulk", label: "Bulk & Automation", icon: Zap, mobileLabel: "Bulk" },
  { value: "ai-tools", label: "AI Tools", icon: Sparkles, mobileLabel: "AI" },
  { value: "settings", label: "Settings", icon: Settings, mobileLabel: "Settings" },
];

export default function MarketplaceSellerPage() {
  const { activeTab, setActiveTab } = useMarketplaceStore();

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-3">
          <h1 className="text-xl font-bold">Marketplace Publisher</h1>
          <p className="text-sm text-muted-foreground">Create once, sell everywhere</p>
        </div>

        {/* Sticky Tab Bar */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MarketplaceTab)} className="flex-1 flex flex-col">
          <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TabsList className="h-auto p-0 bg-transparent rounded-none w-full justify-start overflow-x-auto flex-nowrap">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 md:px-4 py-3 gap-1.5 shrink-0 text-xs md:text-sm"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">{tab.mobileLabel}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content with Animations */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <AnimatePresence mode="wait">
              {TABS.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab.value === "products" && <TabProductListing />}
                    {tab.value === "connections" && <TabConnections />}
                    {tab.value === "dashboard" && <TabDashboard />}
                    {tab.value === "bulk" && <TabBulkAutomation />}
                    {tab.value === "ai-tools" && <TabAITools />}
                    {tab.value === "settings" && <TabSettings />}
                  </motion.div>
                </TabsContent>
              ))}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
