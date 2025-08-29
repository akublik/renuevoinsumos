import { db, storage } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Product } from './products';

// Define a type for the data being added, excluding fields that will be generated.
type AddProductData = Omit<Product, 'id' | 'imageUrl' | 'images' | 'technicalSheetUrl'> & {
    technicalSheetUrl?: string;
};

// Function to upload a file and return its URL
const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    return getDownloadURL(snapshot.ref);
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
            createdAt: serverTimestamp(),
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
