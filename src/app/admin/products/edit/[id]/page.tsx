
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Link2, Loader2, Star } from 'lucide-react';
import { updateProductAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { getProductById } from '@/lib/product-service';
import type { Product } from '@/lib/products';
import { categories } from '@/lib/products';
import { Switch } from '@/components/ui/switch';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

async function uploadFile(file: File, path: string): Promise<string> {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    return getDownloadURL(snapshot.ref);
}

export default function EditProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      setIsLoading(true);
      const fetchedProduct = await getProductById(productId);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        setImageUrl(fetchedProduct.imageUrl || '');
      } else {
        toast({ title: "Error", description: "Producto no encontrado.", variant: "destructive" });
        router.push('/admin/products');
      }
      setIsLoading(false);
    };
    fetchProduct();
  }, [productId, toast, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    if (!form) {
        toast({ title: "Error", description: "No se encontró el formulario.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    
    try {
        let finalImageUrl = imageUrl;
        if (imageFile) {
            finalImageUrl = await uploadFile(imageFile, `products/${Date.now()}_${imageFile.name}`);
        }

        let finalPdfUrl: string | undefined = product.technicalSheetUrl;
        if (pdfFile) {
            finalPdfUrl = await uploadFile(pdfFile, `tech-sheets/${Date.now()}_${pdfFile.name}`);
        }

        const formData = new FormData();
        
        formData.append('productId', productId);
        formData.append('name', (form.elements.namedItem('name') as HTMLInputElement).value);
        formData.append('brand', (form.elements.namedItem('brand') as HTMLInputElement).value);
        formData.append('description', (form.elements.namedItem('description') as HTMLTextAreaElement).value);
        formData.append('category', (form.elements.namedItem('category') as HTMLSelectElement).value);
        formData.append('price', (form.elements.namedItem('price') as HTMLInputElement).value);
        formData.append('stock', (form.elements.namedItem('stock') as HTMLInputElement).value);
        formData.append('color', (form.elements.namedItem('color') as HTMLInputElement).value);
        formData.append('size', (form.elements.namedItem('size') as HTMLInputElement).value);
        const isFeaturedSwitch = form.elements.namedItem('isFeatured') as HTMLInputElement;
        if (isFeaturedSwitch && isFeaturedSwitch.checked) {
          formData.append('isFeatured', 'on');
        }
        
        formData.set('imageUrl', finalImageUrl);
        
        if (finalPdfUrl) {
            formData.append('technicalSheetUrl', finalPdfUrl);
        }
        
        const result = await updateProductAction(formData);

        if (result.success && result.productName) {
            toast({
                title: '¡Producto Actualizado!',
                description: `El producto "${result.productName}" se ha actualizado correctamente.`,
            });
            router.push('/admin/products');
        } else {
            throw new Error(result.error || "La acción de servidor falló.");
        }
    } catch (error) {
        console.error('Error in handleSubmit:', error);
        toast({
            title: 'Error al actualizar',
            description: `Hubo un problema al actualizar el producto: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setImageFile(e.target.files[0]);
          setImageUrl(URL.createObjectURL(e.target.files[0])); // Show local preview
      }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setImageUrl(e.target.value);
      setImageFile(null);
  };
  
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setPdfFile(e.target.files[0]);
      }
  };

  if (isLoading || !product) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Cargando producto...</p>
        </div>
      );
  }

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
          <CardTitle className="text-2xl font-headline">Editar Producto</CardTitle>
          <CardDescription>
            Modifica los detalles del producto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input id="name" name="name" defaultValue={product.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" name="brand" defaultValue={product.brand} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" defaultValue={product.description} />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Select name="category" defaultValue={product.category} required>
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
                <Input id="price" name="price" type="number" step="0.01" defaultValue={product.price} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" name="stock" type="number" defaultValue={product.stock} required />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="color">Color (Opcional)</Label>
                <Input id="color" name="color" defaultValue={product.color || ''} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">Talla (Opcional)</Label>
                <Input id="size" name="size" defaultValue={product.size || ''} />
              </div>
            </div>
            <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Switch id="isFeatured" name="isFeatured" defaultChecked={product.isFeatured} />
                  <Label htmlFor="isFeatured" className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    Marcar como producto destacado en la página de inicio
                  </Label>
                </div>
            </div>
            
            <div className="grid gap-4">
                <Label>Imágen del Producto</Label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 relative border rounded-md overflow-hidden bg-muted">
                        {imageUrl && <Image src={imageUrl} alt="Vista previa" fill className="object-cover" />}
                    </div>
                    <div className="flex-1 grid gap-3">
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
                </div>
            </div>

            <div className="grid gap-2">
              <Label>Ficha Técnica (PDF, Opcional)</Label>
              <div className="flex items-center gap-4">
                <Input type="file" name="pdfFile" accept=".pdf" className="cursor-pointer flex-1" onChange={handlePdfFileChange} />
                {product.technicalSheetUrl && (
                    <Button variant="outline" size="sm" asChild>
                        <a href={product.technicalSheetUrl} target="_blank" rel="noopener noreferrer">Ver Ficha Actual</a>
                    </Button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => router.push('/admin/products')} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
