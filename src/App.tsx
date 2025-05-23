
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ClientPortal from "./pages/ClientPortal";
import EventPlanning from "./pages/EventPlanning";
import InventoryManagement from "./pages/InventoryManagement";
import StaffCoordination from "./pages/StaffCoordination";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <Navigation />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/client-portal" element={<ClientPortal />} />
              <Route path="/events" element={<EventPlanning />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/staff" element={<StaffCoordination />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Toaster />
          <Sonner />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
