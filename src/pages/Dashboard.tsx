
import React from 'react';
import { Calendar, Users, Package, PieChart, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const stats = [
    { title: 'Eventos Activos', value: '24', icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Personal Disponible', value: '156', icon: Users, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'Inventario Crítico', value: '8', icon: Package, color: 'text-red-600', bgColor: 'bg-red-50' },
    { title: 'Ingresos del Mes', value: '$125,500', icon: TrendingUp, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  ];

  const upcomingEvents = [
    { id: 1, name: 'Boda García-López', date: '2024-05-28', status: 'En preparación', guests: 200, venue: 'Salón Principal' },
    { id: 2, name: 'Evento Corporativo TechCorp', date: '2024-05-30', status: 'Confirmado', guests: 150, venue: 'Salón Ejecutivo' },
    { id: 3, name: 'Graduación Universidad ABC', date: '2024-06-01', status: 'Planificación', guests: 300, venue: 'Gran Salón' },
    { id: 4, name: 'Cumpleaños 50 - Sr. Martínez', date: '2024-06-03', status: 'Confirmado', guests: 80, venue: 'Terraza' },
  ];

  const alerts = [
    { type: 'warning', message: 'Manteles blancos agotándose (quedan 15)' },
    { type: 'error', message: 'Chef principal no disponible para evento del 30/05' },
    { type: 'info', message: 'Nueva cotización pendiente de aprobación' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Principal</h1>
          <p className="text-slate-600 mt-1">Gestión integral de eventos y banquetes</p>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
          Nuevo Evento
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{event.name}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{event.date}</span>
                      </span>
                      <span>{event.guests} invitados</span>
                      <span>{event.venue}</span>
                    </div>
                  </div>
                  <Badge variant={
                    event.status === 'Confirmado' ? 'default' :
                    event.status === 'En preparación' ? 'secondary' : 'outline'
                  }>
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Alertas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'border-red-500 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <p className="text-sm text-slate-700">{alert.message}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium text-slate-900 mb-3">Tareas Pendientes</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-slate-600">Confirmar menú con cliente García</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-slate-600">Revisar decoración TechCorp</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-slate-600">Asignar personal para graduación</span>
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
