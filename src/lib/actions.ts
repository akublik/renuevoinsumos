
'use server';

import { addDoc, collection, doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { revalidatePath } from 'next/cache';
import { db, storage } from './firebase';
import type { AboutPageContent, HomePageContent } from './page-content-types';
import type { Product } from './products';
import Papa from 'papaparse';
import type { OrderData } from './orders';


const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    return getDownloadURL(snapshot.ref);
};

export async function addProductAction(formData: FormData) {
    try {
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
            return { success: false, error: 'Se requiere una imagen del producto (URL o archivo).' };
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
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string, 10),
            color: formData.get('color') as string || undefined,
            size: formData.get('size') as string || undefined,
            imageUrl: finalImageUrl,
            images: [finalImageUrl],
            technicalSheetUrl: pdfUrl,
            createdAt: serverTimestamp() as any, // Cast to any to satisfy serverTimestamp type
        };
        
        const productToSave: { [key: string]: any } = { ...productData };
        
        // Clean up empty optional fields to prevent Firestore errors
        Object.keys(productToSave).forEach(key => {
            if (productToSave[key] === undefined || productToSave[key] === null || productToSave[key] === '') {
                delete productToSave[key];
            }
        });


        const docRef = await addDoc(collection(db, 'products'), productToSave);
        
        revalidatePath('/admin/products');
        revalidatePath('/products');
        
        return { success: true, docId: docRef.id, productName };

    } catch (error) {
        console.error("Error in addProductAction: ", error);
        return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
}


export async function updateHomePageContentAction(formData: FormData) {
    const PAGE_ID = 'home';
    try {
        const content: HomePageContent = {
            heroTitle: formData.get('heroTitle') as string,
            heroSubtitle: formData.get('heroSubtitle') as string,
            heroButtonText: formData.get('heroButtonText') as string,
            whyTitle: formData.get('whyTitle') as string,
            whyDescription: formData.get('whyDescription') as string,
            whyPoint1: formData.get('whyPoint1') as string,
            whyPoint2: formData.get('whyPoint2') as string,
            whyPoint3: formData.get('whyPoint3') as string,
            heroImageUrls: formData.getAll('heroImageUrls') as string[],
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

export async function updateAboutPageContentAction(content: AboutPageContent) {
    const PAGE_ID = 'about';
    try {
        const docRef = doc(db, 'pages', PAGE_ID);
        await setDoc(docRef, {
            ...content,
            updatedAt: serverTimestamp(),
        }, { merge: true });

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
    const orderToSave = {
      ...orderData,
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

    