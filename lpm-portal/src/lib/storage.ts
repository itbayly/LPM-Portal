import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
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
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url; 
  } catch (error: any) {
    console.error("Firebase Storage Upload Error:", error);
    
    if (error.code === 'storage/unauthorized') {
      throw new Error("Permission denied: Check Firebase Storage Rules.");
    } else if (error.code === 'storage/bucket-not-found') {
      throw new Error("Bucket not found: Check storageBucket in firebase.ts.");
    }
    
    throw new Error("Failed to upload file to storage.");
  }
}

/**
 * Deletes a file from Firebase Storage.
 */
export async function deleteFileFromStorage(path: string): Promise<void> {
  if (!path) return;
  if (!storage) throw new Error("Storage not initialized");

  const storageRef = ref(storage, path);
  
  // We allow this to throw an error so the UI handles it
  await deleteObject(storageRef);
}