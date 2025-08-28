import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
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
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" placeholder="Tu nombre completo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input id="email" type="email" placeholder="tu@correo.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input id="subject" placeholder="Ej: Consulta sobre un producto" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea id="message" placeholder="Escribe tu mensaje aquí..." rows={5} />
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
                    <div className="flex items-center gap-4">
                        <MapPin className="h-6 w-6 text-accent" />
                        <span>Av. Principal 123, Ciudad, País</span>
                    </div>
                     <div className="flex items-center gap-4">
                        <Phone className="h-6 w-6 text-accent" />
                        <span>+1 (234) 567-890</span>
                    </div>
                     <div className="flex items-center gap-4">
                        <Mail className="h-6 w-6 text-accent" />
                        <span>contacto@insumosonline.com</span>
                    </div>
                </div>
                <div className="pt-4">
                    <h3 className="text-2xl font-bold font-headline mb-2">Horario de Atención</h3>
                    <p className="text-muted-foreground">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground">Sábados: 9:00 AM - 1:00 PM</p>
                </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}