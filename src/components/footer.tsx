import { Phone, MapPin, Mail, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Logo and Copyright */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
             <Link href="/" className="mb-4">
               <Image 
                src="https://firebasestorage.googleapis.com/v0/b/enlaceimagen.firebasestorage.app/o/images%2Ff99575bd-8e4a-4fa3-8c5d-c6068c5c917d-white.png?alt=media&token=872033d5-1a89-49e5-950c-35d2595f992d"
                alt="Insumos Online Logo en Blanco"
                width={200}
                height={50}
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-400 mt-2">
              &copy; {new Date().getFullYear()} Insumos Online. Todos los derechos reservados.
            </p>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-4">
            <h3 className="text-2xl font-bold font-headline mb-4">Contáctenos</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-1 shrink-0 text-gray-300" />
                <div>
                  <p className="font-semibold text-lg">(02) 2335 045</p>
                  <p className="font-semibold text-lg">0989325440</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-1 shrink-0 text-gray-300" />
                <div>
                  <h4 className="font-bold">Ubicación</h4>
                  <p className="text-gray-300">Valle de los Chillos, Sangolquí – Rumiloma</p>
                  <p className="text-gray-300">Panzaleos y Cañaris 2</p>
                </div>
              </div>
               <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-1 shrink-0 text-gray-300" />
                <div>
                  <h4 className="font-bold">Email</h4>
                  <p className="text-gray-300">renuevomedcia@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="md:col-span-4">
            <h3 className="text-2xl font-bold font-headline mb-4 invisible hidden md:block">.</h3> {/* Spacer for alignment */}
             <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-1 shrink-0 text-gray-300" />
                 <div>
                    <h4 className="font-bold">Horario de Atención</h4>
                    <div className="text-gray-300 space-y-1 mt-2">
                        <p><span className="font-semibold text-white">Lunes a Viernes:</span> 07:30 am – 21:00 pm</p>
                        <p><span className="font-semibold text-white">Sábado y Domingo:</span> 08:00 am – 19:00 pm</p>
                        <p><span className="font-semibold text-white">Feriados:</span> 08:00 am – 19:00 pm</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
