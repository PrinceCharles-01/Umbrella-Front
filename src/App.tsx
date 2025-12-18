import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IndexMobile from "./pages/IndexMobile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import LegalMentions from "./pages/LegalMentions";
import PharmacyRegistration from "./pages/PharmacyRegistration";
import ScanPrescription from "./pages/ScanPrescription";
import CartPanel from "@/components/CartPanel";
import MobileLayout from "@/components/MobileLayout";
import { useIsNativeMobile } from "@/hooks/useIsMobile";

const queryClient = new QueryClient();

const AppContent = () => {
  const isNativeMobile = useIsNativeMobile();

  return (
    <div className="relative min-h-screen">
      <BrowserRouter>
        <Routes>
          {/* Mobile routes */}
          {isNativeMobile ? (
            <>
              <Route path="/" element={<MobileLayout><IndexMobile /></MobileLayout>} />
              <Route path="/admin" element={<MobileLayout><Admin /></MobileLayout>} />
              <Route path="/scan" element={<MobileLayout><ScanPrescription /></MobileLayout>} />
              <Route path="/mentions-legales" element={<MobileLayout><LegalMentions /></MobileLayout>} />
              <Route path="/register-pharmacy" element={<MobileLayout><PharmacyRegistration /></MobileLayout>} />
              <Route path="*" element={<MobileLayout><NotFound /></MobileLayout>} />
            </>
          ) : (
            /* Web routes */
            <>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/scan" element={<ScanPrescription />} />
              <Route path="/mentions-legales" element={<LegalMentions />} />
              <Route path="/register-pharmacy" element={<PharmacyRegistration />} />
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
      {!isNativeMobile && (
        <div className="absolute bottom-4 right-4 z-50">
          <CartPanel />
        </div>
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
