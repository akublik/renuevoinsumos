
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, Loader2, Link2 } from 'lucide-react';
import { addProductAction, addProductsFromCSVAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function AdminProductsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');


  // Function to reset the form via its native API
  const resetForm = (form: HTMLFormElement) => {
    form.reset();
    setImageFile(null);
    setImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Append the correct image data based on user input
    if (imageFile) {
        formData.append('imageFile', imageFile);
        formData.append('imageContentType', imageFile.type); 
    } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
    }
    
    // Basic client-side validation for other required fields
    if (!formData.get('name') || !formData.get('price') || !formData.get('stock') || !formData.get('category')) {
        toast({
            title: 'Error de validación',
            description: 'Por favor, completa todos los campos obligatorios.',
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
            resetForm(form);
        } else {
            throw new Error(result.error || "La acción de servidor no retornó un ID de documento.");
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
          setImageUrl(''); // Clear the URL input if a file is selected
      }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setImageUrl(e.target.value);
      setImageFile(null); // Clear the file input if a URL is entered
  };


  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    } else {
      setCsvFile(null);
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
        const fileContent = await csvFile.text();
        const result = await addProductsFromCSVAction(fileContent);

        if (result.success) {
            toast({
                title: 'Importación CSV completada',
                description: `${result.successCount} productos importados. ${result.errorCount} errores.`,
            });
        } else {
            throw new Error(result.error || "Ocurrió un error en la importación.");
        }
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
                onChange={handleCsvFileChange} 
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
                    <SelectItem value="Equipamiento">Equipamiento</SelectItem>
                    <SelectItem value="Consumibles">Consumibles</SelectItem>
                    <SelectItem value="Instrumental">Instrumental</SelectItem>
                    <SelectItem value="Primeros Auxilios">Primeros Auxilios</SelectItem>
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
                    <span className="text-xs text-muted-foreground px-2 bg-card z-10">o</span>
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
              <Button variant="outline" type="button" onClick={(e) => resetForm(e.currentTarget.form!)} disabled={isSubmitting}>Cancelar</Button>
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
