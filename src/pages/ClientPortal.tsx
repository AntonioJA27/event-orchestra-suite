import React, { useState, useEffect } from 'react';
import { User, Calendar, Package, Settings, Star, MessageCircle, CreditCard, CheckCircle, Clock, Mail, Phone, Users } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock de eventos y datos (simplificado para el ejemplo)
const ClientPortal = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailData, setEmailData] = useState({
    email: '',
    subject: '',
    reason: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    subject: '',
    reason: ''
  });
  const [emailjsLoaded, setEmailjsLoaded] = useState(false);

  // Cargar EmailJS dinámicamente
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => {
      window.emailjs.init('kuF4vcRWL6sC8Mh1j'); // Public Key
      setEmailjsLoaded(true);
    };
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const currentClient = {
    name: 'García-López',
    email: 'garcia.lopez@email.com',
    phone: '+52 667 123 4567',
  };

  // Función para validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para validar formulario
  const validateForm = () => {
    const newErrors = { email: '', subject: '', reason: '' };
    let isValid = true;

    if (!emailData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!validateEmail(emailData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
      isValid = false;
    }

    if (!emailData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido';
      isValid = false;
    }

    if (!emailData.reason.trim()) {
      newErrors.reason = 'La descripción es requerida';
      isValid = false;
    } else if (emailData.reason.trim().length < 10) {
      newErrors.reason = 'La descripción debe tener al menos 10 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Función para enviar correo real usando EmailJS
  const sendAutomaticEmail = async () => {
    if (!validateForm()) return;
    if (!emailjsLoaded) {
      alert('Sistema de correos cargando... Intente nuevamente en unos segundos');
      return;
    }

    setSendingEmail(true);

    try {
      // Generar ID del ticket único
      const ticketId = 'BQ' + Math.random().toString(36).substr(2, 6).toUpperCase();

      // Preparar parámetros para EmailJS
      const templateParams = {
        client_name: emailData.email.split('@')[0], // Usar la parte antes del @ como nombre
        ticket_id: ticketId,
        subject: emailData.subject,
        reason: emailData.reason,
        to_email: emailData.email, // Email del destinatario
        from_name: 'BanquetPro Support',
        reply_to: 'banquetpro5@gmail.com'
      };

      console.log('Enviando con parámetros:', templateParams);

      // Toast inicial
      const toast1 = () => {
        const toastEl = document.createElement('div');
        toastEl.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toastEl.textContent = `Generando ticket #${ticketId}...`;
        document.body.appendChild(toastEl);
        setTimeout(() => document.body.removeChild(toastEl), 2000);
      };
      toast1();

      // Enviar correo real usando EmailJS
      const result = await window.emailjs.send(
        'service_u86obhn', // Service ID
        'template_q8o372k', // Template ID correcto
        templateParams
      );

      console.log('Email enviado exitosamente:', result);

      // Toast de éxito del envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      const toast2 = () => {
        const toastEl = document.createElement('div');
        toastEl.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toastEl.textContent = `✅ Correo enviado exitosamente desde banquetpro5@gmail.com`;
        document.body.appendChild(toastEl);
        setTimeout(() => document.body.removeChild(toastEl), 4000);
      };
      toast2();

      // Detalles del correo enviado
      await new Promise(resolve => setTimeout(resolve, 1500));
      const toast3 = () => {
        const toastEl = document.createElement('div');
        toastEl.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toastEl.innerHTML = `
          <div class="text-sm">
            <strong>Correo enviado a:</strong> ${emailData.email}<br/>
            <strong>Ticket ID:</strong> #${ticketId}<br/>
            <strong>Estado:</strong> Enviado ✅
          </div>
        `;
        document.body.appendChild(toastEl);
        setTimeout(() => document.body.removeChild(toastEl), 5000);
      };
      toast3();

      // Toast de éxito final
      await new Promise(resolve => setTimeout(resolve, 1500));
      const toast4 = () => {
        const toastEl = document.createElement('div');
        toastEl.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toastEl.textContent = `🎉 Ticket #${ticketId} creado exitosamente - Revise su bandeja de entrada`;
        document.body.appendChild(toastEl);
        setTimeout(() => document.body.removeChild(toastEl), 6000);
      };
      toast4();

      // Cerrar modal y resetear form
      setIsContactDialogOpen(false);
      setEmailData({ email: '', subject: '', reason: '' });
      setErrors({ email: '', subject: '', reason: '' });

    } catch (error) {
      console.error('Error al enviar correo:', error);
      
      const toastError = () => {
        const toastEl = document.createElement('div');
        toastEl.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toastEl.innerHTML = `
          <div class="text-sm">
            <strong>❌ Error al enviar correo</strong><br/>
            ${error.text || 'Por favor intente nuevamente'}
          </div>
        `;
        document.body.appendChild(toastEl);
        setTimeout(() => document.body.removeChild(toastEl), 5000);
      };
      toastError();
    } finally {
      setSendingEmail(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
          
          {/* Botón principal de contacto */}
          <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                disabled={!emailjsLoaded}
              >
                <Mail className="w-4 h-4 mr-2" />
                {emailjsLoaded ? 'Contactar Soporte' : 'Cargando...'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-amber-600" />
                  <span>Solicitar Soporte BanquetPro</span>
                </DialogTitle>
                <DialogDescription>
                  Complete el formulario para generar su ticket de soporte. Recibirá un correo desde banquetpro5@gmail.com con todos los detalles.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo Electrónico del Cliente</Label>
                  <Input 
                    id="email"
                    placeholder="cliente@ejemplo.com" 
                    type="email"
                    value={emailData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  <p className="text-sm text-slate-500 mt-1">
                    A este correo le llegará un email desde banquetpro5@gmail.com con los detalles del ticket
                  </p>
                </div>

                <div>
                  <Label htmlFor="subject">Asunto del Ticket</Label>
                  <Input 
                    id="subject"
                    placeholder="Ej: Problema con pagos, Modificación de evento, etc." 
                    value={emailData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={errors.subject ? 'border-red-500' : ''}
                  />
                  {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <Label htmlFor="reason">Descripción del Problema o Consulta</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe detalladamente tu problema, consulta o solicitud..."
                    className={`resize-none ${errors.reason ? 'border-red-500' : ''}`}
                    rows={4}
                    value={emailData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                  />
                  {errors.reason && <p className="text-sm text-red-500 mt-1">{errors.reason}</p>}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">¿Cómo funciona?</h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Se genera automáticamente su ticket de soporte</li>
                    <li>2. Recibe un correo desde <strong>banquetpro5@gmail.com</strong> con los detalles</li>
                    <li>3. El correo incluye: ID del ticket, asunto y estado</li>
                    <li>4. Nuestro equipo responderá desde la misma dirección</li>
                  </ol>
                  <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                    <strong>📧 Importante:</strong> Revise su bandeja de spam/promociones si no ve el correo
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsContactDialogOpen(false)}
                    disabled={sendingEmail}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={sendAutomaticEmail}
                    disabled={sendingEmail}
                  >
                    {sendingEmail ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Generando Ticket...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Generar Ticket de Soporte
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Contenido principal del portal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel principal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>Centro de Soporte</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Mail className="w-16 h-16 mx-auto mb-4 text-amber-500" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Sistema de Tickets Automatizado
              </h3>
              <p className="text-slate-600 mb-6">
                Sistema completamente automatizado - Reciba su ticket al instante desde banquetpro5@gmail.com
              </p>
              
              <div className="bg-slate-50 rounded-lg p-6 text-left max-w-md mx-auto">
                <h4 className="font-semibold text-slate-900 mb-3">Proceso de Soporte:</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <span>Generación instantánea del ticket</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <span>Envío automático desde banquetpro5@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <span>Recibe detalles completos del ticket</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                    <span>Todo listo para seguimiento</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel lateral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-amber-600" />
              <span>Información del Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-semibold text-green-800 mb-1">Estado del Sistema</h4>
                <p className="text-sm text-green-700">
                  {emailjsLoaded ? 'Operativo ✅' : 'Cargando... ⏳'}
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 mb-1">Tiempo de Respuesta</h4>
                <p className="text-sm text-blue-700">
                  {emailjsLoaded ? 'Instantáneo ⚡' : 'Preparando...'}
                </p>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h4 className="font-semibold text-amber-800 mb-1">Disponibilidad</h4>
                <p className="text-sm text-amber-700">24/7 - Sistema Automatizado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientPortal;