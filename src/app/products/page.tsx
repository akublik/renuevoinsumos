
import { getProductsFromFirestore } from '@/lib/product-service';
import { categories } from '@/lib/products';
import ProductCard from '@/components/product-card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PRODUCTS_PER_PAGE = 9;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const allProducts = await getProductsFromFirestore();
  
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);

  const paginatedProducts = allProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Nuestro Catálogo</h1>
            <p className="text-lg text-muted-foreground mt-2">Encuentra todo lo que necesitas en un solo lugar.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {categories.map(category => (
                            <li key={category}>
                                <Button variant="ghost" className="w-full justify-start" asChild>
                                    <Link href="#">{category}</Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
          </aside>
          <section className="w-full md:w-3/4 lg:w-4/5">
            {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-16">
                    <p>No se encontraron productos. Intenta agregar algunos desde el panel de administración.</p>
                </div>
            )}
            
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                    <Button variant="outline" asChild disabled={currentPage <= 1}>
                        <Link href={`/products?page=${currentPage - 1}`}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Anterior
                        </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button variant="outline" asChild disabled={currentPage >= totalPages}>
                        <Link href={`/products?page=${currentPage + 1}`}>
                            Siguiente
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
