'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPageContent, updateHomePageContent } from "@/lib/page-content-service";
import type { HomePageContent } from "@/lib/page-content-types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";

const PAGE_ID = 'home';

const initialContent: HomePageContent = {
  heroTitle: "", heroSubtitle: "", heroButtonText: "", heroImageUrls: [],
  whyTitle: "", whyDescription: "", whyPoint1: "", whyPoint2: "", whyPoint3: ""
};

export default function EditHomePage() {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [bannerImageFiles, setBannerImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      try {
        const pageContent = await getPageContent<HomePageContent>(PAGE_ID);
        setContent(pageContent || initialContent);
      } catch (error) {
        console.error("Failed to load page content", error);
        toast({ title: "Error", description: "No se pudo cargar el contenido. Se mostrará un formulario en blanco.", variant: "destructive" });
        setContent(initialContent);
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setContent(prev => prev ? { ...prev, [id]: value } : null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBannerImageFiles(Array.from(e.target.files));
    } else {
      setBannerImageFiles([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setIsSaving(true);
    try {
      await updateHomePageContent(PAGE_ID, content, bannerImageFiles);
      toast({ title: "Éxito", description: "Contenido de la página de inicio guardado." });
       if (bannerImageFiles.length > 0) {
        // Refresh the page to show the new image if one was uploaded
         window.location.reload();
      }
    } catch (error) {
      console.error("Failed to save page content", error);
      toast({ title: "Error", description: "No se pudo guardar el contenido.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setContent(prev => {
        if (!prev) return null;
        return {
            ...prev,
            heroImageUrls: prev.heroImageUrls.filter(url => url !== urlToRemove)
        }
    })
  }


  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

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
          {content && (
            <form onSubmit={handleSubmit} className="grid gap-8">
              {/* Hero Section */}
              <div className="grid gap-4 border-b pb-8">
                <h3 className="text-xl font-semibold font-headline">Sección Principal (Hero)</h3>
                <div className="grid gap-2">
                  <Label htmlFor="heroTitle">Título Principal</Label>
                  <Input id="heroTitle" value={content.heroTitle} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="heroSubtitle">Subtítulo</Label>
                  <Textarea id="heroSubtitle" value={content.heroSubtitle} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="heroButtonText">Texto del Botón</Label>
                  <Input id="heroButtonText" value={content.heroButtonText} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="heroBanner">Imágenes de Banner</Label>
                  <Input id="heroBanner" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" multiple />
                   {content.heroImageUrls && content.heroImageUrls.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Imágenes actuales (haz clic en la 'x' para eliminar una imagen y luego guarda los cambios):</p>
                      <div className="flex flex-wrap gap-4">
                        {content.heroImageUrls.map((url) => (
                          <div key={url} className="relative group">
                            <Image src={url} alt="Banner actual" width={150} height={100} className="rounded-md object-cover" />
                             <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveImage(url)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {bannerImageFiles.length > 0 && (
                     <p className="text-sm text-muted-foreground mt-2">
                        Nuevas imágenes seleccionadas: {bannerImageFiles.map(f => f.name).join(', ')}
                     </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Puedes seleccionar varias imágenes. Se mostrarán en un carrusel.
                  </p>
                </div>
              </div>

              {/* Why Choose Us Section */}
              <div className="grid gap-4">
                <h3 className="text-xl font-semibold font-headline">Sección "Por qué elegirnos"</h3>
                <div className="grid gap-2">
                  <Label htmlFor="whyTitle">Título de la Sección</Label>
                  <Input id="whyTitle" value={content.whyTitle} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="whyDescription">Descripción</Label>
                  <Textarea id="whyDescription" value={content.whyDescription} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label>Puntos Clave</Label>
                  <div className="grid gap-4">
                    <Input id="whyPoint1" placeholder="Punto clave 1" value={content.whyPoint1} onChange={handleChange} />
                    <Input id="whyPoint2" placeholder="Punto clave 2" value={content.whyPoint2} onChange={handleChange} />
                    <Input id="whyPoint3" placeholder="Punto clave 3" value={content.whyPoint3} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" disabled={isSaving}>Cancelar</Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
