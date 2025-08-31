'use server';

import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { revalidatePath } from 'next/cache';
import { db, storage } from './firebase';
import type { AboutPageContent, HomePageContent } from './page-content-types';

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

        let pdfUrl: string | undefined = undefined;
        if (pdfFile && pdfFile.size > 0) {
            pdfUrl = await uploadFile(pdfFile, `tech-sheets/${Date.now()}_${pdfFile.name}`);
        }

        const productData: any = {
            name: productName,
            brand: formData.get('brand') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string, 10),
            color: formData.get('color') as string,
            size: formData.get('size') as string,
            imageUrl: finalImageUrl,
            images: [finalImageUrl],
            technicalSheetUrl: pdfUrl,
            createdAt: serverTimestamp(),
        };
        
        // Clean up empty optional fields to prevent Firestore errors
        Object.keys(productData).forEach(key => {
            if (productData[key] === '' || productData[key] === undefined || productData[key] === null) {
                delete productData[key];
            }
        });


        const docRef = await addDoc(collection(db, 'products'), productData);
        
        revalidatePath('/admin/products');
        
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
