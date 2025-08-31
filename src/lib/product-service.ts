import { db, storage } from './firebase';
import { collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { products as localProducts, type Product } from './products';
import Papa from 'papaparse';

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
