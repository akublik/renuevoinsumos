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
import { Loader2, X, Upload, Link2 } from "lucide-react";

const PAGE_ID = 'home';
const MAX_IMAGES = 6;

const initialContent: HomePageContent = {
  heroTitle: "", heroSubtitle: "", heroButtonText: "", heroImageUrls: [],
  whyTitle: "", whyDescription: "", whyPoint1: "", whyPoint2: "", whyPoint3: ""
};

type BannerImageSlot = {
  type: 'url' | 'file' | 'empty';
  value: string | File | null;
  preview: string | null;
};

export default function EditHomePage() {
  const [content, setContent] = useState<Omit<HomePageContent, 'heroImageUrls'> | null>(null);
  const [imageSlots, setImageSlots] = useState<BannerImageSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      try {
        const pageContent = await getPageContent<HomePageContent>(PAGE_ID);
        const loadedContent = pageContent || initialContent;
        
        const { heroImageUrls, ...textContent } = loadedContent;
        setContent(textContent);

        const slots: BannerImageSlot[] = Array(MAX_IMAGES).fill(null).map((_, i) => {
          const url = heroImageUrls[i];
          if (url) {
            return { type: 'url', value: url, preview: url };
          }
          return { type: 'empty', value: null, preview: null };
        });
        setImageSlots(slots);

      } catch (error) {
        console.error("Failed to load page content", error);
        toast({ title: "Error", description: "No se pudo cargar el contenido. Se mostrará un formulario en blanco.", variant: "destructive" });
        setContent(initialContent);
        setImageSlots(Array(MAX_IMAGES).fill({ type: 'empty', value: null, preview: null }));
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newSlots = [...imageSlots];
      newSlots[index] = { type: 'file', value: file, preview: URL.createObjectURL(file) };
      setImageSlots(newSlots);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const url = e.target.value;
      const newSlots = [...imageSlots];
      newSlots[index] = { type: 'url', value: url, preview: url };
      setImageSlots(newSlots);
  }

  const handleRemoveImage = (index: number) => {
    const newSlots = [...imageSlots];
    newSlots[index] = { type: 'empty', value: null, preview: null };
    setImageSlots(newSlots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setIsSaving(true);
    try {
      await updateHomePageContent(PAGE_ID, content, imageSlots);
      toast({ title: "Éxito", description: "Contenido de la página de inicio guardado." });
      // Optional: reload to see changes immediately if uploads happened
      if (imageSlots.some(slot => slot.type === 'file')) {
          window.location.reload();
      }
    } catch (error) {
      console.error("Failed to save page content", error);
      toast({ title: "Error", description: "No se pudo guardar el contenido.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

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
                 <div className="grid gap-4">
                    <Label>Imágenes de Banner del Carrusel (hasta 6)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {imageSlots.map((slot, index) => (
                            <div key={index} className="border rounded-lg p-3 space-y-3 bg-muted/20">
                                <Label className="text-sm font-medium">Imagen {index + 1}</Label>
                                <div className="relative w-full aspect-video rounded-md bg-muted overflow-hidden flex items-center justify-center">
                                    {slot.preview ? (
                                        <>
                                            <Image src={slot.preview} alt={`Vista previa ${index + 1}`} fill className="object-cover" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6"
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Sin imagen</span>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center gap-2">
                                        <Link2 className="h-4 w-4 text-muted-foreground"/>
                                        <Input 
                                            type="text" 
                                            placeholder="O pega una URL aquí" 
                                            className="text-xs h-8"
                                            value={slot.type === 'url' ? slot.value as string : ''}
                                            onChange={(e) => handleUrlChange(e, index)}
                                        />
                                    </div>
                                    <div className="relative flex items-center justify-center">
                                        <span className="text-xs text-muted-foreground px-2 bg-background z-10">o</span>
                                        <div className="absolute top-1/2 left-0 w-full h-px bg-border"></div>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" asChild>
                                        <label className="cursor-pointer w-full">
                                            <Upload className="mr-2 h-4 w-4"/> Subir archivo
                                            <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFileChange(e, index)} />
                                        </label>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
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
