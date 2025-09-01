
'use client';

import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from 'react';

interface HeroCarouselProps {
    images: string[];
}

export default function HeroCarousel({ images }: HeroCarouselProps) {
    const plugin = useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    if (!images || images.length === 0) {
        return (
             <div className="absolute inset-0 z-0 bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No hay imágenes para el carrusel.</p>
            </div>
        )
    }

    return (
        <Carousel
            className="absolute inset-0 z-0 w-full h-full"
            plugins={[plugin.current]}
            opts={{ loop: true }}
          >
            <CarouselContent className="h-full">
              {images.map((url, index) => (
                <CarouselItem key={index} className="h-full relative">
                    <Image
                        src={url}
                        alt={`Banner principal ${index + 1}`}
                        fill
                        className="object-cover w-full h-full"
                        priority={index === 0}
                        data-ai-hint="medical physiotherapy"
                    />
                    <div className="absolute inset-0 bg-black/50 z-10" />
                </CarouselItem>
              ))}
            </CarouselContent>
        </Carousel>
    );
}
