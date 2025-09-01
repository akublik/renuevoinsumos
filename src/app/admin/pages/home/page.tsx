
'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPageContent } from "@/lib/page-content-service";
import { updateHomePageContentAction } from '@/lib/actions';
import type { HomePageContent } from "@/lib/page-content-types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link2 } from "lucide-react";

const PAGE_ID = 'home';

const initialContent: HomePageContent = {
  heroTitle: "", heroSubtitle: "", heroButtonText: "", heroImageUrl: "",
  whyTitle: "", whyDescription: "", whyPoint1: "", whyPoint2: "", whyPoint3: ""
};

export default function EditHomePage() {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      try {
        const pageContent = await getPageContent<HomePageContent>(PAGE_ID);
        const loadedContent = pageContent || initialContent;
        setContent(loadedContent);
        setImageUrl(loadedContent.heroImageUrl || '');
      } catch (error) {
        console.error("Failed to load page content", error);
        toast({ title: "Error", description: "No se pudo cargar el contenido. Se mostrará un formulario en blanco.", variant: "destructive" });
        setContent(initialContent);
        setImageUrl('');
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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0])); // Show local preview
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setImageFile(null);
    setContent(prev => prev ? { ...prev, heroImageUrl: e.target.value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setIsSaving(true);
    
    const formData = new FormData();
    // Append text fields
    Object.entries(content).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (imageFile) {
        formData.append('imageFile', imageFile);
        formData.append('imageContentType', imageFile.type); 
    } else {
        formData.append('heroImageUrl', imageUrl);
    }

    try {
      await updateHomePageContentAction(formData);
      toast({ title: "Éxito", description: "Contenido de la página de inicio guardado." });
    } catch (error) {
      console.error("Failed to save page content", error);
      toast({ title: "Error", description: `No se pudo guardar el contenido: ${error instanceof Error ? error.message : 'Error desconocido'}`, variant: "destructive" });
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
                  <Input id="heroTitle" name="heroTitle" value={content.heroTitle} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="heroSubtitle">Subtítulo</Label>
                  <Textarea id="heroSubtitle" name="heroSubtitle" value={content.heroSubtitle} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="heroButtonText">Texto del Botón</Label>
                  <Input id="heroButtonText" name="heroButtonText" value={content.heroButtonText} onChange={handleChange} />
                </div>
                <div className="grid gap-4">
                    <Label>Imágen del Banner</Label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 relative border rounded-md overflow-hidden bg-muted">
                            {imageUrl && <Image src={imageUrl} alt="Vista previa" fill className="object-cover" />}
                        </div>
                        <div className="flex-1 grid gap-3">
                            <div className="flex items-center gap-2">
                                <Link2 className="h-4 w-4 text-muted-foreground"/>
                                <Input 
                                    type="text" 
                                    name="imageUrlInput"
                                    placeholder="Pega una URL de imagen aquí" 
                                    value={imageUrl}
                                    onChange={handleImageUrlChange}
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="relative flex items-center justify-center my-2">
                                <span className="text-xs text-muted-foreground px-2 bg-background z-10">o</span>
                                <div className="absolute top-1/2 left-0 w-full h-px bg-border"></div>
                            </div>
                            <Input 
                                type="file" 
                                name="imageFileInput"
                                accept="image/*" 
                                onChange={handleImageFileChange}
                                className="cursor-pointer" 
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                </div>
              </div>

              {/* Why Choose Us Section */}
              <div className="grid gap-4">
                <h3 className="text-xl font-semibold font-headline">Sección "Por qué elegirnos"</h3>
                <div className="grid gap-2">
                  <Label htmlFor="whyTitle">Título de la Sección</Label>
                  <Input id="whyTitle" name="whyTitle" value={content.whyTitle} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="whyDescription">Descripción</Label>
                  <Textarea id="whyDescription" name="whyDescription" value={content.whyDescription} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label>Puntos Clave</Label>
                  <div className="grid gap-4">
                    <Input id="whyPoint1" name="whyPoint1" placeholder="Punto clave 1" value={content.whyPoint1} onChange={handleChange} />
                    <Input id="whyPoint2" name="whyPoint2" placeholder="Punto clave 2" value={content.whyPoint2} onChange={handleChange} />
                    <Input id="whyPoint3" name="whyPoint3" placeholder="Punto clave 3" value={content.whyPoint3} onChange={handleChange} />
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
