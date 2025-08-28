import { products, categories } from '@/lib/products';
import ProductCard from '@/components/product-card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
