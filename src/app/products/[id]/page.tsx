
import { getProductById } from '@/lib/product-service';
import ProductDetailView from '@/components/product-detail-view';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Este es el COMPONENTE DE SERVIDOR.
// Es asíncrono y se encarga de cargar los datos.
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

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

  // Pasa los datos ya cargados al componente de cliente para que los renderice.
  return <ProductDetailView product={product} />;
}
