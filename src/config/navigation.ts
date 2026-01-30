import {
  LayoutDashboard,
  Search,
  FileText,
  MessageSquare,
  Bookmark,
  BarChart3,
  Wrench,
  Package,
  Factory,
  Rocket,
  TrendingUp,
  DollarSign,
  Megaphone,
  Globe,
  LucideIcon,
} from "lucide-react";
import { DashboardMode } from "@/contexts/DashboardModeContext";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Buyer mode navigation
const buyerNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Sourcing",
    items: [
      { title: "Supplier Search", url: "/dashboard/suppliers", icon: Search },
      { title: "My RFQs", url: "/dashboard/rfqs", icon: FileText },
      { title: "Conversations", url: "/dashboard/conversations", icon: MessageSquare },
      { title: "Saved Suppliers", url: "/dashboard/saved", icon: Bookmark },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
];

// Producer mode navigation
const producerNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Production",
    items: [
      { title: "Reverse Engineering", url: "/dashboard/bom", icon: Wrench },
      { title: "Component Supply", url: "/dashboard/components", icon: Package },
      { title: "Production Feasibility", url: "/dashboard/feasibility", icon: Factory },
    ],
  },
  {
    label: "Growth",
    items: [
      { title: "Go-To-Market", url: "/dashboard/gtm", icon: Rocket },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
];

// Seller mode navigation
const sellerNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "Market Intelligence", url: "/dashboard/market", icon: TrendingUp },
      { title: "Pricing Strategy", url: "/dashboard/pricing", icon: DollarSign },
    ],
  },
  {
    label: "Marketing",
    items: [
      { title: "Campaigns", url: "/dashboard/campaigns", icon: Megaphone },
      { title: "Website Builder", url: "/dashboard/website", icon: Globe },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
];

export function getNavigationForMode(mode: DashboardMode): NavGroup[] {
  switch (mode) {
    case "buyer":
      return buyerNavigation;
    case "producer":
      return producerNavigation;
    case "seller":
      return sellerNavigation;
    default:
      return buyerNavigation;
  }
}

export const modeConfig: Record<DashboardMode, { label: string; description: string; color: string }> = {
  buyer: {
    label: "Buyer",
    description: "Source products & suppliers",
    color: "text-blue-500",
  },
  producer: {
    label: "Producer",
    description: "Manufacture & produce",
    color: "text-amber-500",
  },
  seller: {
    label: "Seller",
    description: "Sell & distribute",
    color: "text-emerald-500",
  },
};
