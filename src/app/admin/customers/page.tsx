
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
                                <TableHead>Email</TableHead>
                                <TableHead>Fecha de Pedido</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead>Productos Comprados</TableHead>
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
                                    <TableCell className="font-medium">{order.customer.fullName}</TableCell>
                                    <TableCell>{order.customer.email}</TableCell>
                                    <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <ul className="list-disc list-inside text-sm">
                                            {order.items.map(item => (
                                                <li key={item.id}>{item.name} (x{item.quantity})</li>
                                            ))}
                                        </ul>
                                    </TableCell>
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
