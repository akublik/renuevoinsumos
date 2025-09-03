
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Link2, Loader2, Star } from 'lucide-react';
import { addProductAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { categories } from '@/lib/products';

export default function NewProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    if (imageFile) {
        formData.append('imageFile', imageFile);
        formData.append('imageContentType', imageFile.type); 
    } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
    } else {
        toast({
            title: 'Error de validación',
            description: 'Debes proporcionar una URL de imagen o subir un archivo.',
            variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
    }
    
    try {
        const result = await addProductAction(formData);
        if (result.success && result.productName) {
            toast({
                title: '¡Producto Guardado!',
                description: `El producto "${result.productName}" se ha agregado correctamente.`,
            });
            router.push('/admin/products');
        } else {
            throw new Error(result.error || "La acción de servidor falló.");
        }
    } catch (error) {
        console.error('Error in handleSubmit:', error);
        toast({
            title: 'Error al guardar',
            description: `Hubo un problema al guardar el producto: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setImageFile(e.target.files[0]);
          setImageUrl('');
      }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setImageUrl(e.target.value);
      setImageFile(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
       <Button variant="outline" size="sm" asChild>
        <Link href="/admin/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Añadir Nuevo Producto</CardTitle>
          <CardDescription>
            Completa el formulario para añadir un nuevo insumo médico al catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input id="name" name="name" placeholder="Ej: Guantes de Nitrilo" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" name="brand" placeholder="Ej: MedSafe" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" placeholder="Describe el producto, sus características y usos." />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Precio</Label>
                <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" name="stock" type="number" placeholder="0" required />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="color">Color (Opcional)</Label>
                <Input id="color" name="color" placeholder="Ej: Azul" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">Talla (Opcional)</Label>
                <Input id="size" name="size" placeholder="Ej: M" />
              </div>
            </div>
             <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Switch id="isFeatured" name="isFeatured" />
                  <Label htmlFor="isFeatured" className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    Marcar como producto destacado en la página de inicio
                  </Label>
                </div>
            </div>
            
            <div className="grid gap-3">
                <Label>Imágen del Producto</Label>
                <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground"/>
                    <Input 
                        type="text" 
                        name="imageUrlInput"
                        placeholder="Pega una URL de imagen aquí" 
                        value={imageUrl}
                        onChange={handleImageUrlChange}
                        disabled={isSubmitting}
                    />
                </div>
                <div className="relative flex items-center justify-center my-2">
                    <span className="text-xs text-muted-foreground px-2 bg-background z-10">o</span>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-border"></div>
                </div>
                <Input 
                    type="file" 
                    name="imageFileInput"
                    accept="image/*" 
                    onChange={handleImageFileChange}
                    className="cursor-pointer" 
                    disabled={isSubmitting}
                />
            </div>

            <div className="grid gap-2">
              <Label>Ficha Técnica (PDF, Opcional)</Label>
              <Input type="file" name="pdfFile" accept=".pdf" className="cursor-pointer" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="reset" onClick={() => router.push('/admin/products')} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Guardar Producto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
