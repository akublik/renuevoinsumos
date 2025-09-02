
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SalesChart from "@/components/sales-chart";

export default function AdminDashboardPage() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                    <p className="text-muted-foreground">Un resumen de la actividad de tu tienda.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Ventas de los Últimos 30 Días</CardTitle>
                        <CardDescription>Evolución de las ventas totales de la plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <SalesChart />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
