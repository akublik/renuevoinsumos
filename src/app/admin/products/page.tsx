import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileUp, FileCsv, Download } from "lucide-react";

export default function AdminProductsPage() {
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
                        <FileCsv className="h-12 w-12 text-gray-400 mb-4" />
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
                <form className="grid gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Producto</Label>
                            <Input id="name" placeholder="Ej: Guantes de Nitrilo" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="brand">Marca</Label>
                            <Input id="brand" placeholder="Ej: MedSafe" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" placeholder="Describe el producto, sus características y usos." />
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="category">Categoría</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="equipamiento">Equipamiento</SelectItem>
                                    <SelectItem value="consumibles">Consumibles</SelectItem>
                                    <SelectItem value="instrumental">Instrumental</SelectItem>
                                    <SelectItem value="primeros-auxilios">Primeros Auxilios</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="price">Precio</Label>
                            <Input id="price" type="number" placeholder="0.00" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input id="stock" type="number" placeholder="0" />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="color">Color (Opcional)</Label>
                            <Input id="color" placeholder="Ej: Azul" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="size">Talla (Opcional)</Label>
                            <Input id="size" placeholder="Ej: M" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                         <Label>Imágenes del Producto</Label>
                         <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                            <Upload className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-sm text-muted-foreground mb-2">Arrastra y suelta las imágenes aquí, o</p>
                            <Button type="button" variant="outline">Seleccionar Archivos</Button>
                         </div>
                    </div>
                    <div className="grid gap-2">
                         <Label>Ficha Técnica (PDF)</Label>
                         <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                            <FileUp className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-sm text-muted-foreground mb-2">Arrastra y suelta el PDF aquí, o</p>
                            <Button type="button" variant="outline">Seleccionar Archivo</Button>
                         </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button">Cancelar</Button>
                        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Guardar Producto</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
