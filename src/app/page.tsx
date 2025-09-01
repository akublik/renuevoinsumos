'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Header from '@/components/header';
import Footer from '@/components/footer';
import { getPageContent } from '@/lib/page-content-service';
import { homePageContent as defaultContent } from '@/lib/page-content-data';
import type { HomePageContent } from '@/lib/page-content-types';
import { getProductsFromFirestore } from '@/lib/product-service';
import type { Product } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24"
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

export default function Home() {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Omit<Product, 'createdAt'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pageContent, products] = await Promise.all([
          getPageContent<HomePageContent>('home'),
          getProductsFromFirestore({ featuredOnly: true, productLimit: 4 })
        ]);
        setContent(pageContent || defaultContent);
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Failed to fetch page data, using defaults.", error);
        setContent(defaultContent);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading || !content) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Skeleton className="h-[70vh] w-full" />
          <div className="container mx-auto px-4 py-16 md:py-24">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Productos Destacados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="relative bg-primary/10 h-[60vh] md:h-[70vh] flex items-center justify-center">
          <Carousel
            className="w-full h-full"
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            opts={{ loop: true }}
          >
            <CarouselContent className="w-full h-full">
              {content.heroImageUrls.map((url, index) => (
                <CarouselItem key={index} className="w-full h-full">
                  <Image
                    src={url}
                    alt={`Banner principal ${index + 1}`}
                    fill
                    className="object-cover w-full h-full"
                    priority={index === 0}
                    data-ai-hint="medical physiotherapy"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
          </Carousel>
          <div className="absolute inset-0 bg-black/50" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-white mb-4 leading-tight">
              {content.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
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
             {featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product as Product} />
                ))}
                </div>
             ) : (
                <div className="text-center text-muted-foreground">
                    <p>No hay productos destacados en este momento. Vuelve a visitar esta sección más tarde.</p>
                </div>
             )}
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
