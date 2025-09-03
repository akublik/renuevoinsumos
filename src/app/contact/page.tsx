
'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendContactFormEmailAction } from '@/lib/actions';

export default function ContactPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await sendContactFormEmailAction(formData);

    if (result.success) {
      toast({
        title: '¡Mensaje Enviado!',
        description: 'Gracias por contactarnos. Te responderemos lo antes posible.',
      });
      (event.target as HTMLFormElement).reset();
    } else {
      toast({
        title: 'Error al enviar',
        description: result.error || 'Hubo un problema al enviar tu mensaje.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
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
                      <Input id="name" name="name" placeholder="Tu nombre completo" required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input id="email" name="email" type="email" placeholder="tu@correo.com" required disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input id="subject" name="subject" placeholder="Ej: Consulta sobre un producto" required disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea id="message" name="message" placeholder="Escribe tu mensaje aquí..." rows={5} required disabled={isLoading} />
                  </div>
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
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
        <div className="container mx-auto px-4 mt-16">
            <h2 className="text-3xl font-bold font-headline text-center mb-8">Nuestra Ubicación</h2>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-xl border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.659929259223!2d-78.4747093!3d-0.3269687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d5bd2cb5c27c45%3A0xe0cbc330d6f94fe7!2sRenuevo%20Centro%20de%20Especialidades%20Medicas!5e0!3m2!1ses-419!2sec!4v1628186291642!5m2!1ses-419!2sec"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
      </main>
      <Footer />
    </div>
  );
}
