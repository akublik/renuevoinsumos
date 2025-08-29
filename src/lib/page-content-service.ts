import { db, storage } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { HomePageContent, AboutPageContent } from './page-content-types';

const pagesCollection = 'pages';

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

export async function updateHomePageContent(pageName: string, content: HomePageContent, bannerImages: File[]): Promise<void> {
  try {
    const contentToSave: Partial<HomePageContent> & { heroImageUrls: string[] } = {
        ...content,
        heroImageUrls: content.heroImageUrls || []
    };

    if (bannerImages.length > 0) {
      const uploadPromises = bannerImages.map(file => 
        uploadFile(file, `pages/${pageName}/banner_${Date.now()}_${file.name}`)
      );
      const newImageUrls = await Promise.all(uploadPromises);
      contentToSave.heroImageUrls.push(...newImageUrls);
    }
    
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
