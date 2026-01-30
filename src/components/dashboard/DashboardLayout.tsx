import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardModeProvider } from "@/contexts/DashboardModeContext";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardModeProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <SidebarInset className="flex flex-col flex-1">
            <DashboardHeader />
            <main className="flex-1 p-6 bg-background">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </DashboardModeProvider>
  );
}
