import { db, storage } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { HomePageContent, AboutPageContent } from './page-content-types';

const pagesCollection = 'pages';

export type BannerImageSlot = {
  type: 'url' | 'file' | 'empty';
  value: string | File | null;
  preview: string | null;
};

/**
 * Fetches the content for a specific page from Firestore.
 * @param pageName - The name of the page document (e.g., 'home', 'about').
 * @returns The content object for the page, or null if it doesn't exist or on error.
 */
export async function getPageContent<T>(pageName: string): Promise<T | null> {
  try {
    const docRef = doc(db, pagesCollection, pageName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // The 'updatedAt' field is metadata, so we can exclude it.
      const { updatedAt, ...content } = docSnap.data();
      return content as T;
    } else {
      console.log(`No content found for page: ${pageName}`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting page content for ${pageName}:`, error);
    // Return null to allow the UI to handle the "not found" or "error" state gracefully
    return null;
  }
}

const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    return getDownloadURL(snapshot.ref);
};

export async function updateHomePageContent(
  pageName: string,
  content: Omit<HomePageContent, 'heroImageUrls'>,
  imageSlots: BannerImageSlot[]
): Promise<void> {
  try {
    const newImageUrls: string[] = [];

    // Process all image slots asynchronously
    const processedUrls = await Promise.all(
      imageSlots.map(async (slot) => {
        if (slot.type === 'file' && slot.value instanceof File) {
          // Case 1: A new file has been uploaded
          return await uploadFile(
            slot.value,
            `pages/${pageName}/banner_${Date.now()}_${slot.value.name}`
          );
        } else if (slot.type === 'url' && typeof slot.value === 'string' && slot.value.trim()) {
          // Case 2: A URL is present (either new or existing)
          return slot.value;
        }
        // Case 3: The slot is empty or unchanged in a way we don't need to process
        return null;
      })
    );
    
    // Filter out null values to get the final list of URLs
    const finalImageUrls = processedUrls.filter((url): url is string => url !== null);

    const contentToSave: HomePageContent = {
        ...content,
        heroImageUrls: finalImageUrls
    };
    
    const docRef = doc(db, pagesCollection, pageName);
    await setDoc(docRef, {
      ...contentToSave,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    console.log(`Page content for ${pageName} updated successfully.`);
  } catch (error) {
    console.error(`Error updating page content for ${pageName}:`, error);
    throw new Error('Failed to update page content.');
  }
}


/**
 * Updates or creates the content for a specific page in Firestore.
 * @param pageName - The name of the page document to update/create.
 * @param content - The content object to save.
 */
export async function updatePageContent(pageName: string, content: HomePageContent | AboutPageContent): Promise<void> {
  try {
    const docRef = doc(db, pagesCollection, pageName);
    await setDoc(docRef, {
      ...content,
      updatedAt: serverTimestamp(),
    }, { merge: true }); // Use merge to avoid overwriting fields if not all are provided
    console.log(`Page content for ${pageName} updated successfully.`);
  } catch (error) {
    console.error(`Error updating page content for ${pageName}:`, error);
    throw new Error('Failed to update page content.');
  }
}
