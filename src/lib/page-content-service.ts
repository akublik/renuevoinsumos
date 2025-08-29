import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { HomePageContent, AboutPageContent } from './page-content-types';

const pagesCollection = 'pages';

/**
 * Fetches the content for a specific page from Firestore.
 * @param pageName - The name of the page document (e.g., 'home', 'about').
 * @returns The content object for the page, or null if it doesn't exist.
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
    throw new Error('Failed to fetch page content.');
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
