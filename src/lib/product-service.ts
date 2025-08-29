import { db, storage } from './firebase';
import { collection, addDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Product } from './products';
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
    imageFile: File,
    pdfFile: File | null
): Promise<string> {
    try {
        console.log("Starting product addition process...");

        // 1. Upload main image
        console.log("Uploading image...");
        const imageUrl = await uploadFile(imageFile, `products/${Date.now()}_${imageFile.name}`);
        console.log("Image uploaded successfully:", imageUrl);

        // 2. Upload PDF if it exists
        let pdfUrl: string | undefined = undefined;
        if (pdfFile) {
            console.log("Uploading PDF...");
            pdfUrl = await uploadFile(pdfFile, `tech-sheets/${Date.now()}_${pdfFile.name}`);
            console.log("PDF uploaded successfully:", pdfUrl);
        }

        // 3. Prepare data for Firestore
        const productToSave = {
            ...productData,
            imageUrl,
            images: [imageUrl],
            technicalSheetUrl: pdfUrl,
            createdAt: serverTimestamp(),
        };
        console.log("Product data to save:", productToSave);

        // 4. Add product document to Firestore
        const docRef = await addDoc(collection(db, 'products'), productToSave);
        console.log('Product added with ID: ', docRef.id);
        
        return docRef.id;

    } catch (error) {
        console.error("Error adding product: ", error);
        // Re-throw the error to be caught by the calling function
        if (error instanceof Error) {
            throw new Error(`Failed to add product: ${error.message}`);
        }
        throw new Error('An unknown error occurred while adding the product.');
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
                let batchSize = 0;
                const batches = [];

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
                            createdAt: serverTimestamp() as any, // Firestore will convert this
                        };
                        
                        const docRef = collection(db, "products").doc();
                        batch.set(docRef, newProduct);
                        successCount++;

                    } catch(e) {
                        console.error('Error processing row:', row, e);
                        errorCount++;
                    }
                }
                
                try {
                    console.log(`Committing batch of ${successCount} products...`);
                    await batch.commit();
                    console.log("Batch committed successfully.");
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
