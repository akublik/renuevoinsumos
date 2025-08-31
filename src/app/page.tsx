import Header from '@/components/header';
import Footer from '@/components/footer';
import { getPageContent } from '@/lib/page-content-service';
import { homePageContent as defaultContent } from '@/lib/page-content-data';
import type { HomePageContent } from '@/lib/page-content-types';
import { getProductsFromFirestore } from '@/lib/product-service';
import HomePageClient from '@/components/home-page-client';

export default async function Home() {
  // Fetch dynamic content from Firestore, but fall back to default content if none is found.
  const content = await getPageContent<HomePageContent>('home') || defaultContent;
  const featuredProducts = await getProductsFromFirestore(4);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <HomePageClient content={content} featuredProducts={featuredProducts} />
      <Footer />
    </div>
  );
}
