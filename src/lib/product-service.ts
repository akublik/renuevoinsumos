import { db, storage, auth } from './firebase';
import { collection, addDoc, writeBatch, getDocs, serverTimestamp, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { products as localProducts, type Product } from './products';
import Papa from 'papaparse';

// Define a type for the data being added, excluding fields that will be generated.
type AddProductData = Omit<Product, 'id' | 'imageUrl' | 'images' | 'technicalSheetUrl' | 'createdAt'>;

// Function to upload a file and return its URL
const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    return getDownloadURL(snapshot.ref);
};

export async function addProduct(
    productData: AddProductData,
    imageSource: File | string, // Can be a file or a URL string
    pdfFile: File | null
): Promise<string | null> {
    try {
        let imageUrl: string;

        if (typeof imageSource === 'string') {
            // Use the provided URL directly
            imageUrl = imageSource;
        } else {
            // Upload the file and get the URL
            imageUrl = await uploadFile(imageSource, `products/${Date.now()}_${imageSource.name}`);
        }

        let pdfUrl: string | undefined = undefined;
        if (pdfFile) {
            pdfUrl = await uploadFile(pdfFile, `tech-sheets/${Date.now()}_${pdfFile.name}`);
        }

        const productToSave: any = {
            ...productData,
            price: parseFloat(productData.price as any),
            stock: parseInt(productData.stock as any, 10),
            imageUrl,
            images: [imageUrl],
            technicalSheetUrl: pdfUrl,
            createdAt: serverTimestamp(),
        };

        // Firestore does not accept 'undefined' values.
        // We need to remove optional fields if they are empty.
        if (!productToSave.color) {
            delete productToSave.color;
        }
        if (!productToSave.size) {
            delete productToSave.size;
        }
        if (!productToSave.technicalSheetUrl) {
            delete productToSave.technicalSheetUrl;
        }


        const docRef = await addDoc(collection(db, 'products'), productToSave);
        return docRef.id;

    } catch (error) {
        console.error("Error adding product: ", error);
        return null;
    }
}

/**
 * Fetches products. This function now consistently returns local mock data
 * for all public-facing parts of the application to prevent permission errors.
 * Firestore fetching will be handled separately in authenticated admin components.
 */
export async function getProducts(): Promise<Product[]> {
  // Always return local data for public users to avoid any permission issues.
  return Promise.resolve(localProducts as Product[]);
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

export const addProductsFromCSV = (file: File): Promise<{ successCount: number; errorCount: number; }> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data as CsvRow[];
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

                        const newProduct: Omit<Product, 'id'> = {
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
                            createdAt: new Date(), // Using client-side date for CSV
                        };
                        
                        const docRef = collection(db, "products").doc();
                        batch.set(docRef, { ...newProduct, createdAt: serverTimestamp() });
                        successCount++;

                    } catch(e) {
                        console.error('Error processing row:', row, e);
                        errorCount++;
                    }
                }
                
                try {
                    await batch.commit();
                    resolve({ successCount, errorCount });
                } catch (e) {
                     console.error("Error committing batch:", e);
                     reject(e);
                }
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
                reject(error);
            }
        });
    });
};
