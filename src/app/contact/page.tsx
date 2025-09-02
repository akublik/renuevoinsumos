
'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { toast } = useToast();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Aquí iría la lógica para enviar el correo a través de un servicio.
    // Por ahora, mostraremos una notificación de éxito.
    toast({
      title: '¡Mensaje Enviado!',
      description: 'Gracias por contactarnos. Te responderemos lo antes posible.',
    });
    // Opcionalmente, resetear el formulario
    (event.target as HTMLFormElement).reset();
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Contáctanos</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Estamos aquí para ayudarte. Rellena el formulario o utiliza nuestros datos de contacto.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-headline">Envíanos un Mensaje</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleFormSubmit}>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" name="name" placeholder="Tu nombre completo" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input id="email" name="email" type="email" placeholder="tu@correo.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input id="subject" name="subject" placeholder="Ej: Consulta sobre un producto" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea id="message" name="message" placeholder="Escribe tu mensaje aquí..." rows={5} required />
                  </div>
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-8">
                <h2 className="text-3xl font-bold font-headline">Información de Contacto</h2>
                <div className="space-y-4 text-lg">
                    <div className="flex items-start gap-4">
                        <MapPin className="h-6 w-6 text-accent mt-1 shrink-0" />
                        <div>
                            <span className="font-semibold">Ubicación</span>
                            <p className="text-base text-muted-foreground">Valle de los Chillos, Sangolquí – Rumiloma<br/>Panzaleos y Cañaris 2</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-accent mt-1 shrink-0" />
                        <div>
                            <span className="font-semibold">Teléfonos</span>
                            <p className="text-base text-muted-foreground">02-2335 045 / 0989325440</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Mail className="h-6 w-6 text-accent mt-1 shrink-0" />
                        <div>
                             <span className="font-semibold">Email</span>
                            <p className="text-base text-muted-foreground">renuevomedcia@gmail.com</p>
                        </div>
                    </div>
                </div>
                <div className="pt-4">
                    <h3 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><Clock className="h-6 w-6 text-accent"/> Horario de Atención</h3>
                    <div className="space-y-2 text-base text-muted-foreground">
                        <p><span className="font-semibold text-foreground">Lunes a Viernes:</span> 07:30 am – 21:00 pm</p>
                        <p><span className="font-semibold text-foreground">Sábado y Domingo:</span> 08:00 am – 19:00 pm</p>
                        <p><span className="font-semibold text-foreground">Feriados:</span> 08:00 am – 19:00 pm</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
