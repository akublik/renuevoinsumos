
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useCart } from "@/context/cart-context";
import Image from "next/image";
import { useFormToast } from "@/hooks/use-form-toast";
import { CreditCard, Truck, Banknote, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { createOrderAction } from "@/lib/actions";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  email: z.string().email("Por favor, introduce un correo electrónico válido."),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres."),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres."),
  city: z.string().min(3, "La ciudad debe tener al menos 3 caracteres."),
  country: z.string().min(3, "El país debe tener al menos 3 caracteres."),
  paymentMethod: z.enum(["cash", "transfer"], {
    required_error: "Debes seleccionar un método de pago.",
  }),
});

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast, toastError } = useFormToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      paymentMethod: "cash",
    },
  });
  
  // Redirect guest users to login page
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, loading, router]);
  
  // Redirect to home if cart is empty
  useEffect(() => {
    if (!loading && cartItems.length === 0 && !form.formState.isSubmitSuccessful) {
      router.push('/');
    }
  }, [cartItems, router, form.formState.isSubmitSuccessful, loading]);

  useEffect(() => {
    if (!loading && user) {
        form.setValue('email', user.email || '');
    }
  }, [user, loading, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toastError("Debes iniciar sesión para realizar un pedido.");
        router.push('/login?redirect=/checkout');
        return;
    }

    try {
      const totalAmount = parseFloat(getCartTotal());
      const orderData = {
        userId: user.uid,
        customer: values,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: totalAmount,
        status: 'Pendiente' as const,
      };

      const result = await createOrderAction(orderData);
      
      if (result.success) {
        toast({
          title: "¡Pedido Realizado!",
          description: "Gracias por tu compra. Hemos recibido tu pedido y lo estamos procesando.",
        });
        clearCart();
        setTimeout(() => router.push('/'), 3000);
      } else {
        throw new Error(result.error || "No se pudo crear el pedido.");
      }

    } catch (error) {
       toastError(error instanceof Error ? error.message : "Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.");
    }
  }
  
  if (loading || !user) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Cargando y verificando autenticación...</p>
            </main>
            <Footer />
        </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Form Section */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold font-headline mb-6">Finalizar Compra</h1>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto y Envío</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl><Input placeholder="Juan Pérez" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl><Input placeholder="tu@correo.com" {...field} readOnly /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl><Input placeholder="+123 456 7890" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl><Input placeholder="Av. Principal 123" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl><Input placeholder="Ciudad" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel>País</FormLabel>
                        <FormControl><Input placeholder="País" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Método de Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/10 transition-colors">
                                        <FormControl><RadioGroupItem value="cash" /></FormControl>
                                        <Banknote className="h-5 w-5 mr-2 text-accent" />
                                        <FormLabel className="font-normal">Contra entrega</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/10 transition-colors">
                                        <FormControl><RadioGroupItem value="transfer" /></FormControl>
                                        <CreditCard className="h-5 w-5 mr-2 text-accent" />
                                        <FormLabel className="font-normal">Transferencia bancaria</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                  </CardContent>
                </Card>
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {form.formState.isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between items-center font-bold text-xl border-t pt-4 mt-4">
                <span>Total</span>
                <span>${getCartTotal()}</span>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
