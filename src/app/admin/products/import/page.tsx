
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Loader2, Upload } from 'lucide-react';
import { addProductsFromCSVAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function ImportProductsPage() {
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const { toast } = useToast();
  const router = useRouter();

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
            router.push('/admin/products');
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
    }
  };

  const downloadCsvTemplate = () => {
    const header = "producto,marca,descripcion,categoria,precio,stock,color,talla,imagen\n";
    const example = "Guantes de Nitrilo,MedSafe,Caja de 100 guantes,Consumibles,15.99,250,Azul,M,https://picsum.photos/400/400\n";
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
          <CardTitle className="text-2xl font-headline">Carga Masiva con CSV</CardTitle>
          <CardDescription>
            Sube un archivo CSV para agregar múltiples productos al catálogo de una sola vez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 max-w-lg mx-auto">
            <div className="grid gap-2">
              <Label htmlFor="csv-file">Archivo CSV</Label>
              <Input 
                id="csv-file"
                type="file" 
                accept=".csv" 
                onChange={handleCsvFileChange} 
                className="cursor-pointer"
              />
              {csvFile && <p className="text-sm text-muted-foreground">Archivo seleccionado: {csvFile.name}</p>}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
              <Button onClick={downloadCsvTemplate} type="button" variant="link" className="w-full sm:w-auto order-2 sm:order-1">
                <Download className="mr-2 h-4 w-4" />
                Descargar plantilla
              </Button>
              <Button onClick={handleCsvImport} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 order-1 sm:order-2" disabled={isUploadingCsv || !csvFile}>
                {isUploadingCsv ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Importar Productos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
