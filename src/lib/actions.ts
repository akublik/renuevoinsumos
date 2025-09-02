
'use server';

import { addDoc, collection, doc, serverTimestamp, setDoc, writeBatch, updateDoc, deleteDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, getStorage } from 'firebase/storage';
import { revalidatePath } from 'next/cache';
import { db, storage } from './firebase';
import type { AboutPageContent, HomePageContent, TeamMember } from './page-content-types';
import type { Product } from './products';
import Papa from 'papaparse';
import type { OrderData, OrderStatus } from './orders';
import { Resend } from 'resend';

const uploadFile = async (file: File, path: string): Promise<string> => {
    // Content type is inferred by uploadBytes from the file extension
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    return getDownloadURL(snapshot.ref);
};

export async function addProductAction(formData: FormData) {
    try {
        getStorage(); 

        const priceString = formData.get('price') as string | null;
        const stockString = formData.get('stock') as string | null;

        if (!priceString || !stockString) {
            return { success: false, error: 'El precio y el stock son obligatorios.' };
        }
        
        const imageFile = formData.get('imageFile') as File | null;
        const imageUrl = formData.get('imageUrl') as string | null;
        const pdfFile = formData.get('pdfFile') as File | null;
        const productName = formData.get('name') as string;

        let finalImageUrl: string | undefined;

        if (imageUrl) {
            finalImageUrl = imageUrl;
        } else if (imageFile && imageFile.size > 0) {
            finalImageUrl = await uploadFile(imageFile, `products/${Date.now()}_${imageFile.name}`);
        }

        if (!finalImageUrl) {
            return { success: false, error: 'Se requiere una imagen del producto. Proporciona una URL o sube un archivo.' };
        }

        let pdfUrl: string | undefined;
        if (pdfFile && pdfFile.size > 0) {
            pdfUrl = await uploadFile(pdfFile, `tech-sheets/${Date.now()}_${pdfFile.name}`);
        }

        const productData: Omit<Product, 'id'> = {
            name: productName,
            brand: formData.get('brand') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as Product['category'],
            price: parseFloat(priceString),
            stock: parseInt(stockString, 10),
            color: formData.get('color') as string || undefined,
            size: formData.get('size') as string || undefined,
            isFeatured: formData.get('isFeatured') === 'on',
            imageUrl: finalImageUrl,
            images: [finalImageUrl],
            technicalSheetUrl: pdfUrl,
            createdAt: serverTimestamp() as any, 
        };
        
        const productToSave: { [key: string]: any } = { ...productData };
        
        Object.keys(productToSave).forEach(key => {
            if (productToSave[key] === undefined || productToSave[key] === null || productToSave[key] === '') {
                delete productToSave[key];
            }
        });


        const docRef = await addDoc(collection(db, 'products'), productToSave);
        
        revalidatePath('/admin/products');
        revalidatePath('/products');
        revalidatePath('/');
        
        return { success: true, docId: docRef.id, productName };

    } catch (error) {
        console.error("Error in addProductAction: ", error);
        return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
}

export async function updateProductAction(formData: FormData) {
    try {
        getStorage();

        const productId = formData.get('productId') as string;
        if (!productId) {
            return { success: false, error: 'Falta el ID del producto.' };
        }

        const priceString = formData.get('price') as string | null;
        const stockString = formData.get('stock') as string | null;

        if (!priceString || !stockString) {
            return { success: false, error: 'El precio y el stock son obligatorios.' };
        }

        const imageFile = formData.get('imageFile') as File | null;
        const imageUrlFromForm = formData.get('imageUrl') as string | null;
        const pdfFile = formData.get('pdfFile') as File | null;
        const productName = formData.get('name') as string;

        const updateData: { [key: string]: any } = {
            name: productName,
            brand: formData.get('brand') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as Product['category'],
            price: parseFloat(priceString),
            stock: parseInt(stockString, 10),
            color: formData.get('color') as string || undefined,
            size: formData.get('size') as string || undefined,
            isFeatured: formData.get('isFeatured') === 'on',
            updatedAt: serverTimestamp(),
        };

        let finalImageUrl: string | undefined;

        if (imageFile && imageFile.size > 0) {
            finalImageUrl = await uploadFile(imageFile, `products/${Date.now()}_${imageFile.name}`);
        } else if (imageUrlFromForm) {
            finalImageUrl = imageUrlFromForm;
        }
        
        if (finalImageUrl) {
            updateData.imageUrl = finalImageUrl;
            updateData.images = [finalImageUrl];
        }

        if (pdfFile && pdfFile.size > 0) {
            updateData.technicalSheetUrl = await uploadFile(pdfFile, `tech-sheets/${Date.now()}_${pdfFile.name}`);
        }

        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined || updateData[key] === null || updateData[key] === '') {
                delete updateData[key];
            }
        });

        const docRef = doc(db, 'products', productId);
        await updateDoc(docRef, updateData);

        revalidatePath(`/admin/products/edit/${productId}`);
        revalidatePath('/admin/products');
        revalidatePath('/products');
        revalidatePath(`/products/${productId}`);
        revalidatePath('/');

        return { success: true, productName };

    } catch (error) {
        console.error("Error in updateProductAction: ", error);
        return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
}


export async function updateHomePageContentAction(formData: FormData) {
    const PAGE_ID = 'home';
    try {
        getStorage();
        const heroImageFile = formData.get('heroImageFile') as File | null;
        let finalHeroImageUrl = formData.get('heroImageUrl') as string;

        if (heroImageFile && heroImageFile.size > 0) {
            finalHeroImageUrl = await uploadFile(heroImageFile, `pages/${PAGE_ID}/hero_${Date.now()}_${heroImageFile.name}`);
        }

        const whyImageFile = formData.get('whyImageFile') as File | null;
        let finalWhyImageUrl = formData.get('whyImageUrl') as string;
        if (whyImageFile && whyImageFile.size > 0) {
            finalWhyImageUrl = await uploadFile(whyImageFile, `pages/${PAGE_ID}/why_${Date.now()}_${whyImageFile.name}`);
        }

        const content: HomePageContent = {
            heroTitle: formData.get('heroTitle') as string,
            heroSubtitle: formData.get('heroSubtitle') as string,
            heroButtonText: formData.get('heroButtonText') as string,
            heroImageUrl: finalHeroImageUrl,
            whyTitle: formData.get('whyTitle') as string,
            whyDescription: formData.get('whyDescription') as string,
            whyPoint1: formData.get('whyPoint1') as string,
            whyPoint2: formData.get('whyPoint2') as string,
            whyPoint3: formData.get('whyPoint3') as string,
            whyImageUrl: finalWhyImageUrl,
        };

        const docRef = doc(db, 'pages', PAGE_ID);
        await setDoc(docRef, {
            ...content,
            updatedAt: serverTimestamp(),
        }, { merge: true });

        revalidatePath('/');
        revalidatePath('/admin/pages/home');
        return { success: true };

    } catch (error) {
        console.error(`Error updating page content for ${PAGE_ID}:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update page content.' };
    }
}

export async function updateAboutPageContentAction(formData: FormData) {
    const PAGE_ID = 'about';
    try {
        getStorage();

        // Handle Hero Image
        const heroImageFile = formData.get('heroImageFile') as File | null;
        let finalHeroImageUrl = formData.get('heroImageUrl') as string;
        if (heroImageFile && heroImageFile.size > 0) {
            finalHeroImageUrl = await uploadFile(heroImageFile, `pages/${PAGE_ID}/hero_${Date.now()}_${heroImageFile.name}`);
        }

        // Handle About Image
        const aboutImageFile = formData.get('aboutImageFile') as File | null;
        let finalAboutImageUrl = formData.get('aboutImageUrl') as string;
        if (aboutImageFile && aboutImageFile.size > 0) {
            finalAboutImageUrl = await uploadFile(aboutImageFile, `pages/${PAGE_ID}/about_${Date.now()}_${aboutImageFile.name}`);
        }

        // Handle Team Members
        const team: TeamMember[] = [];
        const memberCount = Array.from(formData.keys()).filter(key => key.startsWith('teamName_')).length;

        for (let i = 0; i < memberCount; i++) {
            const name = formData.get(`teamName_${i}`) as string;
            const role = formData.get(`teamRole_${i}`) as string;
            let imageUrl = formData.get(`teamImageUrl_${i}`) as string;
            const imageFile = formData.get(`teamImageFile_${i}`) as File | null;

            if (imageFile && imageFile.size > 0) {
                imageUrl = await uploadFile(imageFile, `pages/${PAGE_ID}/team_${i}_${Date.now()}_${imageFile.name}`);
            }

            if (name && role) { // Only add if name and role are present
                team.push({ name, role, imageUrl });
            }
        }

        const content: AboutPageContent = {
            heroTitle: formData.get('heroTitle') as string,
            heroSubtitle: formData.get('heroSubtitle') as string,
            heroImageUrl: finalHeroImageUrl,
            aboutTitle: formData.get('aboutTitle') as string,
            aboutDescription: formData.get('aboutDescription') as string,
            aboutImageUrl: finalAboutImageUrl,
            teamTitle: formData.get('teamTitle') as string,
            team: team,
        };

        const docRef = doc(db, 'pages', PAGE_ID);
        await setDoc(docRef, { ...content, updatedAt: serverTimestamp() });

        revalidatePath('/about');
        revalidatePath('/admin/pages/about');
        return { success: true };

    } catch (error) {
        console.error(`Error updating page content for ${PAGE_ID}:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update page content.' };
    }
}


const validCategories: Product['category'][] = ['Equipamiento', 'Consumibles', 'Instrumental', 'Primeros Auxilios'];

type CsvRow = {
    PRODUCTO: string;
    MARCA: string;
    DESCRIPCION: string;
    CATEGORIA: string;
    PRECIO: string;
    STOCK: string;
    COLOR?: string;
    TALLA?: string;
    IMAGEN: string;
};

export async function addProductsFromCSVAction(csvContent: string): Promise<{ success: boolean; successCount?: number; errorCount?: number; error?: string }> {
    try {
        const results = Papa.parse<CsvRow>(csvContent, {
            header: true,
            skipEmptyLines: true,
        });

        const rows = results.data;
        let successCount = 0;
        let errorCount = 0;

        const batch = writeBatch(db);

        for (const row of rows) {
            try {
                const price = parseFloat(row.PRECIO);
                const stock = parseInt(row.STOCK, 10);
                const category = row.CATEGORIA as Product['category'];

                if (!row.PRODUCTO || !row.IMAGEN || isNaN(price) || isNaN(stock) || !validCategories.includes(category)) {
                   console.error('Invalid or incomplete row data, skipping:', row);
                   errorCount++;
                   continue;
                }

                const newProduct: Omit<Product, 'id' | 'createdAt'> = {
                    name: row.PRODUCTO,
                    brand: row.MARCA,
                    description: row.DESCRIPCION,
                    category: category,
                    price: price,
                    stock: stock,
                    imageUrl: row.IMAGEN,
                    images: [row.IMAGEN],
                    color: row.COLOR || undefined,
                    size: row.TALLA || undefined,
                };
                
                const docRef = doc(collection(db, "products"));
                
                const productToSave: { [key: string]: any } = { ...newProduct, createdAt: serverTimestamp() };

                // Clean up empty optional fields to prevent Firestore errors
                Object.keys(productToSave).forEach(key => {
                    if (productToSave[key] === undefined || productToSave[key] === null || productToSave[key] === '') {
                        delete productToSave[key];
                    }
                });

                batch.set(docRef, productToSave);
                successCount++;

            } catch(e) {
                console.error('Error processing row:', row, e);
                errorCount++;
            }
        }
        
        await batch.commit();
        revalidatePath('/admin/products');
        revalidatePath('/products');

        return { success: true, successCount, errorCount };

    } catch (error) {
        console.error("Error in addProductsFromCSVAction: ", error);
        return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
}

export async function createOrderAction(orderData: OrderData) {
  try {
    const { customer, ...restOfOrderData } = orderData;
    const { ruc, needsInvoice, additionalNotes, ...restOfCustomer } = customer;

    const customerToSave: { [key: string]: any } = { ...restOfCustomer };
    if (needsInvoice) {
        customerToSave.needsInvoice = true;
        customerToSave.ruc = ruc;
    }
    if (additionalNotes) {
        customerToSave.additionalNotes = additionalNotes;
    }
    
    const orderToSave = {
      ...restOfOrderData,
      customer: customerToSave,
      status: 'Pendiente' as const,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'orders'), orderToSave);
    revalidatePath('/admin/orders');
    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create order.' };
  }
}

export async function deleteProductAction(productId: string) {
  if (!productId) {
    return { success: false, error: "Se requiere el ID del producto." };
  }
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: error instanceof Error ? error.message : 'No se pudo eliminar el producto.' };
  }
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  if (!orderId || !status) {
    return { success: false, error: "Se requiere el ID del pedido y el nuevo estado." };
  }
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: status });
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: error instanceof Error ? error.message : 'No se pudo actualizar el estado del pedido.' };
  }
}

export async function deleteOrderAction(orderId: string) {
  if (!orderId) {
    return { success: false, error: "Se requiere el ID del pedido." };
  }
  try {
    const docRef = doc(db, 'orders', orderId);
    await deleteDoc(docRef);

    revalidatePath('/admin/customers');
    revalidatePath('/admin/orders');

    return { success: true };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { success: false, error: error instanceof Error ? error.message : 'No se pudo eliminar el pedido.' };
  }
}

export async function sendContactFormEmailAction(formData: FormData) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !subject || !message) {
        return { success: false, error: "Todos los campos son obligatorios." };
    }
    
    try {
        await resend.emails.send({
            from: 'Insumos Online <onboarding@resend.dev>', // Must be a verified domain in Resend
            to: 'info@estudionet.net',
            reply_to: email,
            subject: `Nuevo mensaje de contacto: ${subject}`,
            html: `
                <p>Has recibido un nuevo mensaje desde el formulario de contacto de tu sitio web.</p>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Asunto:</strong> ${subject}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${message}</p>
            `,
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending email with Resend:", error);
        return { success: false, error: "No se pudo enviar el mensaje. Por favor, inténtalo de nuevo más tarde." };
    }
}
