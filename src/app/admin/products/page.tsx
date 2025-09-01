
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, MoreHorizontal, PlusCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductsFromFirestore } from '@/lib/product-service';
import type { Product } from '@/lib/products';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const fetchedProducts = await getProductsFromFirestore();
      setProducts(fetchedProducts);
    } catch (error) {
      toast({
        title: 'Error al cargar productos',
        description: 'No se pudieron obtener los productos de la base de datos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Inventario de Productos</h1>
          <p className="text-muted-foreground">Gestiona todos los productos de tu tienda.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/products/import">
              <Upload className="mr-2 h-4 w-4" />
              Importar CSV
            </Link>
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
            <Link href="/admin/products/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Producto
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos ({products.length})</CardTitle>
          <CardDescription>
            Aquí puedes ver y gestionar todos los productos de tu catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[80px] sm:table-cell">
                  <span className="sr-only">Imagen</span>
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Precio</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingProducts ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.imageUrl}
                        width="64"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                        {product.stock > 0 ? "Publicado" : "Agotado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">${product.price.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Acciones</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/products/edit/${product.id}`}>Editar</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                         </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No se encontraron productos. Empieza añadiendo uno nuevo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
