// src/hooks/useAnalytics.ts
import { useState } from 'react';
import { apiRequest, API_ENDPOINTS, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface RevenueData {
  month: string;
  revenue: number;
  events_count: number;
}

export interface EventTypeStats {
  event_type: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface AnalyticsData {
  monthly_revenue: RevenueData[];
  event_types: EventTypeStats[];
  total_events: number;
  total_revenue: number;
  average_satisfaction: number;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnalyticsSummary = async (params?: {
    start_date?: string;
    end_date?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams();
      if (params?.start_date) searchParams.set('start_date', params.start_date);
      if (params?.end_date) searchParams.set('end_date', params.end_date);
      
      const url = `${API_ENDPOINTS.analytics.summary()}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      const data = await apiRequest<AnalyticsData>(url);
      
      setAnalytics(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error fetching analytics';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async (format: 'csv' | 'pdf' = 'csv') => {
    setLoading(true);
    
    try {
      // This would be implemented if the backend supports export endpoints
      // For now, we'll create a simple CSV export on the frontend
      if (!analytics) {
        toast({
          title: 'Error',
          description: 'No hay datos para exportar',
          variant: 'destructive',
        });
        return;
      }

      const csvContent = [
        ['Mes', 'Ingresos', 'Eventos'],
        ...analytics.monthly_revenue.map(row => [
          row.month,
          row.revenue.toString(),
          row.events_count.toString(),
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Éxito',
        description: 'Datos exportados exitosamente',
      });
    } catch (error) {
      const errorMessage = 'Error exporting analytics';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    error,
    fetchAnalyticsSummary,
    exportAnalytics,
  };
}