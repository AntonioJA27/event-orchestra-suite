
import React from 'react';
import { PieChart, TrendingUp, BarChart3, Calendar, DollarSign, Users, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const Analytics = () => {
  const monthlyRevenue = [
    { month: 'Ene', revenue: 85000, events: 12 },
    { month: 'Feb', revenue: 92000, events: 15 },
    { month: 'Mar', revenue: 78000, events: 11 },
    { month: 'Abr', revenue: 105000, events: 18 },
    { month: 'May', revenue: 125000, events: 24 },
  ];

  const eventTypes = [
    { type: 'Bodas', count: 45, revenue: 450000, percentage: 60 },
    { type: 'Corporativo', count: 18, revenue: 180000, percentage: 24 },
    { type: 'Graduaciones', count: 8, revenue: 80000, percentage: 11 },
    { type: 'Celebraciones', count: 4, revenue: 40000, percentage: 5 },
  ];

  const topStaff = [
    { name: 'Ana Rodríguez', role: 'Coordinadora', events: 15, rating: 4.9 },
    { name: 'Carlos Mendoza', role: 'Chef Principal', events: 12, rating: 4.8 },
    { name: 'Miguel Santos', role: 'Mesero Senior', events: 18, rating: 4.7 },
    { name: 'Laura González', role: 'Decoradora', events: 10, rating: 4.9 },
  ];

  const clientSatisfaction = [
    { category: 'Calidad de comida', score: 4.8, percentage: 96 },
    { category: 'Servicio al cliente', score: 4.7, percentage: 94 },
    { category: 'Decoración', score: 4.6, percentage: 92 },
    { category: 'Puntualidad', score: 4.9, percentage: 98 },
    { category: 'Relación calidad-precio', score: 4.5, percentage: 90 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard de Análisis</h1>
        <p className="text-slate-600 mt-1">Análisis de rentabilidad, satisfacción del cliente y desempeño operacional</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Ingresos del Mes</p>
                <p className="text-2xl font-bold text-green-600">$125,000</p>
                <p className="text-xs text-green-600 mt-1">+15% vs mes anterior</p>
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
                <p className="text-2xl font-bold text-blue-600">24</p>
                <p className="text-xs text-blue-600 mt-1">+33% vs mes anterior</p>
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
                <p className="text-2xl font-bold text-purple-600">32%</p>
                <p className="text-xs text-purple-600 mt-1">+2% vs mes anterior</p>
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
            <div className="space-y-4">
              {monthlyRevenue.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-12 text-sm font-medium text-slate-600">{data.month}</span>
                    <div className="flex-1 w-32">
                      <Progress value={(data.revenue / 125000) * 100} className="h-2" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">${data.revenue.toLocaleString()}</p>
                    <p className="text-xs text-slate-600">{data.events} eventos</p>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {eventTypes.map((type, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">{type.type}</span>
                    <span className="text-sm text-slate-600">{type.percentage}%</span>
                  </div>
                  <Progress value={type.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{type.count} eventos</span>
                    <span>${type.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Staff Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>Desempeño del Personal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStaff.map((staff, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">{staff.name}</h4>
                    <p className="text-sm text-slate-600">{staff.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{staff.events} eventos</p>
                    <p className="text-sm text-amber-600">⭐ {staff.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-600" />
              <span>Satisfacción del Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientSatisfaction.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">{item.category}</span>
                    <span className="text-sm font-semibold text-amber-600">{item.score}</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
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
                <span className="text-sm font-medium">2.5 horas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Utilización de personal</span>
                <span className="text-sm font-medium text-green-600">87%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Desperdicios de comida</span>
                <span className="text-sm font-medium text-green-600">3.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clientes Recurrentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">68%</p>
              <p className="text-sm text-slate-600 mt-1">de clientes regresan</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Nuevos clientes</span>
                  <span className="font-medium">32%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Referidos</span>
                  <span className="font-medium">45%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proyección Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Eventos programados</span>
                <span className="text-sm font-medium">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Ingresos proyectados</span>
                <span className="text-sm font-medium text-green-600">$145,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Capacidad utilizada</span>
                <span className="text-sm font-medium text-blue-600">76%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
