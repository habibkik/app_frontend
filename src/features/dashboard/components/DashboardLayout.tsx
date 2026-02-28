import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardModeProvider } from "@/features/dashboard";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { ActiveBOMBanner } from "@/components/producer/ActiveBOMBanner";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isRTL } = useLanguage();
  const side = isRTL ? "right" : "left";

  return (
    <DashboardModeProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar side={side} />
          <SidebarInset className="flex flex-col flex-1">
            <DashboardHeader />
            <ActiveBOMBanner />
            <main className="flex-1 p-2 sm:p-4 md:p-6 bg-background">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </DashboardModeProvider>
  );
}
