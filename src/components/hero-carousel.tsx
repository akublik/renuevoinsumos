
'use client';

import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from 'react';
import type { CarouselApi } from "@/components/ui/carousel";

interface HeroCarouselProps {
    images: string[];
}

export default function HeroCarousel({ images }: HeroCarouselProps) {
    const plugin = useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    if (!images || images.length === 0) {
        return (
             <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No hay imágenes para el carrusel.</p>
            </div>
        )
    }

    return (
        <Carousel
            className="absolute inset-0 w-full h-full"
            plugins={[plugin.current]}
            opts={{ loop: true }}
          >
            <CarouselContent className="w-full h-full embla-fade">
              {images.map((url, index) => (
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
        </Carousel>
    );
}
