'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Files, Download, Loader2, Link2 } from 'lucide-react';
import { addProduct, addProductsFromCSV } from '@/lib/product-service';
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
  const [imageUrl, setImageUrl] = useState('');

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

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
    setImageUrl('');
    setPdfFile(null);
    // Reset file input fields visually
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => (input as HTMLInputElement).value = '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || !category || (!imageFile && !imageUrl)) {
      toast({
        title: 'Error de validación',
        description: 'Por favor, completa todos los campos obligatorios y proporciona una imagen (subida o por URL).',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);

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
      
      const imageSource = imageFile || imageUrl;
      const docId = await addProduct(productData, imageSource, pdfFile);

      if (docId) {
        toast({
          title: '¡Producto Guardado!',
          description: `El producto "${name}" se ha agregado correctamente.`,
        });
        resetForm();
      } else {
         throw new Error("La función addProduct no retornó un ID de documento.");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (setFile === setImageFile) {
        setImageUrl(''); // Clear URL if a file is selected
      }
    } else {
      setFile(null);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    if (e.target.value) {
      setImageFile(null); // Clear file if a URL is entered
    }
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      toast({
        title: 'No se seleccionó archivo',
        description: 'Por favor, selecciona un archivo CSV para importar.',
        variant: 'destructive',
      });
      return;
    }
    setIsUploadingCsv(true);
    try {
      const result = await addProductsFromCSV(csvFile);
      toast({
        title: 'Importación CSV completada',
        description: `${result.successCount} productos importados. ${result.errorCount} errores. Revisa la consola para más detalles.`,
      });
    } catch (error) {
      console.error("Error importing CSV:", error);
      toast({
        title: 'Error en la importación',
        description: `Hubo un problema al procesar el archivo CSV: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingCsv(false);
      setCsvFile(null);
      const csvInput = document.querySelector('input[type="file"][accept=".csv"]') as HTMLInputElement;
      if (csvInput) csvInput.value = '';
    }
  };
  
  const downloadCsvTemplate = () => {
    const header = "PRODUCTO,MARCA,DESCRIPCION,CATEGORIA,PRECIO,STOCK,COLOR,TALLA,IMAGEN\n";
    const example = "Guantes de Nitrilo,MedSafe,Caja de 100 guantes,Consumibles,15.99,250,Azul,M,https://example.com/image.jpg\n";
    const blob = new Blob([header + example], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "plantilla_productos.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

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
            <div className="grid gap-2">
              <Label>Archivo CSV</Label>
              <Input 
                type="file" 
                accept=".csv" 
                onChange={(e) => handleFileChange(e, setCsvFile)} 
                className="cursor-pointer"
              />
              {csvFile && <p className="text-sm text-muted-foreground">Archivo seleccionado: {csvFile.name}</p>}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button onClick={handleCsvImport} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90" disabled={isUploadingCsv || !csvFile}>
                {isUploadingCsv ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Importar Productos
              </Button>
              <Button onClick={downloadCsvTemplate} type="button" variant="link" className="w-full sm:w-auto">
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
                <Input id="name" placeholder="Ej: Guantes de Nitrilo" value={name} onChange={(e) => setName(e.target.value)} required />
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
                <Select onValueChange={(value: Product['category']) => setCategory(value)} value={category} required>
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
                <Input id="price" type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
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
            
            <div className="grid gap-3">
                <Label>Imágen del Producto</Label>
                <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground"/>
                    <Input 
                        type="text" 
                        placeholder="Pega una URL de imagen aquí" 
                        value={imageUrl}
                        onChange={handleImageUrlChange}
                        disabled={isSubmitting}
                    />
                </div>
                <div className="relative flex items-center justify-center my-2">
                    <span className="text-xs text-muted-foreground px-2 bg-card z-10">o</span>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-border"></div>
                </div>
                <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, setImageFile)} 
                    className="cursor-pointer" 
                    disabled={isSubmitting}
                />
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
