
import React, { useState } from 'react';
import { Calendar, Plus, Search, Filter, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EventPlanning = () => {
  const [viewMode, setViewMode] = useState('list');
  
  const events = [
    {
      id: 1,
      name: 'Boda García-López',
      date: '2024-05-28',
      time: '18:00',
      venue: 'Salón Principal',
      guests: 200,
      status: 'En preparación',
      client: 'María García',
      budget: '$15,000',
      type: 'Boda'
    },
    {
      id: 2,
      name: 'Evento Corporativo TechCorp',
      date: '2024-05-30',
      time: '19:00',
      venue: 'Salón Ejecutivo',
      guests: 150,
      status: 'Confirmado',
      client: 'TechCorp S.A.',
      budget: '$12,500',
      type: 'Corporativo'
    },
    {
      id: 3,
      name: 'Graduación Universidad ABC',
      date: '2024-06-01',
      time: '16:00',
      venue: 'Gran Salón',
      guests: 300,
      status: 'Planificación',
      client: 'Universidad ABC',
      budget: '$20,000',
      type: 'Graduación'
    },
    {
      id: 4,
      name: 'Cumpleaños 50 - Sr. Martínez',
      date: '2024-06-03',
      time: '20:00',
      venue: 'Terraza',
      guests: 80,
      status: 'Confirmado',
      client: 'Roberto Martínez',
      budget: '$8,500',
      type: 'Celebración'
    }
  ];

  const venues = [
    { name: 'Salón Principal', capacity: 250, available: true },
    { name: 'Salón Ejecutivo', capacity: 180, available: true },
    { name: 'Gran Salón', capacity: 400, available: false },
    { name: 'Terraza', capacity: 120, available: true },
    { name: 'Jardín', capacity: 200, available: true }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Eventos</h1>
          <p className="text-slate-600 mt-1">Planifica y coordina eventos con disponibilidad en tiempo real</p>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nuevo Evento</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input placeholder="Buscar eventos..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="planning">En planificación</SelectItem>
                <SelectItem value="preparation">En preparación</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="wedding">Bodas</SelectItem>
                <SelectItem value="corporate">Corporativo</SelectItem>
                <SelectItem value="graduation">Graduación</SelectItem>
                <SelectItem value="celebration">Celebración</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Events List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>Eventos Programados</span>
              </span>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  Lista
                </Button>
                <Button 
                  variant={viewMode === 'calendar' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  Calendario
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{event.name}</h3>
                        <Badge variant={
                          event.status === 'Confirmado' ? 'default' :
                          event.status === 'En preparación' ? 'secondary' : 'outline'
                        }>
                          {event.status}
                        </Badge>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{event.guests} invitados</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-slate-600">Cliente: </span>
                          <span className="font-medium text-slate-900">{event.client}</span>
                        </div>
                        <div className="text-sm font-semibold text-amber-600">
                          {event.budget}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Venue Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              <span>Disponibilidad de Espacios</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {venues.map((venue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">{venue.name}</h4>
                    <p className="text-sm text-slate-600">Cap. {venue.capacity} personas</p>
                  </div>
                  <Badge variant={venue.available ? 'default' : 'destructive'}>
                    {venue.available ? 'Disponible' : 'Ocupado'}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium text-slate-900 mb-3">Recursos Críticos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Personal de servicio</span>
                  <span className="font-medium text-green-600">85% disponible</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Equipo de cocina</span>
                  <span className="font-medium text-yellow-600">60% disponible</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Mobiliario</span>
                  <span className="font-medium text-red-600">40% disponible</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventPlanning;
