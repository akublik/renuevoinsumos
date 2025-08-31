import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
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
