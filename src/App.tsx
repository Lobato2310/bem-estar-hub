import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Anamnesis from "./pages/Anamnesis";
import AccessPending from "./pages/AccessPending";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { initializeDeepLinks } from "./capacitor";
import { OfflineNotice } from "@/components/OfflineNotice";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize deep links for mobile
    initializeDeepLinks();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <OfflineNotice />
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route
              path="/auth"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Auth />
                </ProtectedRoute>
              }
            />
            <Route
              path="/access-pending"
              element={
                <ProtectedRoute requireAuth>
                  <AccessPending />
                </ProtectedRoute>
              }
            />
            <Route
              path="/anamnesis"
              element={
                <ProtectedRoute requireAuth requireSubscription>
                  <Anamnesis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute requireAuth requireSubscription requireAnamnesis>
                  <Index />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
