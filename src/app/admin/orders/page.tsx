
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/orders';
import { updateOrderStatusAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

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

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
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
                    description: 'No se pudieron cargar los pedidos.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [toast]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        setUpdatingStatus(orderId);
        try {
            const result = await updateOrderStatusAction(orderId, newStatus);
            if (result.success) {
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === orderId ? { ...order, status: newStatus } : order
                    )
                );
                toast({
                    title: 'Éxito',
                    description: `El estado del pedido se ha actualizado a "${newStatus}".`,
                });
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: `No se pudo actualizar el estado del pedido: ${error instanceof Error ? error.message : ''}`,
                variant: 'destructive',
            });
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getStatusVariant = (status: OrderStatus) => {
        switch (status) {
            case 'Pendiente':
                return 'secondary';
            case 'Pagado':
                return 'default';
            case 'Entregado':
                return 'outline';
            case 'Cancelado':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const orderStatuses: OrderStatus[] = ['Pendiente', 'Pagado', 'Entregado', 'Cancelado'];
    
    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Historial de Pedidos</CardTitle>
                    <CardDescription>
                        Aquí puedes ver y gestionar todos los pedidos realizados en tu tienda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID Pedido</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Total</TableHead>
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
                            ) : orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium truncate" style={{maxWidth: '100px'}} title={order.id}>{order.id}</TableCell>
                                    <TableCell>{order.customer.fullName}</TableCell>
                                    <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                      {updatingStatus === order.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                                      ) : (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {orderStatuses.map((status) => (
                                                    <DropdownMenuItem
                                                        key={status}
                                                        disabled={order.status === status}
                                                        onSelect={() => handleStatusChange(order.id, status)}
                                                    >
                                                        Marcar como {status}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && orders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No hay pedidos todavía.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
