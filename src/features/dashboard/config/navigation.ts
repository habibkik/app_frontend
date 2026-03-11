import {
  Send,
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
  Palette,
  Globe,
  Users,
  Settings,
  Map,
  Newspaper,
  Radar,
  Calculator,
  Brain,
  GitCompareArrows,
  BookOpen,
  ClipboardCheck,
  Store,
  ShoppingCart,
  LucideIcon,
} from "lucide-react";
import type { DashboardMode } from "@/features/dashboard";

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
      { title: "Dashboard", url: "/dashboard/buyer", icon: LayoutDashboard },
    ],
  },
  {
    label: "Sourcing",
    items: [
      { title: "Supplier Search", url: "/dashboard/suppliers", icon: Search },
      { title: "Outreach Hub", url: "/dashboard/outreach-hub", icon: Send },
      { title: "My RFQs", url: "/dashboard/rfqs", icon: FileText },
      { title: "RFQ Templates", url: "/dashboard/rfq-templates", icon: BookOpen },
      { title: "Conversations", url: "/dashboard/conversations", icon: MessageSquare },
      { title: "Saved Suppliers", url: "/dashboard/saved", icon: Bookmark },
      { title: "Compare Suppliers", url: "/dashboard/compare", icon: GitCompareArrows },
    ],
  },
  {
    label: "Analysis",
    items: [
      { title: "Negotiation AI", url: "/dashboard/negotiation", icon: Brain },
      
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Heat Map", url: "/dashboard/heatmap", icon: Map },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ],
  },
];

// Producer mode navigation
const producerNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard/producer", icon: LayoutDashboard },
    ],
  },
  {
    label: "Production",
    items: [
      { title: "Reverse Engineering", url: "/dashboard/bom", icon: Wrench },
      { title: "Component Supply", url: "/dashboard/components", icon: Package },
      { title: "Production Feasibility", url: "/dashboard/feasibility", icon: Factory },
      { title: "Should-Cost Model", url: "/dashboard/should-cost", icon: Calculator },
      { title: "DFM/DFA Review", url: "/dashboard/dfm-review", icon: ClipboardCheck },
    ],
  },
  {
    label: "Growth",
    items: [
      { title: "Go-To-Market", url: "/dashboard/gtm", icon: Rocket },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Heat Map", url: "/dashboard/heatmap", icon: Map },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ],
  },
];

// Seller mode navigation
const sellerNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard/seller", icon: LayoutDashboard },
    ],
  },
  {
    label: "Setup",
    items: [
      { title: "Products", url: "/dashboard/products", icon: Package },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "Market Intelligence", url: "/dashboard/market", icon: TrendingUp },
      { title: "Competitor Tracking", url: "/dashboard/competitors", icon: Users },
      { title: "Pricing Strategy", url: "/dashboard/pricing", icon: DollarSign },
      { title: "Demand Signals", url: "/dashboard/demand-signals", icon: Radar },
    ],
  },
  {
    label: "Marketing",
    items: [
      
      { title: "Content Studio", url: "/dashboard/content-studio", icon: Palette },
      { title: "Social Publisher", url: "/dashboard/publisher", icon: Send },
      { title: "Website Builder", url: "/dashboard/website", icon: Globe },
      { title: "Orders & Stock", url: "/dashboard/orders-stock", icon: ShoppingCart },
      { title: "Marketplace", url: "/dashboard/marketplace", icon: Store },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Daily Report", url: "/dashboard/daily-report", icon: Newspaper },
      { title: "Heat Map", url: "/dashboard/heatmap", icon: Map },
      { title: "Seller Analytics", url: "/dashboard/seller-analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
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
