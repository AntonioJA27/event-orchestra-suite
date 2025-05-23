
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './Dashboard';
import ClientPortal from './ClientPortal';
import EventPlanning from './EventPlanning';
import InventoryManagement from './InventoryManagement';
import StaffCoordination from './StaffCoordination';
import Analytics from './Analytics';
import Navigation from '../components/Navigation';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

const Index = () => {
  return (
    <QueryClientProvider client={queryClient}>
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
          </Routes>
        </main>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
};

export default Index;
