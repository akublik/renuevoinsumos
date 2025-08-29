import { db, storage } from './firebase';
import { collection, addDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Product } from './products';
import Papa from 'papaparse';

// Define a type for the data being added, excluding fields that will be generated.
type AddProductData = Omit<Product, 'id' | 'imageUrl' | 'images' | 'technicalSheetUrl' | 'createdAt'>;

// Function to upload a file and return its URL
const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
};

export const addProduct = async (
    productData: AddProductData,
    imageFile: File,
    pdfFile: File | null
) => {
    try {
        // 1. Upload main image
        const imageUrl = await uploadFile(imageFile, `products/${Date.now()}_${imageFile.name}`);

        // 2. Upload PDF if it exists
        let pdfUrl: string | undefined = undefined;
        if (pdfFile) {
            pdfUrl = await uploadFile(pdfFile, `tech-sheets/${Date.now()}_${pdfFile.name}`);
        }

        // 3. Prepare data for Firestore
        const productToSave = {
            ...productData,
            imageUrl: imageUrl, // Main image URL
            images: [imageUrl], // For now, the main image is the only one in the array
            technicalSheetUrl: pdfUrl, // PDF URL, will be undefined if no file was uploaded
        };

        // 4. Add product document to Firestore
        const docRef = await addDoc(collection(db, 'products'), productToSave);

        console.log('Product added with ID: ', docRef.id);
        return docRef.id;

    } catch (error) {
        console.error("Error adding product: ", error);
        throw new Error('Failed to add product to the database.');
    }
};

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
                           console.error('Invalid row data:', row);
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
                        
                        const docRef = collection(db, "products").doc();
                        batch.set(docRef, newProduct);
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
