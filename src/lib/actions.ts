
'use server';

import { addDoc, collection, doc, serverTimestamp, setDoc, writeBatch, updateDoc, deleteDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, getStorage } from 'firebase/storage';
import { revalidatePath } from 'next/cache';
import { db, storage } from './firebase';
import type { AboutPageContent, HomePageContent } from './page-content-types';
import type { Product } from './products';
import Papa from 'papaparse';
import type { OrderData, OrderStatus } from './orders';


const uploadFile = async (file: File, path: string, contentType: string): Promise<string> => {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file, { contentType });
    return getDownloadURL(snapshot.ref);
};

export async function addProductAction(formData: FormData) {
    try {
        getStorage(); // Ensures Storage is initialized in the server action context

        const priceString = formData.get('price') as string | null;
        const stockString = formData.get('stock') as string | null;

        if (!priceString || !stockString) {
            return { success: false, error: 'El precio y el stock son obligatorios.' };
        }
        
        const imageFile = formData.get('imageFile') as File | null;
        const imageUrl = formData.get('imageUrl') as string | null;
        const imageContentType = formData.get('imageContentType') as string | null;
        const pdfFile = formData.get('pdfFile') as File | null;
        const productName = formData.get('name') as string;

        let finalImageUrl: string | undefined;

        if (imageUrl) {
            finalImageUrl = imageUrl;
        } else if (imageFile && imageFile.size > 0 && imageContentType) {
            finalImageUrl = await uploadFile(imageFile, `products/${Date.now()}_${imageFile.name}`, imageContentType);
        }

        if (!finalImageUrl) {
            return { success: false, error: 'Se requiere una imagen del producto. Proporciona una URL o sube un archivo.' };
        }

        let pdfUrl: string | undefined;
        if (pdfFile && pdfFile.size > 0) {
            pdfUrl = await uploadFile(pdfFile, `tech-sheets/${Date.now()}_${pdfFile.name}`, 'application/pdf');
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
        const imageContentType = formData.get('imageContentType') as string | null;
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

        if (imageFile && imageFile.size > 0 && imageContentType) {
            finalImageUrl = await uploadFile(imageFile, `products/${Date.now()}_${imageFile.name}`, imageContentType);
        } else if (imageUrlFromForm) {
            finalImageUrl = imageUrlFromForm;
        }
        
        if (finalImageUrl) {
            updateData.imageUrl = finalImageUrl;
            updateData.images = [finalImageUrl];
        }

        if (pdfFile && pdfFile.size > 0) {
            updateData.technicalSheetUrl = await uploadFile(pdfFile, `tech-sheets/${Date.now()}_${pdfFile.name}`, 'application/pdf');
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
        const imageFile = formData.get('imageFile') as File | null;
        const imageContentType = formData.get('imageContentType') as string | null;
        let finalImageUrl = formData.get('heroImageUrl') as string;

        if (imageFile && imageFile.size > 0 && imageContentType) {
            finalImageUrl = await uploadFile(imageFile, `pages/${PAGE_ID}/${Date.now()}_${imageFile.name}`, imageContentType);
        }

        const content: HomePageContent = {
            heroTitle: formData.get('heroTitle') as string,
            heroSubtitle: formData.get('heroSubtitle') as string,
            heroButtonText: formData.get('heroButtonText') as string,
            heroImageUrl: finalImageUrl,
            whyTitle: formData.get('whyTitle') as string,
            whyDescription: formData.get('whyDescription') as string,
            whyPoint1: formData.get('whyPoint1') as string,
            whyPoint2: formData.get('whyPoint2') as string,
            whyPoint3: formData.get('whyPoint3') as string,
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
        const imageFile = formData.get('imageFile') as File | null;
        const imageContentType = formData.get('imageContentType') as string | null;
        let finalImageUrl = formData.get('heroImageUrl') as string;

        if (imageFile && imageFile.size > 0 && imageContentType) {
            finalImageUrl = await uploadFile(imageFile, `pages/${PAGE_ID}/${Date.now()}_${imageFile.name}`, imageContentType);
        }
        
        const content: AboutPageContent = {
            heroTitle: formData.get('heroTitle') as string,
            heroSubtitle: formData.get('heroSubtitle') as string,
            heroImageUrl: finalImageUrl,
            aboutTitle: formData.get('aboutTitle') as string,
            aboutDescription: formData.get('aboutDescription') as string,
            value1Title: formData.get('value1Title') as string,
            value1Desc: formData.get('value1Desc') as string,
            value2Title: formData.get('value2Title') as string,
            value2Desc: formData.get('value2Desc') as string,
            value3Title: formData.get('value3Title') as string,
            value3Desc: formData.get('value3Desc') as string,
        };

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
