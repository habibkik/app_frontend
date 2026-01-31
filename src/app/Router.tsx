import { Routes, Route } from "react-router-dom";

// Auth feature pages
import { LoginPage, SignupPage, ProtectedRoute, PublicRoute } from "@/features/auth";

// Dashboard feature pages
import { DashboardPage } from "@/features/dashboard";

// Landing feature pages
import { IndexPage } from "@/features/landing";

// Buyer feature pages (still using old location during migration)
import Suppliers from "@/pages/dashboard/Suppliers";
import RFQs from "@/pages/dashboard/RFQs";
import Conversations from "@/pages/dashboard/Conversations";
import SavedSuppliers from "@/pages/dashboard/SavedSuppliers";

// Producer feature pages (still using old location during migration)
import BOM from "@/pages/dashboard/BOM";
import Components from "@/pages/dashboard/Components";
import Feasibility from "@/pages/dashboard/Feasibility";
import GTM from "@/pages/dashboard/GTM";

// Seller feature pages (still using old location during migration)
import MarketIntelligence from "@/pages/dashboard/MarketIntelligence";
import Pricing from "@/pages/dashboard/Pricing";
import Campaigns from "@/pages/dashboard/Campaigns";
import WebsiteBuilder from "@/pages/dashboard/WebsiteBuilder";

// Shared pages
import Analytics from "@/pages/dashboard/Analytics";
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
      <Route path="/dashboard/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
      <Route path="/dashboard/rfqs" element={<ProtectedRoute><RFQs /></ProtectedRoute>} />
      <Route path="/dashboard/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
      <Route path="/dashboard/saved" element={<ProtectedRoute><SavedSuppliers /></ProtectedRoute>} />
      
      {/* Producer mode pages */}
      <Route path="/dashboard/bom" element={<ProtectedRoute><BOM /></ProtectedRoute>} />
      <Route path="/dashboard/components" element={<ProtectedRoute><Components /></ProtectedRoute>} />
      <Route path="/dashboard/feasibility" element={<ProtectedRoute><Feasibility /></ProtectedRoute>} />
      <Route path="/dashboard/gtm" element={<ProtectedRoute><GTM /></ProtectedRoute>} />
      
      {/* Seller mode pages */}
      <Route path="/dashboard/market" element={<ProtectedRoute><MarketIntelligence /></ProtectedRoute>} />
      <Route path="/dashboard/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
      <Route path="/dashboard/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
      <Route path="/dashboard/website" element={<ProtectedRoute><WebsiteBuilder /></ProtectedRoute>} />
      
      {/* Shared pages */}
      <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
