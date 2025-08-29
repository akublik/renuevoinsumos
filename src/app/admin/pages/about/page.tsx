'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPageContent, updatePageContent } from '@/lib/page-content-service';
import type { AboutPageContent } from '@/lib/page-content-types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const PAGE_ID = 'about';

export default function EditAboutPage() {
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      try {
        const pageContent = await getPageContent<AboutPageContent>(PAGE_ID);
        if (pageContent) {
          setContent(pageContent);
        } else {
          // Initialize with empty strings if no content exists
          setContent({
            heroTitle: "", heroSubtitle: "", aboutTitle: "", aboutDescription: "",
            value1Title: "", value1Desc: "", value2Title: "", value2Desc: "", value3Title: "", value3Desc: ""
          });
        }
      } catch (error) {
        console.error("Failed to load page content", error);
        toast({ title: "Error", description: "No se pudo cargar el contenido.", variant: "destructive" });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setIsSaving(true);
    try {
      await updatePageContent(PAGE_ID, content);
      toast({ title: "Éxito", description: "Contenido de la página 'Nosotros' guardado." });
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
          <CardTitle className="text-2xl font-headline">Editar Página "Nosotros"</CardTitle>
          <CardDescription>
            Modifica los contenidos de la página de "Nosotros".
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content && (
            <form onSubmit={handleSubmit} className="grid gap-8">
              {/* Hero Section */}
              <div className="grid gap-4 border-b pb-8">
                <h3 className="text-xl font-semibold font-headline">Sección Principal</h3>
                <div className="grid gap-2">
                  <Label htmlFor="heroTitle">Título Principal</Label>
                  <Input id="heroTitle" value={content.heroTitle} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="heroSubtitle">Subtítulo</Label>
                  <Textarea id="heroSubtitle" value={content.heroSubtitle} onChange={handleChange} />
                </div>
              </div>

              {/* About Section */}
              <div className="grid gap-4 border-b pb-8">
                <h3 className="text-xl font-semibold font-headline">Sección "Sobre Insumos Online"</h3>
                <div className="grid gap-2">
                  <Label htmlFor="aboutTitle">Título</Label>
                  <Input id="aboutTitle" value={content.aboutTitle} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="aboutDescription">Descripción</Label>
                  <Textarea id="aboutDescription" rows={6} value={content.aboutDescription} onChange={handleChange} />
                </div>
              </div>

              {/* Values Section */}
              <div className="grid gap-4">
                <h3 className="text-xl font-semibold font-headline">Sección "Nuestros Valores"</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="value1Title">Título Valor 1</Label>
                    <Input id="value1Title" value={content.value1Title} onChange={handleChange} />
                    <Label htmlFor="value1Desc">Descripción Valor 1</Label>
                    <Textarea id="value1Desc" value={content.value1Desc} onChange={handleChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="value2Title">Título Valor 2</Label>
                    <Input id="value2Title" value={content.value2Title} onChange={handleChange} />
                    <Label htmlFor="value2Desc">Descripción Valor 2</Label>
                    <Textarea id="value2Desc" value={content.value2Desc} onChange={handleChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="value3Title">Título Valor 3</Label>
                    <Input id="value3Title" value={content.value3Title} onChange={handleChange} />
                    <Label htmlFor="value3Desc">Descripción Valor 3</Label>
                    <Textarea id="value3Desc" value={content.value3Desc} onChange={handleChange} />
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
