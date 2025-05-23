import React, { useState, useEffect } from 'react';
import { Calendar, Users, Package, PieChart, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEvents } from '@/hooks/useEvents';
import { useStaff } from '@/hooks/useStaff';
import { useInventory } from '@/hooks/useInventory';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  availableStaff: number;
  criticalInventory: number;
  monthlyRevenue: number;
  upcomingEvents: any[];
  recentAlerts: any[];
  staffPerformance: any[];
}

const Dashboard = () => {
  const { events, loading: eventsLoading } = useEvents();
  const { staff, loading: staffLoading } = useStaff();
  const { inventory, loading: inventoryLoading } = useInventory();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeEvents: 0,
    availableStaff: 0,
    criticalInventory: 0,
    monthlyRevenue: 0,
    upcomingEvents: [],
    recentAlerts: [],
    staffPerformance: [],
  });

  const loading = eventsLoading || staffLoading || inventoryLoading;

  useEffect(() => {
    // Calculate dashboard statistics
    const activeEvents = events.filter(event => 
      event.status === 'confirmed' || event.status === 'in_preparation'
    ).length;

    const availableStaff = staff.filter(member => 
      member.status === 'available'
    ).length;

    const criticalInventory = inventory.filter(item => 
      item.current_stock <= item.minimum_stock
    ).length;

    const monthlyRevenue = events
      .filter(event => {
        const eventDate = new Date(event.date);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return eventDate.getMonth() === currentMonth && 
               eventDate.getFullYear() === currentYear &&
               event.status === 'completed';
      })
      .reduce((sum, event) => sum + event.budget, 0);

    // Get upcoming events (next 7 days)
    const upcomingEvents = events
      .filter(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);

    // Generate alerts based on current data
    const recentAlerts = [];
    
    // Critical inventory alerts
    const criticalItems = inventory.filter(item => item.current_stock <= item.minimum_stock);
    criticalItems.forEach(item => {
      recentAlerts.push({
        type: item.current_stock === 0 ? 'error' : 'warning',
        message: item.current_stock === 0 
          ? `${item.name} está agotado`
          : `${item.name} tiene stock crítico (${item.current_stock} restantes)`,
        priority: item.current_stock === 0 ? 'Crítica' : 'Alta',
        timestamp: new Date(),
      });
    });

    // Staff availability alerts
    const unavailableStaff = staff.filter(member => member.status === 'unavailable');
    if (unavailableStaff.length > 0) {
      recentAlerts.push({
        type: 'warning',
        message: `${unavailableStaff.length} miembro(s) del personal no disponible(s)`,
        priority: 'Media',
        timestamp: new Date(),
      });
    }

    // Upcoming events without staff assigned
    upcomingEvents.forEach(event => {
      recentAlerts.push({
        type: 'info',
        message: `Evento "${event.name}" próximamente - verificar asignación de personal`,
        priority: 'Media',
        timestamp: new Date(),
      });
    });

    // Top performing staff
    const staffPerformance = staff
      .filter(member => member.total_events > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    setDashboardStats({
      totalEvents: events.length,
      activeEvents,
      availableStaff,
      criticalInventory,
      monthlyRevenue,
      upcomingEvents,
      recentAlerts: recentAlerts.slice(0, 6), // Limit to 6 alerts
      staffPerformance,
    });
  }, [events, staff, inventory]);

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'in_preparation': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getEventStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'in_preparation': return 'En Preparación';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'planning': return 'Planificación';
      default: return status;
    }
  };

  if (loading && events.length === 0 && staff.length === 0 && inventory.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Principal</h1>
          <p className="text-slate-600 mt-1">Gestión integral de eventos y banquetes</p>
        </div>
        <div className="flex space-x-2">
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            Nuevo Evento
          </Button>
          {loading && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <LoadingSpinner size="sm" />
              <span>Actualizando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Eventos Activos</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardStats.activeEvents}</p>
                <p className="text-xs text-slate-500 mt-1">de {dashboardStats.totalEvents} totales</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Personal Disponible</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardStats.availableStaff}</p>
                <p className="text-xs text-slate-500 mt-1">de {staff.length} totales</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Inventario Crítico</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardStats.criticalInventory}</p>
                <p className="text-xs text-slate-500 mt-1">requieren atención</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <Package className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Ingresos del Mes</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${dashboardStats.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">↗ En curso</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Events */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>Próximos Eventos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardStats.upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {dashboardStats.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{event.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(event.date), 'dd MMM yyyy', { locale: es })}</span>
                        </span>
                        <span>{event.guests_count} invitados</span>
                        <span>{event.venue}</span>
                      </div>
                    </div>
                    <Badge variant={getEventStatusColor(event.status)}>
                      {getEventStatusLabel(event.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No hay eventos próximos programados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Alertas</span>
              {dashboardStats.recentAlerts.length > 0 && (
                <Badge variant="destructive">{dashboardStats.recentAlerts.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardStats.recentAlerts.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {dashboardStats.recentAlerts.map((alert, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'error' ? 'border-red-500 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        alert.priority === 'Crítica' ? 'bg-red-100 text-red-800' :
                        alert.priority === 'Alta' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{alert.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
                <p>No hay alertas pendientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Staff Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-600" />
              <span>Personal Destacado</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardStats.staffPerformance.length > 0 ? (
              <div className="space-y-4">
                {dashboardStats.staffPerformance.map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
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
                      <p className="text-sm font-semibold text-slate-900">{member.total_events} eventos</p>
                      <p className="text-sm text-amber-600">⭐ {member.rating.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No hay datos de desempeño disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-amber-600" />
              <span>Estado del Inventario</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Items Totales</span>
                <span className="text-lg font-bold text-slate-900">{inventory.length}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Stock Normal</span>
                  <span className="text-green-600">
                    {inventory.filter(item => item.current_stock > item.minimum_stock).length}
                  </span>
                </div>
                <Progress 
                  value={((inventory.filter(item => item.current_stock > item.minimum_stock).length) / inventory.length) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Stock Crítico</span>
                  <span className="text-yellow-600">{dashboardStats.criticalInventory}</span>
                </div>
                <Progress 
                  value={(dashboardStats.criticalInventory / inventory.length) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Sin Stock</span>
                  <span className="text-red-600">
                    {inventory.filter(item => item.current_stock === 0).length}
                  </span>
                </div>
                <Progress 
                  value={(inventory.filter(item => item.current_stock === 0).length / inventory.length) * 100} 
                  className="h-2"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Valor Total</span>
                  <span className="text-lg font-bold text-green-600">
                    ${inventory.reduce((sum, item) => sum + (item.current_stock * (item.unit_cost || 0)), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;