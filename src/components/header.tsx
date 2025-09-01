
"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { HeartPulse, Search, User, ShoppingCart, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { logoutUser } from "@/lib/auth-service";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import CartDrawer from "./cart-drawer";
import { Badge } from "./ui/badge";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { cartItems, setIsCartOpen } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
  };

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/products", label: "Productos" },
    { href: "/about", label: "Nosotros" },
    { href: "/contact", label: "Contacto" },
    ...(user ? [{ href: "/admin/products", label: "Admin" }] : []),
  ];
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="https://firebasestorage.googleapis.com/v0/b/enlaceimagen.firebasestorage.app/o/images%2Ff99575bd-8e4a-4fa3-8c5d-c6068c5c917d.png?alt=media&token=5b671a9d-40e9-492f-879b-5971d19882ff"
              alt="Insumos Online Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="font-bold text-xl font-headline">Insumos Online</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar productos..." className="pl-10 w-48" />
            </div>
            {user ? (
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar Sesión">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Cerrar Sesión</span>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" asChild title="Iniciar Sesión">
                <Link href="/login">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Iniciar Sesión</span>
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(true)} className="relative">
                {totalItems > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{totalItems}</Badge>
                )}
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Carrito</span>
            </Button>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                     <Image 
                      src="https://firebasestorage.googleapis.com/v0/b/enlaceimagen.firebasestorage.app/o/images%2Ff99575bd-8e4a-4fa3-8c5d-c6068c5c917d.png?alt=media&token=5b671a9d-40e9-492f-879b-5971d19882ff"
                      alt="Insumos Online Logo"
                      width={40}
                      height={40}
                      className="h-10 w-auto"
                    />
                    <span className="font-bold text-xl font-headline">Insumos Online</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                    <span className="sr-only">Cerrar menú</span>
                  </Button>
                </div>
                <nav className="flex flex-col gap-4 p-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto p-4 border-t space-y-4">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="search" placeholder="Buscar..." className="pl-10" />
                    </div>
                  {user ? (
                    <Button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full">
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <User className="mr-2 h-4 w-4" /> Iniciar Sesión
                      </Link>
                    </Button>
                  )}
                   <Button variant="outline" className="w-full" onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}>
                       <ShoppingCart className="mr-2 h-4 w-4" /> Ver Carrito ({totalItems})
                   </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
