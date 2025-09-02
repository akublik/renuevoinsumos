
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';
import type { Order } from '@/lib/orders';
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

export default function AdminCustomersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : orders.map((order) => (
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
                                </TableRow>
                            ))}
                            {!isLoading && orders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No hay información de clientes todavía.
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
