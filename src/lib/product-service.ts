
'use server';

import { db } from './firebase';
import { collection, getDocs, query, orderBy, limit, doc, getDoc, where, QueryConstraint } from 'firebase/firestore';
import type { Product } from './products';

/**
 * Fetches a single product by its ID from Firestore.
 * @param id The ID of the product to fetch.
 * @returns The product object or null if not found.
 */
export async function getProductById(id: string): Promise<Product | null> {
    try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.log('No such product found!');
            return null;
        }

        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();

        return {
            id: docSnap.id,
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
            isFeatured: data.isFeatured || false,
            technicalSheetUrl: data.technicalSheetUrl,
            createdAt: createdAt,
        } as unknown as Product;

    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return null;
    }
}


/**
 * Fetches products from Firestore, with optional filters.
 * @param {object} [options] - Optional filters.
 * @param {number} [options.productLimit] - The maximum number of products to return.
 * @param {boolean} [options.featuredOnly] - Whether to return only featured products.
 */
export async function getProductsFromFirestore(options: { productLimit?: number, featuredOnly?: boolean } = {}): Promise<Product[]> {
  try {
    const { productLimit, featuredOnly } = options;
    const productsRef = collection(db, 'products');
    
    const queryConstraints: QueryConstraint[] = [];

    if (featuredOnly) {
      queryConstraints.push(where('isFeatured', '==', true));
       // No ordering is applied here to avoid needing a composite index for this specific query
    } else {
      queryConstraints.push(orderBy('createdAt', 'desc'));
    }

    if (productLimit) {
      queryConstraints.push(limit(productLimit));
    }

    const q = query(productsRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const firestoreProducts = querySnapshot.docs.map(doc => {
      const data = doc.data();
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
        isFeatured: data.isFeatured || false,
        technicalSheetUrl: data.technicalSheetUrl,
        createdAt: createdAt,
      } as unknown as Product;
    });

    return firestoreProducts;
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    return [];
  }
}
