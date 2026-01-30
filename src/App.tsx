import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
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
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Buyer mode pages */}
            <Route path="/dashboard/suppliers" element={<Suppliers />} />
            <Route path="/dashboard/rfqs" element={<RFQs />} />
            <Route path="/dashboard/conversations" element={<Conversations />} />
            <Route path="/dashboard/saved" element={<SavedSuppliers />} />
            
            {/* Producer mode pages */}
            <Route path="/dashboard/bom" element={<BOM />} />
            <Route path="/dashboard/components" element={<Components />} />
            <Route path="/dashboard/feasibility" element={<Feasibility />} />
            <Route path="/dashboard/gtm" element={<GTM />} />
            
            {/* Seller mode pages */}
            <Route path="/dashboard/market" element={<MarketIntelligence />} />
            <Route path="/dashboard/pricing" element={<Pricing />} />
            <Route path="/dashboard/campaigns" element={<Campaigns />} />
            <Route path="/dashboard/website" element={<WebsiteBuilder />} />
            
            {/* Shared pages */}
            <Route path="/dashboard/analytics" element={<Analytics />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
