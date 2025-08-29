import Header from '@/components/header';
import Footer from '@/components/footer';
import Image from 'next/image';
import { Truck, ShieldCheck, Award } from 'lucide-react';
import type { AboutPageContent } from '@/lib/page-content-types';


const content: AboutPageContent = {
  heroTitle: "Nuestra Misión es tu Bienestar",
  heroSubtitle: "Comprometidos con la salud, ofrecemos insumos médicos de la más alta calidad para profesionales y el público en general.",
  aboutTitle: "Sobre Insumos Online",
  aboutDescription: "Desde nuestra fundación, nos hemos dedicado a ser el puente entre la innovación médica y quienes la necesitan. Seleccionamos cuidadosamente cada producto, asegurando que cumpla con los estándares más rigurosos de calidad y seguridad. Nuestro equipo de expertos está siempre disponible para brindar asesoramiento y garantizar que encuentres exactamente lo que buscas. Creemos en un servicio al cliente excepcional, precios justos y una logística eficiente para que recibas tus insumos a tiempo, siempre.",
  value1Title: "Calidad Superior",
  value1Desc: "Solo ofrecemos productos que cumplen con las más altas certificaciones de calidad y seguridad.",
  value2Title: "Confianza y Seguridad",
  value2Desc: "Tu salud es nuestra prioridad. Garantizamos la procedencia y efectividad de cada insumo.",
  value3Title: "Servicio Eficiente",
  value3Desc: "Procesamos y enviamos tus pedidos con la mayor rapidez para que nunca te falte lo que necesitas."
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary/10 py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-gray-800 mb-4">
              {content.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {content.heroSubtitle}
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="https://picsum.photos/600/500"
                  alt="Equipo de Insumos Online"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                  data-ai-hint="medical team"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.aboutTitle}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.aboutDescription.replace(/\n/g, '<br />') }} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 md:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Nuestros Valores</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <Award className="h-12 w-12 text-accent mb-4" />
                        <h3 className="text-xl font-bold mb-2">{content.value1Title}</h3>
                        <p className="text-muted-foreground">{content.value1Desc}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <ShieldCheck className="h-12 w-12 text-accent mb-4" />
                        <h3 className="text-xl font-bold mb-2">{content.value2Title}</h3>
                        <p className="text-muted-foreground">{content.value2Desc}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Truck className="h-12 w-12 text-accent mb-4" />
                        <h3 className="text-xl font-bold mb-2">{content.value3Title}</h3>
                        <p className="text-muted-foreground">{content.value3Desc}</p>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
