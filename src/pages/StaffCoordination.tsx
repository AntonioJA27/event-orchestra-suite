
import React from 'react';
import { Users, Clock, Calendar, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarContent, AvatarFallback } from '@/components/ui/avatar';

const StaffCoordination = () => {
  const staff = [
    { id: 1, name: 'Carlos Mendoza', role: 'Chef Principal', status: 'Disponible', events: 2, rating: 4.9, specialty: 'Cocina Gourmet' },
    { id: 2, name: 'Ana Rodríguez', role: 'Coordinadora', status: 'En evento', events: 5, rating: 4.8, specialty: 'Bodas' },
    { id: 3, name: 'Miguel Santos', role: 'Mesero Senior', status: 'Disponible', events: 8, rating: 4.7, specialty: 'Servicio VIP' },
    { id: 4, name: 'Laura González', role: 'Decoradora', status: 'Ocupada', events: 3, rating: 4.9, specialty: 'Eventos Corporativos' },
    { id: 5, name: 'Roberto Silva', role: 'Bartender', status: 'Disponible', events: 6, rating: 4.6, specialty: 'Cocteles Premium' },
    { id: 6, name: 'Sofia Martinez', role: 'Mesera', status: 'Disponible', events: 4, rating: 4.8, specialty: 'Atención al Cliente' }
  ];

  const upcomingShifts = [
    { event: 'Boda García-López', date: '2024-05-28', staff: ['Carlos Mendoza', 'Ana Rodríguez', 'Miguel Santos'], time: '18:00 - 02:00' },
    { event: 'Evento TechCorp', date: '2024-05-30', staff: ['Laura González', 'Roberto Silva'], time: '19:00 - 23:00' },
    { event: 'Graduación ABC', date: '2024-06-01', staff: ['Sofia Martinez', 'Miguel Santos'], time: '16:00 - 22:00' }
  ];

  const alerts = [
    { type: 'warning', message: 'Chef principal no disponible para evento del 30/05', priority: 'Alta' },
    { type: 'info', message: 'Nuevo mesero requiere entrenamiento', priority: 'Media' },
    { type: 'error', message: 'Falta personal para evento del 1/06', priority: 'Crítica' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'default';
      case 'En evento': return 'secondary';
      case 'Ocupada': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Coordinación de Personal</h1>
          <p className="text-slate-600 mt-1">Gestión y asignación automática de personal según disponibilidad</p>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
          Asignar Personal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Personal Total</p>
                <p className="text-2xl font-bold text-slate-900">156</p>
              </div>
              <Users className="w-8 h-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">89</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">En Evento</p>
                <p className="text-2xl font-bold text-blue-600">45</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">No Disponibles</p>
                <p className="text-2xl font-bold text-red-600">22</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staff List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>Personal Clave</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900">{member.name}</h3>
                      <p className="text-sm text-slate-600">{member.role} • {member.specialty}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-slate-500">{member.events} eventos</span>
                        <span className="text-xs text-amber-600">⭐ {member.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Ver Perfil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Shifts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>Próximos Turnos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingShifts.map((shift, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-900">{shift.event}</h4>
                      <Badge variant="outline">{shift.date}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{shift.time}</p>
                    <div className="space-y-1">
                      {shift.staff.map((person, personIndex) => (
                        <div key={personIndex} className="flex items-center space-x-2 text-sm">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600">{person}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Alertas de Personal</span>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffCoordination;
