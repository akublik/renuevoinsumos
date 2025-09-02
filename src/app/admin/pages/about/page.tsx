
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPageContent } from '@/lib/page-content-service';
import { updateAboutPageContentAction } from '@/lib/actions';
import type { AboutPageContent, TeamMember } from '@/lib/page-content-types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Link2, PlusCircle, Trash2 } from 'lucide-react';
import { aboutPageContent as defaultContent } from '@/lib/page-content-data';

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
        setContent(pageContent || defaultContent);
      } catch (error) {
        console.error("Failed to load page content", error);
        toast({ title: "Error", description: "No se pudo cargar el contenido. Se mostrará un formulario en blanco.", variant: "destructive" });
        setContent(defaultContent);
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, [toast]);

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setContent(prev => prev ? { ...prev, [id]: value } : null);
  };
  
  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    setContent(prev => {
      if (!prev) return null;
      const newTeam = [...(prev.team || [])];
      newTeam[index] = { ...newTeam[index], [field]: value };
      return { ...prev, team: newTeam };
    });
  };

  const addTeamMember = () => {
    setContent(prev => {
        if (!prev) return null;
        const newMember: TeamMember = { name: '', role: '', imageUrl: '' };
        return { ...prev, team: [...(prev.team || []), newMember] };
    });
  };

  const removeTeamMember = (index: number) => {
    setContent(prev => {
        if (!prev) return null;
        const newTeam = [...(prev.team || [])];
        newTeam.splice(index, 1);
        return { ...prev, team: newTeam };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setIsSaving(true);
    
    const formData = new FormData();
    // Append all simple key-value pairs from content
    Object.entries(content).forEach(([key, value]) => {
        if (typeof value === 'string') {
            formData.append(key, value);
        }
    });

    // Handle file inputs and complex objects like 'team'
    const imageHeroFile = (document.querySelector('input[name="heroImageFile"]') as HTMLInputElement)?.files?.[0];
    if (imageHeroFile) {
        formData.append('heroImageFile', imageHeroFile);
    }
    
    const imageAboutFile = (document.querySelector('input[name="aboutImageFile"]') as HTMLInputElement)?.files?.[0];
    if (imageAboutFile) {
        formData.append('aboutImageFile', imageAboutFile);
    }
    
    // Serialize team data and handle team member image files
    content.team?.forEach((member, index) => {
        formData.append(`team[${index}][name]`, member.name);
        formData.append(`team[${index}][role]`, member.role);
        formData.append(`team[${index}][imageUrl]`, member.imageUrl);
        
        const memberImageFile = (document.querySelector(`input[name="teamImageFile_${index}"]`) as HTMLInputElement)?.files?.[0];
        if (memberImageFile) {
            formData.append(`teamImageFile_${index}`, memberImageFile);
        }
    });


    try {
      await updateAboutPageContentAction(formData);
      toast({ title: "Éxito", description: "Contenido de la página 'Nosotros' guardado." });
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
                <h3 className="text-xl font-semibold font-headline">Sección Principal (Banner)</h3>
                <div className="grid gap-2">
                  <Label htmlFor="heroTitle">Título Principal</Label>
                  <Input id="heroTitle" value={content.heroTitle || ''} onChange={handleContentChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="heroSubtitle">Subtítulo</Label>
                  <Textarea id="heroSubtitle" value={content.heroSubtitle || ''} onChange={handleContentChange} />
                </div>
                <div className="grid gap-2">
                    <Label>Imagen del Banner</Label>
                    <ImageInput 
                        initialUrl={content.heroImageUrl}
                        onUrlChange={(url) => setContent(p => p ? {...p, heroImageUrl: url} : null)}
                        fileInputName="heroImageFile"
                        isSaving={isSaving}
                    />
                </div>
              </div>

              {/* About Section */}
              <div className="grid gap-4 border-b pb-8">
                <h3 className="text-xl font-semibold font-headline">Sección "Sobre Insumos Online"</h3>
                <div className="grid gap-2">
                  <Label htmlFor="aboutTitle">Título</Label>
                  <Input id="aboutTitle" value={content.aboutTitle || ''} onChange={handleContentChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="aboutDescription">Descripción</Label>
                  <Textarea id="aboutDescription" rows={6} value={content.aboutDescription || ''} onChange={handleContentChange} />
                </div>
                 <div className="grid gap-2">
                    <Label>Imagen de la Sección</Label>
                    <ImageInput 
                        initialUrl={content.aboutImageUrl}
                        onUrlChange={(url) => setContent(p => p ? {...p, aboutImageUrl: url} : null)}
                        fileInputName="aboutImageFile"
                        isSaving={isSaving}
                    />
                </div>
              </div>

              {/* Team Section */}
              <div className="grid gap-6">
                <h3 className="text-xl font-semibold font-headline">Sección "Nuestro Equipo"</h3>
                 <div className="grid gap-2">
                  <Label htmlFor="teamTitle">Título de la Sección</Label>
                  <Input id="teamTitle" value={content.teamTitle || ''} onChange={handleContentChange} placeholder="Ej: Conoce a Nuestro Equipo"/>
                </div>
                <div className="space-y-6">
                    {(content.team || []).map((member, index) => (
                        <Card key={index} className="p-4">
                            <CardContent className="p-0 grid md:grid-cols-3 gap-4 items-center">
                                <div className="md:col-span-1">
                                    <Label>Foto del Miembro</Label>
                                     <ImageInput 
                                        initialUrl={member.imageUrl}
                                        onUrlChange={(url) => handleTeamMemberChange(index, 'imageUrl', url)}
                                        fileInputName={`teamImageFile_${index}`}
                                        isSaving={isSaving}
                                    />
                                </div>
                                <div className="md:col-span-2 grid gap-4">
                                     <div className="grid gap-2">
                                        <Label htmlFor={`teamName_${index}`}>Nombre</Label>
                                        <Input id={`teamName_${index}`} value={member.name || ''} onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`teamRole_${index}`}>Cargo / Rol</Label>
                                        <Input id={`teamRole_${index}`} value={member.role || ''} onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)} />
                                    </div>
                                </div>
                                 <div className="md:col-span-3 flex justify-end">
                                    <Button type="button" variant="destructive" size="sm" onClick={() => removeTeamMember(index)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar Miembro
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Button type="button" variant="outline" onClick={addTeamMember}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Miembro del Equipo
                </Button>
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

// Reusable Image Input Component
interface ImageInputProps {
    initialUrl: string;
    onUrlChange: (url: string) => void;
    fileInputName: string;
    isSaving: boolean;
}

function ImageInput({ initialUrl, onUrlChange, fileInputName, isSaving }: ImageInputProps) {
    const [imageUrl, setImageUrl] = useState(initialUrl || '');
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        setImageUrl(initialUrl || '');
    }, [initialUrl]);
    
    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const localUrl = URL.createObjectURL(file);
            setImageUrl(localUrl); // Show local preview
            onUrlChange(localUrl);
        }
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        setImageUrl(newUrl);
        setImageFile(null); // Clear file if URL is pasted
        onUrlChange(newUrl);
    };

    return (
        <div className="flex items-center gap-4">
            <div className="w-24 h-24 relative border rounded-md overflow-hidden bg-muted">
                {imageUrl && <Image src={imageUrl} alt="Vista previa" fill className="object-cover" />}
            </div>
            <div className="flex-1 grid gap-3">
                <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground"/>
                    <Input 
                        type="text" 
                        placeholder="Pega una URL de imagen aquí" 
                        value={imageUrl || ''}
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
                    name={fileInputName}
                    accept="image/*" 
                    onChange={handleImageFileChange}
                    className="cursor-pointer" 
                    disabled={isSaving}
                />
            </div>
        </div>
    );
}

    