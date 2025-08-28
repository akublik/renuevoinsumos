import Link from "next/link";
import { HeartPulse, Package, Home } from "lucide-react";
import Header from "@/components/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-grow">
            <aside className="w-64 bg-gray-50 border-r p-4 hidden md:block">
                <nav className="flex flex-col gap-2">
                    <h3 className="font-semibold text-lg mb-2 font-headline">Administración</h3>
                    <Link href="/admin/products" className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary transition-all hover:text-primary">
                        <Package className="h-4 w-4" />
                        Productos
                    </Link>
                    <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                        <Home className="h-4 w-4" />
                        Volver al Sitio
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 bg-background p-4 md:p-8">
                {children}
            </main>
        </div>
    </div>
  );
}
