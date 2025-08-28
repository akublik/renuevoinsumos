import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditHomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Editar Página de Inicio</CardTitle>
                <CardDescription>
                    Modifica los textos y contenidos de la sección principal y la sección "Por qué elegirnos".
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-8">
                    {/* Hero Section */}
                    <div className="grid gap-4 border-b pb-8">
                        <h3 className="text-xl font-semibold font-headline">Sección Principal (Hero)</h3>
                        <div className="grid gap-2">
                            <Label htmlFor="hero-title">Título Principal</Label>
                            <Input id="hero-title" defaultValue="Insumos Médicos de Calidad a tu Alcance" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="hero-subtitle">Subtítulo</Label>
                            <Textarea id="hero-subtitle" defaultValue="Explora nuestro catálogo completo de insumos médicos para profesionales y público en general. Confianza y calidad en cada producto." />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="hero-button">Texto del Botón</Label>
                            <Input id="hero-button" defaultValue="Ver Productos" />
                        </div>
                    </div>

                    {/* Why Choose Us Section */}
                    <div className="grid gap-4">
                        <h3 className="text-xl font-semibold font-headline">Sección "Por qué elegirnos"</h3>
                        <div className="grid gap-2">
                            <Label htmlFor="why-title">Título de la Sección</Label>
                            <Input id="why-title" defaultValue="¿Por qué elegirnos?" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="why-description">Descripción</Label>
                            <Textarea id="why-description" defaultValue="Ofrecemos una amplia gama de productos médicos de alta calidad, con un servicio al cliente excepcional y entregas rápidas y seguras. Nuestro compromiso es con tu salud y bienestar." />
                        </div>
                        <div className="grid gap-2">
                            <Label>Puntos Clave</Label>
                            <div className="grid gap-4">
                                <Input placeholder="Punto clave 1" defaultValue="Calidad Garantizada: Solo trabajamos con las mejores marcas y productos certificados." />
                                <Input placeholder="Punto clave 2" defaultValue="Precios Competitivos: Insumos de primera necesidad a precios justos para todos." />
                                <Input placeholder="Punto clave 3" defaultValue="Asesoramiento Experto: Nuestro equipo está listo para ayudarte a encontrar lo que necesitas." />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button">Cancelar</Button>
                        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Guardar Cambios</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}