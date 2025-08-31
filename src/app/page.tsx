import Header from '@/components/header';
import Footer from '@/components/footer';
import { getPageContent } from '@/lib/page-content-service';
import { homePageContent as defaultContent } from '@/lib/page-content-data';
import type { HomePageContent } from '@/lib/page-content-types';
import { products } from '@/lib/products';
import HomePageClient from '@/components/home-page-client';

export default async function Home() {
  const content = await getPageContent<HomePageContent>('home') || defaultContent;
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <HomePageClient content={content} featuredProducts={featuredProducts} />
      <Footer />
    </div>
  );
}
