import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileEdit } from "lucide-react";
import Link from "next/link";

const pages = [
    { name: "Página de Inicio", path: "/admin/pages/home" },
    { name: "Página de Nosotros", path: "/admin/pages/about" },
]

export default function AdminPages() {
  return (
    <div className="container mx-auto px-4 py-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Editar Páginas</CardTitle>
                <CardDescription>
                    Selecciona la página que deseas editar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre de la Página</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pages.map((page) => (
                             <TableRow key={page.path}>
                                <TableCell className="font-medium">{page.name}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={page.path}>
                                            <FileEdit className="mr-2 h-4 w-4" />
                                            Editar
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
