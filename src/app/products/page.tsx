
import { getProductsFromFirestore } from '@/lib/product-service';
import { categories } from '@/lib/products';
import ProductCard from '@/components/product-card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductCategory } from '@/lib/products';
import { cn } from '@/lib/utils';

const PRODUCTS_PER_PAGE = 9;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const allProducts = await getProductsFromFirestore();
  const currentPage = Number(searchParams?.page) || 1;
  const currentCategory = searchParams?.category as ProductCategory | undefined;

  const filteredProducts = currentCategory 
    ? allProducts.filter(product => product.category === currentCategory)
    : allProducts;
  
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (currentCategory) {
      params.set('category', currentCategory);
    }
    params.set('page', pageNumber.toString());
    return `/products?${params.toString()}`;
  };
  
  const createCategoryURL = (category: string | null) => {
      const params = new URLSearchParams();
      params.set('page', '1'); // Reset to first page on category change
      if (category) {
          params.set('category', category);
      }
      return `/products?${params.toString()}`;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Nuestra Tienda</h1>
            <p className="text-lg text-muted-foreground mt-2">Encuentra todo lo que necesitas en un solo lugar.</p>
        </div>

        <div className="flex justify-center flex-wrap gap-2 mb-12">
            <Button variant={!currentCategory ? 'default' : 'outline'} asChild>
                <Link href={createCategoryURL(null)}>Mostrar Todo</Link>
            </Button>
            {categories.map(category => (
                <Button key={category} variant={currentCategory === category ? 'default' : 'outline'} asChild>
                    <Link href={createCategoryURL(category)}>{category}</Link>
                </Button>
            ))}
        </div>

        <section className="w-full">
            {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-16">
                    <p>No se encontraron productos para esta categoría. Intenta con otra o mostrando todos.</p>
                </div>
            )}
            
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                    <Button variant="outline" asChild disabled={currentPage <= 1}>
                        <Link href={createPageURL(currentPage - 1)}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Anterior
                        </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button variant="outline" asChild disabled={currentPage >= totalPages}>
                        <Link href={createPageURL(currentPage + 1)}>
                            Siguiente
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
