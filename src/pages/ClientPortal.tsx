import React, { useState, useEffect } from 'react';
import { User, Calendar, Package, Settings, Star, MessageCircle, CreditCard, CheckCircle, Clock, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useEvents, Event } from '@/hooks/useEvents';
import { useApi } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientEvent extends Event {
  progress: number;
  paid_amount: number;
  remaining_amount: number;
  coordinator: {
    name: string;
    email: string;
    phone: string;
  };
}

interface Package {
  id: string;
  name: string;
  price: number;
  guests: string;
  includes: string[];
  popular?: boolean;
}

interface CustomizationOption {
  id: string;
  category: string;
  name: string;
  description?: string;
  price?: number;
  selected?: boolean;
}

const ClientPortal = () => {
  const { events, loading } = useEvents();
  const [clientEvents, setClientEvents] = useState<ClientEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ClientEvent | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [customizations, setCustomizations] = useState<CustomizationOption[]>([]);
  const { execute: sendMessage, loading: sendingMessage } = useApi();
  const { execute: processPayment, loading: processingPayment } = useApi();

  // Mock data - In real app, this would come from API based on authenticated client
  const currentClient = {
    id: 1,
    name: 'García-López',
    email: 'garcia.lopez@email.com',
    phone: '+52 667 123 4567',
    verified: true,
  };

  const packages: Package[] = [
    {
      id: 'basic',
      name: 'Paquete Básico',
      price: 8500,
      guests: '50-100',
      includes: ['Menú básico', 'Decoración simple', 'Servicio 6 horas', 'DJ básico']
    },
    {
      id: 'premium',
      name: 'Paquete Premium',
      price: 15000,
      guests: '100-200',
      includes: ['Menú gourmet', 'Decoración elegante', 'Servicio completo', 'Orquesta', 'Fotografía'],
      popular: true
    },
    {
      id: 'luxury',
      name: 'Paquete Luxury',
      price: 25000,
      guests: '200-300',
      includes: ['Menú de autor', 'Decoración premium', 'Servicio VIP', 'Entretenimiento completo', 'Video profesional']
    }
  ];

  useEffect(() => {
    // Filter events for current client and add additional data
    const clientEventsData = events
      .filter(event => event.client_id === currentClient.id)
      .map(event => ({
        ...event,
        progress: Math.floor(Math.random() * 40) + 60, // Mock progress 60-100%
        paid_amount: Math.floor(event.budget * 0.5), // Mock 50% paid
        remaining_amount: Math.floor(event.budget * 0.5), // Mock 50% remaining
        coordinator: {
          name: 'Ana Rodríguez',
          email: 'ana.rodriguez@banquetpro.com',
          phone: '+52 667 234 5678',
        }
      }));
    
    setClientEvents(clientEventsData);
    if (clientEventsData.length > 0 && !selectedEvent) {
      setSelectedEvent(clientEventsData[0]);
    }
  }, [events]);

  useEffect(() => {
    // Load customization options
    const mockCustomizations: CustomizationOption[] = [
      { id: '1', category: 'Entradas', name: 'Canapés variados', price: 150 },
      { id: '2', category: 'Entradas', name: 'Tabla de quesos', price: 200 },
      { id: '3', category: 'Entradas', name: 'Ceviche', price: 180 },
      { id: '4', category: 'Plato principal', name: 'Salmón a la parrilla', price: 350 },
      { id: '5', category: 'Plato principal', name: 'Lomo en salsa', price: 400 },
      { id: '6', category: 'Plato principal', name: 'Pollo relleno', price: 280 },
      { id: '7', category: 'Postres', name: 'Pastel de bodas', price: 500 },
      { id: '8', category: 'Postres', name: 'Mini postres', price: 200 },
      { id: '9', category: 'Bebidas', name: 'Barra libre premium', price: 800 },
      { id: '10', category: 'Decoración', name: 'Arreglos florales', price: 600 },
    ];
    setCustomizations(mockCustomizations);
  }, []);

  const handleSendMessage = async (data: { subject: string; message: string }) => {
    try {
      await sendMessage(
        async () => {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          return { success: true };
        },
        {
          successMessage: 'Mensaje enviado exitosamente',
          showSuccessToast: true,
        }
      );
      setIsMessageDialogOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handlePayment = async (amount: number) => {
    try {
      await processPayment(
        async () => {
          // Mock payment processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          return { success: true, transaction_id: `TXN${Date.now()}` };
        },
        {
          successMessage: `Pago de $${amount.toLocaleString()} procesado exitosamente`,
          showSuccessToast: true,
        }
      );
      setIsPaymentDialogOpen(false);
      // Update event data
      if (selectedEvent) {
        const updatedEvent = {
          ...selectedEvent,
          paid_amount: selectedEvent.paid_amount + amount,
          remaining_amount: selectedEvent.remaining_amount - amount,
        };
        setSelectedEvent(updatedEvent);
        setClientEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedEvent : e));
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleCustomizationChange = (optionId: string, selected: boolean) => {
    setCustomizations(prev => prev.map(option => 
      option.id === optionId ? { ...option, selected } : option
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'in_preparation': return 'secondary';
      case 'planning': return 'outline';
      case 'completed': return 'default';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'in_preparation': return 'En Preparación';
      case 'planning': return 'Planificación';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const selectedCustomizations = customizations.filter(option => option.selected);
  const customizationTotal = selectedCustomizations.reduce((sum, option) => sum + (option.price || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (clientEvents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No tienes eventos programados</h2>
          <p className="text-slate-600 mb-6">Contacta con nuestro equipo para programar tu próximo evento.</p>
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            Contactar Equipo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Portal del Cliente</h1>
          <p className="text-slate-600 mt-1">Bienvenido, {currentClient.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Cliente Verificado
          </Badge>
        </div>
      </div>

      {/* Event Selector */}
      {clientEvents.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Mis Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedEvent?.id === event.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <h3 className="font-semibold text-slate-900">{event.name}</h3>
                  <p className="text-sm text-slate-600">{format(new Date(event.date), 'dd MMM yyyy', { locale: es })}</p>
                  <Badge variant={getStatusColor(event.status)} className="mt-2">
                    {getStatusLabel(event.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedEvent && (
        <Tabs defaultValue="event-details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="event-details">Mi Evento</TabsTrigger>
            <TabsTrigger value="customization">Personalización</TabsTrigger>
            <TabsTrigger value="packages">Paquetes</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
          </TabsList>

          <TabsContent value="event-details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Event Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <span>Resumen del Evento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Nombre del Evento</Label>
                        <p className="text-lg font-semibold text-slate-900">{selectedEvent.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Fecha</Label>
                        <p className="text-lg font-semibold text-slate-900">
                          {format(new Date(selectedEvent.date), 'dd MMMM yyyy', { locale: es })}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Lugar</Label>
                        <p className="text-lg font-semibold text-slate-900">{selectedEvent.venue}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Invitados</Label>
                        <p className="text-lg font-semibold text-slate-900">{selectedEvent.guests_count} personas</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium text-slate-600">Progreso del evento</Label>
                        <span className="text-sm font-medium text-amber-600">{selectedEvent.progress}%</span>
                      </div>
                      <Progress value={selectedEvent.progress} className="h-3" />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-800 mb-2">Próximos Pasos</h4>
                      <ul className="space-y-1 text-sm text-amber-700">
                        <li className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Confirmar selección de menú - Pendiente</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Reunión final de coordinación - 25 de Mayo</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4" />
                          <span>Pago final - antes del 26 de Mayo</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-amber-600" />
                    <span>Acciones Rápidas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full justify-start" variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contactar Coordinador
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Contactar Coordinador</DialogTitle>
                          <DialogDescription>
                            Envía un mensaje a tu coordinador de eventos.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleSendMessage({
                            subject: formData.get('subject') as string,
                            message: formData.get('message') as string,
                          });
                        }}>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="subject">Asunto</Label>
                              <Input id="subject" name="subject" placeholder="Asunto del mensaje" required />
                            </div>
                            <div>
                              <Label htmlFor="message">Mensaje</Label>
                              <Textarea id="message" name="message" placeholder="Escribe tu mensaje aquí..." required />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button type="submit" disabled={sendingMessage}>
                              {sendingMessage ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                              Enviar Mensaje
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Reunión
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Package className="w-4 h-4 mr-2" />
                      Modificar Servicios
                    </Button>
                    
                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full justify-start" variant="outline">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Realizar Pago
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Procesar Pago</DialogTitle>
                          <DialogDescription>
                            Realizar pago pendiente para {selectedEvent.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                              <span>Monto pendiente:</span>
                              <span className="font-bold">${selectedEvent.remaining_amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                              <span>Total del evento:</span>
                              <span>${selectedEvent.budget.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            onClick={() => handlePayment(selectedEvent.remaining_amount)}
                            disabled={processingPayment}
                          >
                            {processingPayment ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                            Pagar ${selectedEvent.remaining_amount.toLocaleString()}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium text-slate-900 mb-3">Tu Coordinador</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{selectedEvent.coordinator.name}</p>
                          <p className="text-sm text-slate-600">Coordinadora Senior</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{selectedEvent.coordinator.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{selectedEvent.coordinator.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalización del Menú</CardTitle>
                <div className="text-sm text-slate-600">
                  Selecciona las opciones adicionales para tu evento
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(
                    customizations.reduce((acc, option) => {
                      if (!acc[option.category]) acc[option.category] = [];
                      acc[option.category].push(option);
                      return acc;
                    }, {} as Record<string, CustomizationOption[]>)
                  ).map(([category, options]) => (
                    <div key={category}>
                      <h4 className="font-semibold text-slate-900 mb-3">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                            <Checkbox
                              id={option.id}
                              checked={option.selected || false}
                              onCheckedChange={(checked) => handleCustomizationChange(option.id, checked as boolean)}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={option.id}
                                className="text-slate-700 cursor-pointer"
                              >
                                {option.name}
                              </label>
                              {option.price && (
                                <div className="text-sm text-slate-500">
                                  +${option.price.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCustomizations.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-semibold text-slate-900 mb-3">Resumen de Personalizaciones</h4>
                    <div className="space-y-2">
                      {selectedCustomizations.map((option) => (
                        <div key={option.id} className="flex justify-between text-sm">
                          <span>{option.name}</span>
                          <span>${option.price?.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total adicional:</span>
                        <span>${customizationTotal.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4">
                      Guardar Personalizaciones
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className={pkg.popular ? 'ring-2 ring-amber-500 shadow-lg' : ''}>
                  <CardHeader>
                    <CardTitle className="text-center">
                      {pkg.name}
                      {pkg.popular && <Badge className="ml-2">Recomendado</Badge>}
                    </CardTitle>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-amber-600">${pkg.price.toLocaleString()}</span>
                      <p className="text-sm text-slate-600 mt-1">{pkg.guests} invitados</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pkg.includes.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-4" variant={pkg.popular ? 'default' : 'outline'}>
                      Seleccionar Paquete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Pagos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800">Monto pagado</span>
                      <span className="font-semibold text-green-800">${selectedEvent.paid_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-800">Saldo pendiente</span>
                      <span className="font-semibold text-yellow-800">${selectedEvent.remaining_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-700">Total del evento</span>
                      <span className="font-semibold text-slate-900">${selectedEvent.budget.toLocaleString()}</span>
                    </div>
                  </div>
                  {selectedEvent.remaining_amount > 0 && (
                    <Button 
                      className="w-full mt-4"
                      onClick={() => setIsPaymentDialogOpen(true)}
                    >
                      Realizar Pago Pendiente
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historial de Transacciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">Anticipo inicial</p>
                        <p className="text-sm text-slate-600">15 de Abril, 2024</p>
                      </div>
                      <span className="font-semibold text-green-600">${selectedEvent.paid_amount.toLocaleString()}</span>
                    </div>
                    {selectedEvent.remaining_amount > 0 && (
                      <div className="flex justify-between items-center py-2 text-slate-500">
                        <div>
                          <p className="font-medium">Pago final</p>
                          <p className="text-sm">Pendiente</p>
                        </div>
                        <span className="font-semibold">${selectedEvent.remaining_amount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ClientPortal;