import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useDashboardMode } from "@/features/dashboard";
import { useConversations } from "@/features/buyer";
import { getNavigationForMode, modeConfig } from "@/features/dashboard/config/navigation";
import { cn } from "@/lib/utils";

// Map English nav titles to translation keys
const titleKeyMap: Record<string, string> = {
  "Dashboard": "sidebar.dashboard",
  "Supplier Search": "sidebar.supplierSearch",
  "My RFQs": "sidebar.myRfqs",
  "Conversations": "sidebar.conversations",
  "Saved Suppliers": "sidebar.savedSuppliers",
  "Heat Map": "sidebar.heatMap",
  "Analytics": "sidebar.analytics",
  "Settings": "sidebar.settings",
  "Reverse Engineering": "sidebar.reverseEngineering",
  "Component Supply": "sidebar.componentSupply",
  "Production Feasibility": "sidebar.productionFeasibility",
  "Go-To-Market": "sidebar.goToMarket",
  "Products": "sidebar.products",
  "Market Intelligence": "sidebar.marketIntelligence",
  "Competitor Tracking": "sidebar.competitorTracking",
  "Pricing Strategy": "sidebar.pricingStrategy",
  "Campaigns": "sidebar.campaigns",
  "Content Studio": "sidebar.contentStudio",
  "Social Publisher": "sidebar.socialPublisher",
  "Website Builder": "sidebar.websiteBuilder",
  "Seller Analytics": "sidebar.sellerAnalytics",
};

const groupKeyMap: Record<string, string> = {
  "Overview": "sidebar.overview",
  "Sourcing": "sidebar.sourcing",
  "Insights": "sidebar.insights",
  "Account": "sidebar.account",
  "Production": "sidebar.production",
  "Growth": "sidebar.growth",
  "Setup": "sidebar.setup",
  "Intelligence": "sidebar.intelligence",
  "Marketing": "sidebar.marketing",
};

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { mode } = useDashboardMode();
  const { getTotalUnreadCount } = useConversations();
  const { t } = useTranslation();
  
  const navigation = getNavigationForMode(mode);
  const currentConfig = modeConfig[mode];
  const totalUnread = getTotalUnreadCount();

  const isActive = (path: string) => location.pathname === path;

  const getBadgeCount = (url: string): number => {
    if (url === "/dashboard/conversations") {
      return totalUnread;
    }
    return 0;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-primary-foreground">T</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">TradePlatform</span>
              <span className={cn("text-xs", currentConfig.color)}>
                {t(`dashboard.modes.${mode}`)}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/50 px-3 mb-2">
                {t(groupKeyMap[group.label] || group.label)}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const badgeCount = getBadgeCount(item.url);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={collapsed ? t(titleKeyMap[item.title] || item.title) : undefined}
                      >
                        <NavLink
                          to={item.url}
                          end={item.url === "/dashboard"}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <div className="relative flex-shrink-0">
                            <item.icon className="h-4 w-4" />
                            {collapsed && badgeCount > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                                {badgeCount > 9 ? "9+" : badgeCount}
                              </span>
                            )}
                          </div>
                          {!collapsed && (
                            <>
                              <span className="flex-1">{t(titleKeyMap[item.title] || item.title)}</span>
                              {badgeCount > 0 && (
                                <Badge 
                                  variant="destructive" 
                                  className="h-5 min-w-[20px] px-1.5 text-[10px] font-medium"
                                >
                                  {badgeCount > 99 ? "99+" : badgeCount}
                                </Badge>
                              )}
                            </>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <div className="text-xs text-sidebar-foreground/50">
            © 2026 TradePlatform
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}