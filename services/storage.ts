
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const uploadReceipt = async (file: File, userId: string, projectId: string, shoppingItemId: string): Promise<string> => {
    if (!file) {
        throw new Error("No file provided for upload.");
    }

    // Create a unique file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // Create a reference to the file location
    const storageRef = ref(storage, `receipts/${userId}/${projectId}/${fileName}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
};