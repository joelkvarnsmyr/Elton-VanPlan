/**
 * Storage Service
 *
 * Handles file uploads to Firebase Storage with secure paths.
 * All uploads include userId in the path for security.
 */

import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// --- CONSTANTS ---

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', ...ALLOWED_IMAGE_TYPES];

// --- VALIDATION ---

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateFile(
  file: File | Blob,
  allowedTypes: string[],
  maxSize: number
): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `File too large: ${sizeMB}MB (max ${maxMB}MB)` };
  }

  if (file instanceof File && file.type && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type: ${file.type}` };
  }

  return { valid: true };
}

// --- UPLOAD FUNCTIONS ---

/**
 * Upload a receipt document
 * Path: /receipts/{userId}/{projectId}/{filename}
 */
export const uploadReceipt = async (
  file: File,
  userId: string,
  projectId: string,
  _shoppingItemId?: string // Kept for backwards compatibility
): Promise<string> => {
  const validation = validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileExtension = file.name.split('.').pop() || 'pdf';
  const fileName = `${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, `receipts/${userId}/${projectId}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

/**
 * Upload a chat image
 * Path: /chat-images/{userId}/{projectId}/{filename}
 * Note: Updated path to include userId for security
 */
export const uploadChatImage = async (
  base64Data: string,
  projectId: string,
  userId: string
): Promise<string> => {
  const { blob, mimeType } = base64ToBlob(base64Data);

  const validation = validateFile(blob, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const extension = mimeType.split('/')[1] || 'jpg';
  const fileName = `${uuidv4()}.${extension}`;

  // Updated path: includes userId for security
  const storageRef = ref(storage, `chat-images/${userId}/${projectId}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, blob);
  return await getDownloadURL(snapshot.ref);
};

/**
 * Upload an inspection image
 * Path: /inspections/images/{userId}/{projectId}/{filename}
 */
export const uploadInspectionImage = async (
  base64Data: string,
  projectId: string,
  userId: string
): Promise<string> => {
  const { blob, mimeType } = base64ToBlob(base64Data);

  const validation = validateFile(blob, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const extension = mimeType.split('/')[1] || 'jpg';
  const fileName = `${uuidv4()}.${extension}`;

  // Updated path: includes userId for security
  const storageRef = ref(storage, `inspections/images/${userId}/${projectId}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, blob);
  return await getDownloadURL(snapshot.ref);
};

/**
 * Upload inspection audio
 * Path: /inspections/audio/{userId}/{projectId}/{filename}
 */
export const uploadInspectionAudio = async (
  file: File,
  projectId: string,
  userId: string
): Promise<string> => {
  const validation = validateFile(file, ALLOWED_AUDIO_TYPES, MAX_AUDIO_SIZE);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileExtension = file.name.split('.').pop() || 'wav';
  const fileName = `${uuidv4()}.${fileExtension}`;

  // Updated path: includes userId for security
  const storageRef = ref(storage, `inspections/audio/${userId}/${projectId}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

/**
 * Upload user avatar
 * Path: /avatars/{userId}/{filename}
 */
export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<string> => {
  const validation = validateFile(file, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024); // 5MB limit for avatars
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, `avatars/${userId}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

/**
 * Upload a general project document
 * Path: /documents/{userId}/{projectId}/{filename}
 */
export const uploadDocument = async (
  file: File,
  userId: string,
  projectId: string
): Promise<string> => {
  const validation = validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileExtension = file.name.split('.').pop() || 'pdf';
  const fileName = `${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, `documents/${userId}/${projectId}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// --- UTILITY FUNCTIONS ---

/**
 * Convert base64 data to Blob
 */
export const base64ToBlob = (base64Data: string): { blob: Blob; mimeType: string } => {
  const parts = base64Data.split(',');
  const mimeMatch = parts[0]?.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const base64 = parts[1] || parts[0];

  try {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return { blob: new Blob([ab], { type: mimeType }), mimeType };
  } catch (error) {
    throw new Error('Invalid base64 data');
  }
};

/**
 * Get file extension from MIME type
 */
export const getExtensionFromMimeType = (mimeType: string): string => {
  const mapping: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
    'audio/mp4': 'm4a',
    'application/pdf': 'pdf'
  };

  return mapping[mimeType] || mimeType.split('/')[1] || 'bin';
};

/**
 * Estimate base64 file size (before decoding)
 */
export const estimateBase64Size = (base64Data: string): number => {
  const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  // Base64 encoding adds ~33% overhead
  return Math.ceil(base64.length * 0.75);
};
