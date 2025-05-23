import React, { useState, useEffect } from 'react';
import { PieChart, TrendingUp, BarChart3, Calendar, DollarSign, Users, Star, Download, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useEvents';
import { useStaff } from '@/hooks/useStaff';
import { useInventory } from '@/hooks/useInventory';
import { useApi } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface RevenueData {
  month: string;
  revenue: number;
  events_count: number;
  profit_margin: number;
}

interface EventTypeStats {
  event_type: string;
  count: number;
  revenue: number;
  percentage: number;
  avg_budget: number;
}

interface StaffPerformanceData {
  name: string;
  role: string;
  events_handled: number;
  rating: number;
  revenue_generated: number;
  efficiency_score: number;
}

interface ClientMetrics {
  total_clients: number;
  returning_clients: number;
  new_clients: number;
  retention_rate: number;
  avg_event_value: number;
}

const Analytics = () => {
  const { events, loading: eventsLoading } = useEvents();
  const { staff, loading: staffLoading } = useStaff();
  const { inventory, loading: inventoryLoading } = useInventory();
  const { execute: fetchAnalytics, loading: analyticsLoading } = useApi();
  
  const [dateRange, setDateRange] = useState('6-months');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [eventTypeStats, setEventTypeStats] = useState<EventTypeStats[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformanceData[]>([]);
  const [clientMetrics, setClientMetrics] = useState<ClientMetrics>({
    total_clients: 0,
    returning_clients: 0,
    new_clients: 0,
    retention_rate: 0,
    avg_event_value: 0,
  });

  const loading = eventsLoading || staffLoading || inventoryLoading || analyticsLoading;

  useEffect(() => {
    calculateAnalytics();
  }, [events, staff, inventory, dateRange]);

  const calculateAnalytics = () => {
    if (events.length === 0) return;

    // Calculate date range
    const endDate = new Date();
    const monthsBack = dateRange === '3-months' ? 3 : dateRange === '6-months' ? 6 : 12;
    const startDate = subMonths(endDate, monthsBack);

    // Filter events within date range
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return isWithinInterval(eventDate, { start: startDate, end: endDate });
    });

    // Calculate monthly revenue data
    const monthlyData: RevenueData[] = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(endDate, i));
      const monthEnd = endOfMonth(subMonths(endDate, i));
      
      const monthEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
      });

      const monthRevenue = monthEvents.reduce((sum, event) => sum + event.budget, 0);
      const profitMargin = monthRevenue > 0 ? Math.random() * 20 + 25 : 0; // Mock profit margin 25-45%

      monthlyData.push({
        month: format(monthStart, 'MMM yyyy', { locale: es }),
        revenue: monthRevenue,
        events_count: monthEvents.length,
        profit_margin: profitMargin,
      });
    }
    setRevenueData(monthlyData);

    // Calculate event type statistics
    const eventTypeMap = new Map<string, { count: number; revenue: number }>();
    filteredEvents.forEach(event => {
      const current = eventTypeMap.get(event.event_type) || { count: 0, revenue: 0 };
      eventTypeMap.set(event.event_type, {
        count: current.count + 1,
        revenue: current.revenue + event.budget,
      });
    });

    const totalRevenue = filteredEvents.reduce((sum, event) => sum + event.budget, 0);
    const eventTypeStatsData: EventTypeStats[] = Array.from(eventTypeMap.entries()).map(([type, data]) => ({
      event_type: type,
      count: data.count,
      revenue: data.revenue,
      percentage: filteredEvents.length > 0 ? (data.count / filteredEvents.length) * 100 : 0,
      avg_budget: data.count > 0 ? data.revenue / data.count : 0,
    })).sort((a, b) => b.revenue - a.revenue);

    setEventTypeStats(eventTypeStatsData);

    // Calculate staff performance (mock data enhanced with real staff info)
    const staffPerformanceData: StaffPerformanceData[] = staff.map(member => ({
      name: member.name,
      role: member.role,
      events_handled: member.total_events,
      rating: member.rating,
      revenue_generated: member.total_events * (Math.random() * 5000 + 3000), // Mock revenue
      efficiency_score: Math.min(member.rating * 20 + Math.random() * 10, 100),
    })).sort((a, b) => b.rating - a.rating).slice(0, 6);

    setStaffPerformance(staffPerformanceData);

    // Calculate client metrics (mock data based on events)
    const uniqueClients = new Set(filteredEvents.map(event => event.client_id)).size;
    const avgEventValue = totalRevenue / filteredEvents.length || 0;
    
    setClientMetrics({
      total_clients: uniqueClients,
      returning_clients: Math.floor(uniqueClients * 0.68), // Mock 68% retention
      new_clients: Math.floor(uniqueClients * 0.32), // Mock 32% new clients
      retention_rate: 68,
      avg_event_value: avgEventValue,
    });
  };

  const handleExportData = async () => {
    try {
      await fetchAnalytics(
        async () => {
          // Mock export functionality
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Create CSV content
          const csvContent = [
            ['Mes', 'Ingresos', 'Eventos', 'Margen'],
            ...revenueData.map(row => [
              row.month,
              row.revenue.toString(),
              row.events_count.toString(),
              row.profit_margin.toFixed(1) + '%'
            ])
          ].map(row => row.join(',')).join('\n');

          // Download CSV
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);

          return { success: true };
        },
        {
          successMessage: 'Datos exportados exitosamente',
          showSuccessToast: true,
        }
      );
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const totalRevenue = revenueData.reduce((sum, data) => sum + data.revenue, 0);
  const totalEvents = revenueData.reduce((sum, data) => sum + data.events_count, 0);
  const avgMonthlyRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;
  const avgProfitMargin = revenueData.length > 0 
    ? revenueData.reduce((sum, data) => sum + data.profit_margin, 0) / revenueData.length 
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard de Análisis</h1>
          <p className="text-slate-600 mt-1">Análisis de rentabilidad, satisfacción del cliente y desempeño operacional</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3-months">Últimos 3 meses</SelectItem>
              <SelectItem value="6-months">Últimos 6 meses</SelectItem>
              <SelectItem value="12-months">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="outline"
            onClick={calculateAnalytics}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  Promedio: ${avgMonthlyRevenue.toLocaleString()}/mes
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Eventos Completados</p>
                <p className="text-2xl font-bold text-blue-600">{totalEvents}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {revenueData.length > 0 ? (totalEvents / revenueData.length).toFixed(1) : 0} eventos/mes
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Satisfacción Cliente</p>
                <p className="text-2xl font-bold text-amber-600">4.7</p>
                <p className="text-xs text-amber-600 mt-1">⭐ Promedio general</p>
              </div>
              <Star className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Margen de Ganancia</p>
                <p className="text-2xl font-bold text-purple-600">{avgProfitMargin.toFixed(1)}%</p>
                <p className="text-xs text-purple-600 mt-1">Promedio del período</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              <span>Tendencia de Ingresos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-16 text-sm font-medium text-slate-600">{data.month}</span>
                      <div className="flex-1 w-40">
                        <Progress 
                          value={totalRevenue > 0 ? (data.revenue / Math.max(...revenueData.map(d => d.revenue))) * 100 : 0} 
                          className="h-3" 
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">${data.revenue.toLocaleString()}</p>
                      <div className="flex items-center space-x-2 text-xs text-slate-600">
                        <span>{data.events_count} eventos</span>
                        <Badge variant="outline" className="text-xs">
                          {data.profit_margin.toFixed(1)}% margen
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-amber-600" />
              <span>Distribución por Tipo de Evento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {eventTypeStats.map((type, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">{type.event_type}</span>
                      <span className="text-sm text-slate-600">{type.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={type.percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{type.count} eventos</span>
                      <span>${type.revenue.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Promedio: ${type.avg_budget.toLocaleString()}/evento
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Staff Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>Rendimiento del Personal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {staffPerformance.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{member.name}</h4>
                        <p className="text-sm text-slate-600">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{member.events_handled} eventos</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-amber-600">⭐ {member.rating.toFixed(1)}</span>
                        <Badge variant="outline" className="text-xs">
                          {member.efficiency_score.toFixed(0)}% eficiencia
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-600" />
              <span>Métricas de Clientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{clientMetrics.retention_rate}%</p>
                <p className="text-sm text-slate-600 mt-1">Tasa de retención</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Clientes recurrentes</span>
                    <span className="font-medium">{clientMetrics.returning_clients}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Clientes nuevos</span>
                    <span className="font-medium">{clientMetrics.new_clients}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total de clientes</span>
                    <span className="font-medium">{clientMetrics.total_clients}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Valor promedio por evento</span>
                  <span className="text-lg font-bold text-green-600">
                    ${clientMetrics.avg_event_value.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Distribución de clientes</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Corporativos</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Bodas</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Eventos sociales</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eficiencia Operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Tiempo promedio de setup</span>
                <span className="text-sm font-medium">2.3 horas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Utilización de personal</span>
                <span className="text-sm font-medium text-green-600">
                  {staff.filter(s => s.status === 'available' || s.status === 'on_event').length > 0 
                    ? Math.round((staff.filter(s => s.status === 'on_event').length / staff.filter(s => s.status === 'available' || s.status === 'on_event').length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Items críticos en inventario</span>
                <span className="text-sm font-medium text-red-600">
                  {inventory.filter(item => item.current_stock <= item.minimum_stock).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proyección del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Eventos programados</span>
                <span className="text-sm font-medium">
                  {events.filter(event => {
                    const eventDate = new Date(event.date);
                    const today = new Date();
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    return eventDate >= today && eventDate <= endOfMonth;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Ingresos proyectados</span>
                <span className="text-sm font-medium text-green-600">
                  ${events.filter(event => {
                    const eventDate = new Date(event.date);
                    const today = new Date();
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    return eventDate >= today && eventDate <= endOfMonth;
                  }).reduce((sum, event) => sum + event.budget, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Personal disponible</span>
                <span className="text-sm font-medium text-blue-600">
                  {staff.filter(s => s.status === 'available').length}/{staff.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Indicadores de Calidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Satisfacción promedio</span>
                <span className="text-sm font-medium text-amber-600">⭐ 4.7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Eventos sin incidencias</span>
                <span className="text-sm font-medium text-green-600">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Tiempo de respuesta promedio</span>
                <span className="text-sm font-medium">2.4 horas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;