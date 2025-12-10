import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase"; 

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 */
export async function uploadFileToStorage(file: File, path: string): Promise<string> {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  // Debugging: Check if storage is initialized
  if (!storage) {
    console.error("Firebase Storage is not initialized! Check firebase.ts");
    throw new Error("Storage configuration error");
  }

  const storageRef = ref(storage, path);

  try {
    console.log(`Starting upload for: ${path}`);
    const snapshot = await uploadBytes(storageRef, file);
    console.log("Upload complete, fetching URL...");
    
    const url = await getDownloadURL(snapshot.ref);
    console.log("URL retrieved:", url);
    
    return url; 
  } catch (error: any) {
    console.error("Firebase Storage Upload Error:", error);
    
    // Help identify specific permission/config issues
    if (error.code === 'storage/unauthorized') {
      throw new Error("Permission denied: Check Firebase Storage Rules.");
    } else if (error.code === 'storage/bucket-not-found') {
      throw new Error("Bucket not found: Check storageBucket in firebase.ts.");
    }
    
    throw new Error("Failed to upload file to storage.");
  }
}