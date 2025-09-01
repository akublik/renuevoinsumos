import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Chatbot from '@/components/chatbot';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';

export const metadata: Metadata = {
  title: 'Insumos Online',
  description: 'Venta de insumos médicos.',
};
// Forcing a server restart to apply config changes
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <Chatbot />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
