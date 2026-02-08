import { Routes, Route } from "react-router-dom";

// Auth feature pages
import { LoginPage, SignupPage, ProtectedRoute, PublicRoute } from "@/features/auth";

// Dashboard feature pages
import { DashboardPage } from "@/features/dashboard";

// Landing feature pages
import { IndexPage, BuyersPage, SellersPage, ProducersPage, PricingPage } from "@/features/landing";

// Buyer feature pages (still using old location during migration)
import Suppliers from "@/pages/dashboard/Suppliers";
import BuyerDashboard from "@/features/buyer/pages/BuyerDashboard";
import RFQs from "@/pages/dashboard/RFQs";
import Conversations from "@/pages/dashboard/Conversations";
import SavedSuppliers from "@/pages/dashboard/SavedSuppliers";

// Producer feature pages (still using old location during migration)
import BOM from "@/pages/dashboard/BOM";
import Components from "@/pages/dashboard/Components";
import Feasibility from "@/pages/dashboard/Feasibility";
import GTM from "@/pages/dashboard/GTM";

// Seller feature pages (still using old location during migration)
import SellerDashboard from "@/features/seller/pages/SellerDashboard";
import Products from "@/pages/dashboard/Products";
import ProducerDashboard from "@/features/producer/pages/ProducerDashboard";
import MarketIntelligence from "@/pages/dashboard/MarketIntelligence";
import Competitors from "@/pages/dashboard/Competitors";
import Pricing from "@/pages/dashboard/Pricing";
import Campaigns from "@/pages/dashboard/Campaigns";
import ContentStudioPage from "@/pages/dashboard/ContentStudio";
import WebsiteBuilder from "@/pages/dashboard/WebsiteBuilder";
import SocialPublisherPage from "@/pages/dashboard/SocialPublisher";

// Shared pages
import Analytics from "@/pages/dashboard/Analytics";
import HeatMap from "@/pages/dashboard/HeatMap";
import Settings from "@/pages/dashboard/Settings";
import NotFound from "@/pages/NotFound";

export function Router() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<IndexPage />} />
      <Route path="/buyers" element={<BuyersPage />} />
      <Route path="/sellers" element={<SellersPage />} />
      <Route path="/producers" element={<ProducersPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      
      {/* Protected Dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      
      {/* Buyer mode pages */}
      <Route path="/dashboard/buyer" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
      <Route path="/dashboard/rfqs" element={<ProtectedRoute><RFQs /></ProtectedRoute>} />
      <Route path="/dashboard/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
      <Route path="/dashboard/saved" element={<ProtectedRoute><SavedSuppliers /></ProtectedRoute>} />
      
      {/* Producer mode pages */}
      <Route path="/dashboard/producer" element={<ProtectedRoute><ProducerDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/bom" element={<ProtectedRoute><BOM /></ProtectedRoute>} />
      <Route path="/dashboard/components" element={<ProtectedRoute><Components /></ProtectedRoute>} />
      <Route path="/dashboard/feasibility" element={<ProtectedRoute><Feasibility /></ProtectedRoute>} />
      <Route path="/dashboard/gtm" element={<ProtectedRoute><GTM /></ProtectedRoute>} />
      
      {/* Seller mode pages */}
      <Route path="/dashboard/seller" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/dashboard/market" element={<ProtectedRoute><MarketIntelligence /></ProtectedRoute>} />
      <Route path="/dashboard/competitors" element={<ProtectedRoute><Competitors /></ProtectedRoute>} />
      <Route path="/dashboard/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
      <Route path="/dashboard/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
      <Route path="/dashboard/content-studio" element={<ProtectedRoute><ContentStudioPage /></ProtectedRoute>} />
      <Route path="/dashboard/publisher" element={<ProtectedRoute><SocialPublisherPage /></ProtectedRoute>} />
      <Route path="/dashboard/website" element={<ProtectedRoute><WebsiteBuilder /></ProtectedRoute>} />
      
      {/* Shared pages */}
      <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/dashboard/heatmap" element={<ProtectedRoute><HeatMap /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
