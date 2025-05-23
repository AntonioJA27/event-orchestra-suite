
import React, { useState } from 'react';
import { User, Calendar, Package, Settings, Star, MessageCircle, CreditCard, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ClientPortal = () => {
  const [selectedEvent, setSelectedEvent] = useState('garcia-wedding');

  const clientEvents = [
    {
      id: 'garcia-wedding',
      name: 'Boda García-López',
      date: '2024-05-28',
      status: 'En preparación',
      progress: 75,
      budget: '$15,000',
      paid: '$10,000',
      remaining: '$5,000'
    }
  ];

  const packages = [
    {
      name: 'Paquete Básico',
      price: '$8,500',
      guests: '50-100',
      includes: ['Menú básico', 'Decoración simple', 'Servicio 6 horas', 'DJ básico']
    },
    {
      name: 'Paquete Premium',
      price: '$15,000',
      guests: '100-200',
      includes: ['Menú gourmet', 'Decoración elegante', 'Servicio completo', 'Orquesta', 'Fotografía']
    },
    {
      name: 'Paquete Luxury',
      price: '$25,000',
      guests: '200-300',
      includes: ['Menú de autor', 'Decoración premium', 'Servicio VIP', 'Entretenimiento completo', 'Video profesional']
    }
  ];

  const menuOptions = [
    { category: 'Entradas', options: ['Canapés variados', 'Tabla de quesos', 'Ceviche', 'Carpaccio'] },
    { category: 'Plato principal', options: ['Salmón a la parrilla', 'Lomo en salsa', 'Pollo relleno', 'Pasta mediterránea'] },
    { category: 'Postres', options: ['Pastel de bodas', 'Mini postres', 'Frutas de temporada', 'Helados artesanales'] }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Portal del Cliente</h1>
          <p className="text-slate-600 mt-1">Personaliza y da seguimiento a tu evento especial</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Cliente Verificado
          </Badge>
        </div>
      </div>

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
                      <label className="text-sm font-medium text-slate-600">Nombre del Evento</label>
                      <p className="text-lg font-semibold text-slate-900">Boda García-López</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Fecha</label>
                      <p className="text-lg font-semibold text-slate-900">28 de Mayo, 2024</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Lugar</label>
                      <p className="text-lg font-semibold text-slate-900">Salón Principal</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Invitados</label>
                      <p className="text-lg font-semibold text-slate-900">200 personas</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-600">Progreso del evento</label>
                      <span className="text-sm font-medium text-amber-600">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800 mb-2">Próximos Pasos</h4>
                    <ul className="space-y-1 text-sm text-amber-700">
                      <li>• Confirmar selección de menú (pendiente)</li>
                      <li>• Reunión final de coordinación - 25 de Mayo</li>
                      <li>• Pago final - antes del 26 de Mayo</li>
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
                  <Button className="w-full justify-start" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contactar Coordinador
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Reunión
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    Modificar Servicios
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Ver Facturación
                  </Button>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-slate-900 mb-3">Tu Coordinador</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Ana Rodríguez</p>
                      <p className="text-sm text-slate-600">Coordinadora Senior</p>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {menuOptions.map((category, index) => (
                  <div key={index}>
                    <h4 className="font-semibold text-slate-900 mb-3">{category.category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                          <input type="checkbox" className="rounded" />
                          <span className="text-slate-700">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <Card key={index} className={`${index === 1 ? 'ring-2 ring-amber-500 shadow-lg' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-center">
                    {pkg.name}
                    {index === 1 && <Badge className="ml-2">Recomendado</Badge>}
                  </CardTitle>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-amber-600">{pkg.price}</span>
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
                  <Button className="w-full mt-4" variant={index === 1 ? 'default' : 'outline'}>
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
                    <span className="text-green-800">Anticipo pagado</span>
                    <span className="font-semibold text-green-800">$10,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-800">Saldo pendiente</span>
                    <span className="font-semibold text-yellow-800">$5,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Total del evento</span>
                    <span className="font-semibold text-slate-900">$15,000</span>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  Realizar Pago Pendiente
                </Button>
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
                    <span className="font-semibold text-green-600">$10,000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-slate-500">
                    <div>
                      <p className="font-medium">Pago final</p>
                      <p className="text-sm">Pendiente</p>
                    </div>
                    <span className="font-semibold">$5,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientPortal;
