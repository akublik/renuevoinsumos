
'use client';

import { useState } from 'react';
import { getProductById } from '@/lib/product-service';
import type { Product } from '@/lib/products';
import Image from 'next/image';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';

function ProductClientComponent({ product }: { product: Product | null }) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast({
        title: "Producto agregado",
        description: `"${product.name}" se ha agregado a tu carrito.`,
      });
    }
  };
  
  if (!product) {
    return (
     <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
            <p className="text-muted-foreground mb-6">Lo sentimos, no pudimos encontrar el producto que estás buscando.</p>
            <Button variant="outline" asChild>
                <Link href="/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Catálogo
                </Link>
            </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
            <Button variant="outline" asChild>
                <Link href="/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Catálogo
                </Link>
            </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="aspect-square relative rounded-lg overflow-hidden border shadow-lg">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="space-y-4">
              <Badge variant="secondary">{product.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
              {product.brand && <p className="text-lg text-muted-foreground">{product.brand}</p>}
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
              
              <div className="flex items-baseline gap-4 pt-4">
                 <p className="text-4xl font-bold text-accent">${product.price.toFixed(2)}</p>
                 <p className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Agotado'}
                 </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90" disabled={product.stock === 0} onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Agregar al Carrito
                </Button>
                {product.technicalSheetUrl && (
                  <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                    <a href={product.technicalSheetUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-5 w-5" />
                        Ver Ficha Técnica
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Este es el Componente de Servidor. Es asíncrono y carga los datos.
// No tiene 'use client'.
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  // Pasa los datos cargados al Componente de Cliente para que se renderice.
  return <ProductClientComponent product={product} />
}
