
'use client';

import Link from 'next/link';
import { HeartPulse, Package, Home, FileEdit, ShoppingCart, BarChart3 } from 'lucide-react';
import Header from '@/components/header';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Espera a que termine la carga

    if (!user) {
      // Si no hay usuario, redirige al login
      router.push('/login');
      return;
    }

    // Si el usuario no es el admin, redirige a la página de inicio
    if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/');
    }

  }, [user, loading, router]);

  // Muestra un estado de carga mientras se verifica el usuario y su rol
  if (loading || !user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Verificando acceso...</div>
      </div>
    );
  }

  // Si todo es correcto, muestra el layout del admin
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-grow">
        <aside className="w-64 bg-gray-50 border-r p-4 hidden md:block">
          <nav className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg mb-2 font-headline">
              Administración
            </h3>
             <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Package className="h-4 w-4" />
              Productos
            </Link>
             <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <ShoppingCart className="h-4 w-4" />
              Pedidos
            </Link>
            <Link
              href="/admin/pages"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <FileEdit className="h-4 w-4" />
              Páginas
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Home className="h-4 w-4" />
              Volver al Sitio
            </Link>
          </nav>
        </aside>
        <main className="flex-1 bg-background p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}


export default function ProtectedAdminLayout({ children }: { children: React.ReactNode; }) {
    // This is a client component that will be wrapped by the AuthProvider
    // in the root layout.
    return <AdminLayout>{children}</AdminLayout>;
}
