'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Files, Download, Loader2 } from 'lucide-react';
import { addProduct } from '@/lib/product-service';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/products';

export default function AdminProductsPage() {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Product['category'] | ''>('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setName('');
    setBrand('');
    setDescription('');
    setCategory('');
    setPrice('');
    setStock('');
    setColor('');
    setSize('');
    setImageFile(null);
    setPdfFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || !category || !imageFile) {
      toast({
        title: 'Error de validación',
        description: 'Por favor, completa todos los campos obligatorios y selecciona una imagen.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    console.log('Submitting product...');

    try {
      const productData = {
        name,
        brand,
        description,
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        color: color || undefined,
        size: size || undefined,
      };
      
      console.log('Product data to save:', productData);
      console.log('Image file:', imageFile.name);
      if (pdfFile) {
        console.log('PDF file:', pdfFile.name);
      }

      await addProduct(productData, imageFile, pdfFile);

      toast({
        title: '¡Producto Guardado!',
        description: `El producto "${name}" se ha agregado correctamente.`,
      });
      resetForm();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: 'Error al guardar',
        description: 'Hubo un problema al intentar guardar el producto. Revisa la consola para más detalles.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      console.log('Submission finished.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Carga Masiva con CSV</CardTitle>
          <CardDescription>
            Sube un archivo CSV para agregar múltiples productos al catálogo de una sola vez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
              <Files className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Arrastra y suelta el archivo CSV aquí, o</p>
              <Button type="button" variant="outline">Seleccionar Archivo</Button>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button type="submit" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                <Upload className="mr-2 h-4 w-4" />
                Importar Productos
              </Button>
              <Button type="button" variant="link" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Descargar plantilla CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Agregar Nuevo Producto</CardTitle>
          <CardDescription>
            Completa el formulario para añadir un nuevo insumo médico al catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input id="name" placeholder="Ej: Guantes de Nitrilo" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" placeholder="Ej: MedSafe" value={brand} onChange={(e) => setBrand(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" placeholder="Describe el producto, sus características y usos." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Select onValueChange={(value: Product['category']) => setCategory(value)} value={category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Equipamiento">Equipamiento</SelectItem>
                    <SelectItem value="Consumibles">Consumibles</SelectItem>
                    <SelectItem value="Instrumental">Instrumental</SelectItem>
                    <SelectItem value="Primeros Auxilios">Primeros Auxilios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Precio</Label>
                <Input id="price" type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="color">Color (Opcional)</Label>
                <Input id="color" placeholder="Ej: Azul" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">Talla (Opcional)</Label>
                <Input id="size" placeholder="Ej: M" value={size} onChange={(e) => setSize(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Imágen del Producto</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setImageFile)} className="cursor-pointer"/>
              {imageFile && <p className="text-sm text-muted-foreground">Archivo seleccionado: {imageFile.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Ficha Técnica (PDF, Opcional)</Label>
              <Input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setPdfFile)} className="cursor-pointer" />
              {pdfFile && <p className="text-sm text-muted-foreground">Archivo seleccionado: {pdfFile.name}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={resetForm} disabled={isSubmitting}>Cancelar</Button>
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
