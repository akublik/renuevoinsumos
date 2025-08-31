'use client';

import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus, Minus, Trash2 } from 'lucide-react';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader className="pr-6">
          <SheetTitle className="text-2xl font-headline">Tu Carrito</SheetTitle>
        </SheetHeader>
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1 my-4 -mx-6 px-6">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col flex-1 justify-between py-1">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-lg font-bold text-accent">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 border rounded-md">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-bold w-4 text-center">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto pt-6 border-t">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-bold text-xl">
                  <span>Subtotal</span>
                  <span>${getCartTotal()}</span>
                </div>
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Finalizar Compra
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h3 className="text-xl font-semibold mb-2">Tu carrito está vacío</h3>
            <p className="text-muted-foreground">Agrega productos para verlos aquí.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
