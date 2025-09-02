
import Header from '@/components/header';
import Footer from '@/components/footer';
import Image from 'next/image';
import { getPageContent } from '@/lib/page-content-service';
import type { AboutPageContent } from '@/lib/page-content-types';
import { aboutPageContent as defaultContent } from '@/lib/page-content-data';
import { Card, CardContent } from '@/components/ui/card';

export default async function AboutPage() {
  const content = (await getPageContent<AboutPageContent>('about')) || defaultContent;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="relative w-full h-[50vh] bg-muted flex items-center justify-center">
          {content.heroImageUrl && (
            <Image
              src={content.heroImageUrl}
              alt="Banner de la página Nosotros"
              fill
              className="object-cover"
              priority
              data-ai-hint="medical technology"
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold font-headline drop-shadow-lg">{content.heroTitle}</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mt-4 drop-shadow-md">{content.heroSubtitle}</p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={content.aboutImageUrl || 'https://picsum.photos/600/500'}
                  alt="Equipo de Insumos Online"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                  data-ai-hint="medical team"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.aboutTitle}</h2>
                <p
                  className="text-gray-600 mb-6 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: content.aboutDescription.replace(/\n/g, '<br />') }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{content.teamTitle}</h2>
            {content.team && content.team.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {content.team.map((member, index) => (
                  <Card key={index} className="text-center overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <CardContent className="p-0">
                      <div className="aspect-square relative">
                         <Image
                          src={member.imageUrl || 'https://picsum.photos/400/400'}
                          alt={`Foto de ${member.name}`}
                          fill
                          className="object-cover"
                          data-ai-hint="person portrait"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                        <p className="text-muted-foreground">{member.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
