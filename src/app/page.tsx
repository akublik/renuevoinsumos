import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/products';
import ProductCard from '@/components/product-card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { getPageContent } from '@/lib/page-content-service';
import type { HomePageContent } from '@/lib/page-content-types';

// Default content in case Firestore fetch fails or content is not set
const defaultContent: HomePageContent = {
  heroTitle: "Insumos Médicos de Calidad a tu Alcance",
  heroSubtitle: "Explora nuestro catálogo completo de insumos médicos para profesionales y público en general. Confianza y calidad en cada producto.",
  heroButtonText: "Ver Productos",
  whyTitle: "¿Por qué elegirnos?",
  whyDescription: "Ofrecemos una amplia gama de productos médicos de alta calidad, con un servicio al cliente excepcional y entregas rápidas y seguras. Nuestro compromiso es con tu salud y bienestar.",
  whyPoint1: "Calidad Garantizada: Solo trabajamos con las mejores marcas y productos certificados.",
  whyPoint2: "Precios Competitivos: Insumos de primera necesidad a precios justos para todos.",
  whyPoint3: "Asesoramiento Experto: Nuestro equipo está listo para ayudarte a encontrar lo que necesitas."
};


export default async function Home() {
  const featuredProducts = products.slice(0, 4);
  let content = await getPageContent<HomePageContent>('home');

  if (!content) {
    content = defaultContent;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary/10 py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-gray-800 mb-4 leading-tight">
              {content.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {content.heroSubtitle}
            </p>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/products">{content.heroButtonText}</Link>
            </Button>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Productos Destacados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 md:py-24">
          <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.whyTitle}</h2>
                      <p className="text-gray-600 mb-6">
                          {content.whyDescription}
                      </p>
                      <ul className="space-y-4">
                          <li className="flex items-start">
                              <CheckIcon className="h-6 w-6 text-accent mr-3 mt-1 shrink-0" />
                              <span><strong>{content.whyPoint1.split(':')[0]}:</strong> {content.whyPoint1.split(':')[1]}</span>
                          </li>
                          <li className="flex items-start">
                              <CheckIcon className="h-6 w-6 text-accent mr-3 mt-1 shrink-0" />
                              <span><strong>{content.whyPoint2.split(':')[0]}:</strong> {content.whyPoint2.split(':')[1]}</span>
                          </li>
                          <li className="flex items-start">
                              <CheckIcon className="h-6 w-6 text-accent mr-3 mt-1 shrink-0" />
                              <span><strong>{content.whyPoint3.split(':')[0]}:</strong> {content.whyPoint3.split(':')[1]}</span>
                          </li>
                      </ul>
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-xl">
                      <Image
                          src="https://picsum.photos/600/400"
                          alt="Personal médico con insumos"
                          width={600}
                          height={400}
                          className="w-full h-auto object-cover"
                          data-ai-hint="medical staff"
                      />
                  </div>
              </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
