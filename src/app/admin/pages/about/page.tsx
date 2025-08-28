import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditAboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Editar Página "Nosotros"</CardTitle>
                <CardDescription>
                    Modifica los contenidos de la página de "Nosotros".
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-8">
                    {/* Hero Section */}
                    <div className="grid gap-4 border-b pb-8">
                        <h3 className="text-xl font-semibold font-headline">Sección Principal</h3>
                        <div className="grid gap-2">
                            <Label htmlFor="hero-title">Título Principal</Label>
                            <Input id="hero-title" defaultValue="Nuestra Misión es tu Bienestar" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="hero-subtitle">Subtítulo</Label>
                            <Textarea id="hero-subtitle" defaultValue="Comprometidos con la salud, ofrecemos insumos médicos de la más alta calidad para profesionales y el público en general." />
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="grid gap-4 border-b pb-8">
                        <h3 className="text-xl font-semibold font-headline">Sección "Sobre Insumos Online"</h3>
                        <div className="grid gap-2">
                            <Label htmlFor="about-title">Título</Label>
                            <Input id="about-title" defaultValue="Sobre Insumos Online" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="about-description">Descripción</Label>
                            <Textarea id="about-description" rows={6} defaultValue="Desde nuestra fundación, nos hemos dedicado a ser el puente entre la innovación médica y quienes la necesitan. Seleccionamos cuidadosamente cada producto, asegurando que cumpla con los estándares más rigurosos de calidad y seguridad. Nuestro equipo de expertos está siempre disponible para brindar asesoramiento y garantizar que encuentres exactamente lo que buscas. Creemos en un servicio al cliente excepcional, precios justos y una logística eficiente para que recibas tus insumos a tiempo, siempre." />
                        </div>
                    </div>

                     {/* Values Section */}
                    <div className="grid gap-4">
                        <h3 className="text-xl font-semibold font-headline">Sección "Nuestros Valores"</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                             <div className="grid gap-2">
                                <Label htmlFor="value1-title">Título Valor 1</Label>
                                <Input id="value1-title" defaultValue="Calidad Superior" />
                                <Label htmlFor="value1-desc">Descripción Valor 1</Label>
                                <Textarea id="value1-desc" defaultValue="Solo ofrecemos productos que cumplen con las más altas certificaciones de calidad y seguridad." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="value2-title">Título Valor 2</Label>
                                <Input id="value2-title" defaultValue="Confianza y Seguridad" />
                                 <Label htmlFor="value2-desc">Descripción Valor 2</Label>
                                <Textarea id="value2-desc" defaultValue="Tu salud es nuestra prioridad. Garantizamos la procedencia y efectividad de cada insumo." />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="value3-title">Título Valor 3</Label>
                                <Input id="value3-title" defaultValue="Servicio Eficiente" />
                                 <Label htmlFor="value3-desc">Descripción Valor 3</Label>
                                <Textarea id="value3-desc" defaultValue="Procesamos y enviamos tus pedidos con la mayor rapidez para que nunca te falte lo que necesitas." />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button">Cancelar</Button>
                        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Guardar Cambios</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}