import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import LegalMentions from "./pages/LegalMentions";
import PharmacyRegistration from "./pages/PharmacyRegistration";
import ScanPrescription from "./pages/ScanPrescription";
import CartPanel from "@/components/CartPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="relative min-h-screen">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/scan" element={<ScanPrescription />} />
            <Route path="/mentions-legales" element={<LegalMentions />} />
            <Route path="/register-pharmacy" element={<PharmacyRegistration />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <div className="absolute bottom-4 right-4 z-50">
          <CartPanel />
        </div>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
