
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/orders';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format, subDays } from 'date-fns';


interface SalesData {
    date: string;
    total: number;
}

async function getSalesData(): Promise<SalesData[]> {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);

    const ordersCol = collection(db, 'orders');
    const q = query(
        ordersCol,
        where('createdAt', '>=', thirtyDaysAgoTimestamp),
        orderBy('createdAt', 'asc')
    );

    const orderSnapshot = await getDocs(q);

    const salesByDay: { [key: string]: number } = {};

    orderSnapshot.docs.forEach(doc => {
        const order = doc.data() as Order;
        if (order.createdAt && order.status !== 'Cancelado') {
             // Firestore timestamps need to be converted to JS Dates
            const date = (order.createdAt as unknown as Timestamp).toDate();
            const dayKey = format(date, 'dd/MM');

            if (!salesByDay[dayKey]) {
                salesByDay[dayKey] = 0;
            }
            salesByDay[dayKey] += order.total;
        }
    });
    
    // Create a complete list of the last 30 days
    const allDaysData: SalesData[] = [];
    for (let i = 0; i < 30; i++) {
        const date = subDays(new Date(), i);
        const dayKey = format(date, 'dd/MM');
        allDaysData.push({
            date: dayKey,
            total: salesByDay[dayKey] || 0
        });
    }

    // Reverse to have the oldest date first
    return allDaysData.reverse();
}


export default function SalesChart() {
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getSalesData();
                setSalesData(data);
            } catch (error) {
                console.error("Failed to fetch sales data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="h-[350px] w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="h-[350px]">
           <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={salesData}
                margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    interval={3} // Show a tick every 4 days to avoid clutter
                />
                <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                    }}
                />
                <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
