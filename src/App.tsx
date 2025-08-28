import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter, HashRouter } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Anamnesis from "./pages/Anamnesis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const isNative = Capacitor.isNativePlatform();
const Router = isNative ? HashRouter : BrowserRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute requireAuth>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auth"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Auth />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
