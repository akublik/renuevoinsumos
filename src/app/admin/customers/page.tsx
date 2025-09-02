
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Loader2, Trash2 } from 'lucide-react';
import type { Order } from '@/lib/orders';
import { useToast } from '@/hooks/use-toast';
import { deleteOrderAction } from '@/lib/actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ORDERS_PER_PAGE = 20;

async function getOrdersFromFirestore(): Promise<Order[]> {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, orderBy('createdAt', 'desc'));
    const orderSnapshot = await getDocs(q);
    const orderList = orderSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
        } as Order;
    });
    return orderList;
}

export default function AdminCustomersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const fetchedOrders = await getOrdersFromFirestore();
                setOrders(fetchedOrders);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'No se pudieron cargar los datos de los clientes.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [toast]);
    
    const handleDeleteOrder = async (orderId: string, customerName: string) => {
        setIsDeleting(orderId);
        try {
            const result = await deleteOrderAction(orderId);
            if (result.success) {
                setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
                toast({
                    title: "Registro Eliminado",
                    description: `El pedido de "${customerName}" ha sido eliminado.`,
                });
            } else {
                throw new Error(result.error || "No se pudo eliminar el registro.");
            }
        } catch (error) {
            toast({
                title: 'Error al eliminar',
                description: `${error instanceof Error ? error.message : 'Error desconocido'}`,
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(null);
        }
    };

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
        const endIndex = startIndex + ORDERS_PER_PAGE;
        return orders.slice(startIndex, endIndex);
    }, [orders, currentPage]);

    const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Clientes</CardTitle>
                    <CardDescription>
                        Lista de clientes basada en los pedidos realizados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead className="hidden md:table-cell">Dirección</TableHead>
                                <TableHead className="hidden lg:table-cell">Fecha de Pedido</TableHead>
                                <TableHead className="text-right">Monto Total</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : paginatedOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        <div className="font-bold">{order.customer.fullName}</div>
                                        {order.customer.ruc && <div className="text-xs text-muted-foreground">RUC/CI: {order.customer.ruc}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{order.customer.email}</div>
                                        <div className="text-sm text-muted-foreground">{order.customer.phone}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm">
                                        {order.customer.address}, {order.customer.city}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-sm">{order.createdAt.toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right font-semibold">${order.total.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={isDeleting === order.id}>
                                                        {isDeleting === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                     <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive flex items-center cursor-pointer" onSelect={(e) => e.preventDefault()}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción no se puede deshacer. Esto eliminará permanentemente el pedido de <span className="font-semibold">{order.customer.fullName}</span>.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteOrder(order.id, order.customer.fullName)} className="bg-destructive hover:bg-destructive/90">
                                                        Sí, eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && orders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No hay información de clientes todavía.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                {totalPages > 1 && (
                    <CardFooter>
                        <div className="text-xs text-muted-foreground">
                            Página {currentPage} de {totalPages}
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
