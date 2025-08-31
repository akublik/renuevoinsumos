'use server';

import { db } from './firebase';
import { collection, getDocs, query, orderBy, limit, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import { products as localProducts, type Product } from './products';

/**
 * Fetches products. This function now consistently returns local mock data
 * for the chatbot to prevent permission errors for unauthenticated users.
 */
export async function getProducts(): Promise<Product[]> {
  return Promise.resolve(localProducts as Product[]);
}

/**
 * Fetches all products directly from Firestore.
 * Intended for server-side use where permissions are handled securely.
 */
export async function getProductsFromFirestore(productLimit?: number): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    let q;
    if (productLimit) {
        q = query(productsRef, orderBy('createdAt', 'desc'), limit(productLimit));
    } else {
        q = query(productsRef, orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    
    const firestoreProducts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Firestore timestamps need to be converted to serializable format for client components
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
      
      return {
        id: doc.id,
        name: data.name || '',
        brand: data.brand || '',
        description: data.description || '',
        category: data.category || 'Consumibles',
        price: data.price || 0,
        stock: data.stock || 0,
        imageUrl: data.imageUrl || '',
        images: data.images || [],
        color: data.color,
        size: data.size,
        technicalSheetUrl: data.technicalSheetUrl,
        createdAt: createdAt,
      } as unknown as Product; // Using unknown cast due to timestamp serialization
    });

    return firestoreProducts;
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    return []; // Return an empty array on error
  }
}

    