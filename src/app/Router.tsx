import { Routes, Route } from "react-router-dom";

// Auth feature pages
import { LoginPage, SignupPage, ProtectedRoute, PublicRoute } from "@/features/auth";

// Dashboard feature pages
import { DashboardPage, AnalyticsPage } from "@/features/dashboard";

// Landing feature pages
import { IndexPage } from "@/features/landing";

// Buyer feature pages
import { 
  SearchResultsPage, 
  RFQBuilderPage, 
  ConversationsPage, 
  SavedSuppliersPage 
} from "@/features/buyer";

// Producer feature pages
import { 
  BOMsPage, 
  ComponentsPage, 
  FeasibilityPage, 
  GTMPage 
} from "@/features/producer";

// Seller feature pages
import { 
  MarketIntelligencePage, 
  PricingPage, 
  CampaignsPage, 
  WebsiteBuilderPage 
} from "@/features/seller";

// Shared pages
import NotFound from "@/pages/NotFound";

export function Router() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<IndexPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      
      {/* Protected Dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      
      {/* Buyer mode pages */}
      <Route path="/dashboard/suppliers" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} />
      <Route path="/dashboard/rfqs" element={<ProtectedRoute><RFQBuilderPage /></ProtectedRoute>} />
      <Route path="/dashboard/conversations" element={<ProtectedRoute><ConversationsPage /></ProtectedRoute>} />
      <Route path="/dashboard/saved" element={<ProtectedRoute><SavedSuppliersPage /></ProtectedRoute>} />
      
      {/* Producer mode pages */}
      <Route path="/dashboard/bom" element={<ProtectedRoute><BOMsPage /></ProtectedRoute>} />
      <Route path="/dashboard/components" element={<ProtectedRoute><ComponentsPage /></ProtectedRoute>} />
      <Route path="/dashboard/feasibility" element={<ProtectedRoute><FeasibilityPage /></ProtectedRoute>} />
      <Route path="/dashboard/gtm" element={<ProtectedRoute><GTMPage /></ProtectedRoute>} />
      
      {/* Seller mode pages */}
      <Route path="/dashboard/market" element={<ProtectedRoute><MarketIntelligencePage /></ProtectedRoute>} />
      <Route path="/dashboard/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
      <Route path="/dashboard/campaigns" element={<ProtectedRoute><CampaignsPage /></ProtectedRoute>} />
      <Route path="/dashboard/website" element={<ProtectedRoute><WebsiteBuilderPage /></ProtectedRoute>} />
      
      {/* Shared pages */}
      <Route path="/dashboard/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
