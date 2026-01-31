import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute, PublicRoute } from "@/components/auth/ProtectedRoute";
import { SavedSuppliersProvider } from "@/contexts/SavedSuppliersContext";
import { ConversationsProvider } from "@/contexts/ConversationsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Dashboard sub-pages
import Suppliers from "./pages/dashboard/Suppliers";
import RFQs from "./pages/dashboard/RFQs";
import Conversations from "./pages/dashboard/Conversations";
import SavedSuppliers from "./pages/dashboard/SavedSuppliers";
import Analytics from "./pages/dashboard/Analytics";
import BOM from "./pages/dashboard/BOM";
import Components from "./pages/dashboard/Components";
import Feasibility from "./pages/dashboard/Feasibility";
import GTM from "./pages/dashboard/GTM";
import MarketIntelligence from "./pages/dashboard/MarketIntelligence";
import Pricing from "./pages/dashboard/Pricing";
import Campaigns from "./pages/dashboard/Campaigns";
import WebsiteBuilder from "./pages/dashboard/WebsiteBuilder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <SavedSuppliersProvider>
          <ConversationsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              
              {/* Protected Dashboard routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              
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
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ConversationsProvider>
        </SavedSuppliersProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
