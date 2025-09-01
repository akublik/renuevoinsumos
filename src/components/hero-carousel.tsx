
'use client';

import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface HeroCarouselProps {
    images: string[];
}

export default function HeroCarousel({ images }: HeroCarouselProps) {
    if (!images || images.length === 0) {
        return (
             <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No images available for carousel.</p>
            </div>
        )
    }

    return (
        <Carousel
            className="w-full h-full"
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            opts={{ loop: true }}
          >
            <CarouselContent className="w-full h-full">
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
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
        </Carousel>
    );
}
