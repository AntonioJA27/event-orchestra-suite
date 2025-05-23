import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Search, 
  Filter,
  Eye,
  Clock,
  Users,
  MapPin,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import custom hooks and components
import { useEvents, Event, EventFormData } from '@/hooks/useEvents';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Zod schema for form validation
const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  client_id: z.coerce.number().int().positive("Client ID must be a positive integer"),
  event_type: z.string().min(1, "Event type is required"),
  date: z.date({ required_error: "Event date is required." }),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time format (HH:MM)"),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time format (HH:MM)"),
  venue: z.string().min(1, "Venue is required"),
  guests_count: z.coerce.number().int().nonnegative("Guests count cannot be negative"),
  budget: z.coerce.number().positive("Budget must be a positive number"),
  notes: z.string().optional(),
});

type EventFormType = z.infer<typeof eventFormSchema>;

// Mock client data - In real app, this would come from a clients API
const MOCK_CLIENTS = [
    { id: 1, name: "García-López" },
    { id: 2, name: "TechCorp Solutions" },
    { id: 3, name: "Universidad ABC" },
    { id: 4, name: "Familia Martínez" },
];

const VENUES = [
  "Salón Principal",
  "Salón Ejecutivo", 
  "Gran Salón",
  "Terraza",
  "Jardín Principal",
  "Salón VIP"
];

const EVENT_TYPES = [
  "Boda",
  "Evento Corporativo",
  "Graduación",
  "Cumpleaños",
  "Conferencia",
  "Reunión Social",
  "Celebración",
];

const EventPlanningPage: React.FC = () => {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useEvents();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; event: Event | null }>({
    open: false,
    event: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const form = useForm<EventFormType>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      client_id: undefined,
      event_type: "",
      start_time: "09:00",
      end_time: "17:00",
      venue: "",
      guests_count: 0,
      budget: 1000,
      notes: "",
    },
  });

  const handleCreateEvent = async (values: EventFormType) => {
    try {
      // Format date and combine with time for ISO 8601 strings
      const eventDate = values.date;
      
      const [startHour, startMinute] = values.start_time.split(':').map(Number);
      const startDate = new Date(eventDate);
      startDate.setHours(startHour, startMinute, 0, 0);

      const [endHour, endMinute] = values.end_time.split(':').map(Number);
      const endDate = new Date(eventDate);
      endDate.setHours(endHour, endMinute, 0, 0);

      const payload: EventFormData = {
        ...values,
        date: eventDate.toISOString().split('T')[0],
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      };

      await createEvent(payload);
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Create event error:", error);
    }
  };

  const handleEditEvent = async (values: EventFormType) => {
    if (!editingEvent) return;
    
    try {
      const eventDate = values.date;
      
      const [startHour, startMinute] = values.start_time.split(':').map(Number);
      const startDate = new Date(eventDate);
      startDate.setHours(startHour, startMinute, 0, 0);

      const [endHour, endMinute] = values.end_time.split(':').map(Number);
      const endDate = new Date(eventDate);
      endDate.setHours(endHour, endMinute, 0, 0);

      const payload = {
        ...values,
        date: eventDate.toISOString().split('T')[0],
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      };

      await updateEvent(editingEvent.id, payload);
      setEditingEvent(null);
      form.reset();
    } catch (error) {
      console.error("Update event error:", error);
    }
  };

  const handleDeleteEvent = async () => {
    if (deleteConfirm.event) {
      try {
        await deleteEvent(deleteConfirm.event.id);
        setDeleteConfirm({ open: false, event: null });
      } catch (error) {
        console.error("Delete event error:", error);
      }
    }
  };

  const openEditDialog = (event: Event) => {
    const eventDate = new Date(event.date);
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    form.reset({
      name: event.name,
      client_id: event.client_id,
      event_type: event.event_type,
      date: eventDate,
      start_time: format(startTime, 'HH:mm'),
      end_time: format(endTime, 'HH:mm'),
      venue: event.venue,
      guests_count: event.guests_count,
      budget: event.budget,
      notes: event.notes || "",
    });
    setEditingEvent(event);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'in_preparation': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'in_preparation': return 'En Preparación';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'planning': return 'Planificación';
      default: return status;
    }
  };

  const getClientName = (clientId: number) => {
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    return client ? client.name : `Cliente #${clientId}`;
  };

  // Filter events based on search and status
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getClientName(event.client_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const eventColumns = [
    {
      key: 'name',
      header: 'Evento',
      render: (event: Event) => (
        <div>
          <div className="font-semibold text-slate-900">{event.name}</div>
          <div className="text-sm text-slate-600">{event.event_type}</div>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Cliente',
      render: (event: Event) => (
        <div className="text-sm text-slate-700">
          {getClientName(event.client_id)}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Fecha',
      render: (event: Event) => (
        <div>
          <div className="font-medium">{format(new Date(event.date), 'dd MMM yyyy', { locale: es })}</div>
          <div className="text-sm text-slate-600 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
          </div>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Detalles',
      render: (event: Event) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center text-slate-600">
            <MapPin className="w-3 h-3 mr-1" />
            {event.venue}
          </div>
          <div className="flex items-center text-slate-600">
            <Users className="w-3 h-3 mr-1" />
            {event.guests_count} invitados
          </div>
          <div className="flex items-center text-slate-600">
            <DollarSign className="w-3 h-3 mr-1" />
            ${event.budget.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (event: Event) => (
        <Badge variant={getStatusColor(event.status)}>
          {getStatusLabel(event.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (event: Event) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewingEvent(event)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEditDialog(event)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setDeleteConfirm({ open: true, event })}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Eventos</h1>
          <p className="text-slate-600 mt-1">Administra y coordina todos tus eventos</p>
        </div>
        <Button 
          onClick={() => {
            form.reset();
            setIsCreateDialogOpen(true);
          }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Nuevo Evento
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Buscar eventos por nombre, cliente o venue..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="planning">Planificación</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="in_preparation">En Preparación</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Table */}
      <DataTable
        data={filteredEvents}
        columns={eventColumns}
        loading={loading}
        emptyMessage="No se encontraron eventos"
        caption="Lista de todos los eventos programados"
      />

      {/* Create/Edit Event Dialog */}
      <Dialog open={isCreateDialogOpen || !!editingEvent} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingEvent(null);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}</DialogTitle>
            <DialogDescription>
              {editingEvent ? 'Actualiza los detalles del evento.' : 'Completa los detalles para crear un nuevo evento.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(editingEvent ? handleEditEvent : handleCreateEvent)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Boda García-López" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOCK_CLIENTS.map(client => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="event_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Evento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EVENT_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar venue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VENUES.map(venue => (
                            <SelectItem key={venue} value={venue}>
                              {venue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha del Evento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0,0,0,0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Inicio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Fin</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guests_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Invitados</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Presupuesto ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="5000.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Requisitos especiales o detalles adicionales..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingEvent(null);
                    form.reset();
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  {editingEvent ? 'Actualizar' : 'Crear'} Evento
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Event Details Dialog */}
      <Dialog open={!!viewingEvent} onOpenChange={(open) => !open && setViewingEvent(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Evento</DialogTitle>
          </DialogHeader>
          {viewingEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900">Nombre</h4>
                  <p className="text-slate-600">{viewingEvent.name}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Cliente</h4>
                  <p className="text-slate-600">{getClientName(viewingEvent.client_id)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Tipo</h4>
                  <p className="text-slate-600">{viewingEvent.event_type}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Estado</h4>
                  <Badge variant={getStatusColor(viewingEvent.status)}>
                    {getStatusLabel(viewingEvent.status)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Fecha</h4>
                  <p className="text-slate-600">{format(new Date(viewingEvent.date), 'dd MMMM yyyy', { locale: es })}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Horario</h4>
                  <p className="text-slate-600">
                    {format(new Date(viewingEvent.start_time), 'HH:mm')} - {format(new Date(viewingEvent.end_time), 'HH:mm')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Venue</h4>
                  <p className="text-slate-600">{viewingEvent.venue}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Invitados</h4>
                  <p className="text-slate-600">{viewingEvent.guests_count} personas</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Presupuesto</h4>
                  <p className="text-slate-600">${viewingEvent.budget.toLocaleString()}</p>
                </div>
              </div>
              {viewingEvent.notes && (
                <div>
                  <h4 className="font-semibold text-slate-900">Notas</h4>
                  <p className="text-slate-600">{viewingEvent.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, event: deleteConfirm.event })}
        title="Eliminar Evento"
        description={`¿Estás seguro de que quieres eliminar el evento "${deleteConfirm.event?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={handleDeleteEvent}
        variant="destructive"
        loading={loading}
      />
    </div>
  );
};

export default EventPlanningPage;