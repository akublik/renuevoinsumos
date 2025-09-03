'use client';

import Image from 'next/image';
import type { Product } from '@/lib/products';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent the link from navigating
    e.stopPropagation(); // Stop event bubbling
    addToCart(product);
    toast({
      title: "Producto agregado",
      description: `"${product.name}" se ha agregado a tu carrito.`,
    });
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group">
       <Link href={`/products/${product.id}`} className="flex flex-col h-full">
            <CardHeader className="p-0">
                <div className="aspect-square overflow-hidden relative">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="medical supply"
                />
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col">
                <Badge variant="secondary" className="mb-2 self-start">{product.category}</Badge>
                <CardTitle className="text-lg font-headline font-semibold mb-2 h-14 line-clamp-2">{product.name}</CardTitle>
                <p className="text-2xl font-bold text-accent mt-auto">${product.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 mt-auto">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar al Carrito
                </Button>
            </CardFooter>
      </Link>
    </Card>
  );
}
