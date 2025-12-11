
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

export const uploadChatImage = async (base64Data: string, projectId: string): Promise<string> => {
    // Convert base64 to Blob
    const byteString = atob(base64Data.split(',')[1] || base64Data);
    const mimeString = base64Data.split(',')[0]?.match(/:(.*?);/)?.[1] || 'image/jpeg';

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });

    const fileName = `${uuidv4()}.${mimeString.split('/')[1]}`;
    const storageRef = ref(storage, `chat-images/${projectId}/${fileName}`);

    const snapshot = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
};

export const base64ToBlob = (base64Data: string): { blob: Blob; mimeType: string } => {
    const parts = base64Data.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const byteString = atob(parts[1] || parts[0]);

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return { blob: new Blob([ab], { type: mimeType }), mimeType };
};