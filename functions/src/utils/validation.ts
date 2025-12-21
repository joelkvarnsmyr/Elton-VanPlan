/**
 * Input Validation Utilities
 *
 * Provides validation for Cloud Functions input to prevent:
 * - DoS attacks via large payloads
 * - Invalid data types
 * - Malformed requests
 */

import { HttpsError } from 'firebase-functions/v2/https';

// --- SIZE LIMITS ---

export const LIMITS = {
  // Image sizes (in bytes, after base64 encoding ~1.37x original)
  MAX_IMAGE_SIZE_BASE64: 15 * 1024 * 1024, // 15MB base64 (~11MB original)
  MAX_AUDIO_SIZE_BASE64: 75 * 1024 * 1024, // 75MB base64 (~55MB original)
  MAX_DOCUMENT_SIZE_BASE64: 30 * 1024 * 1024, // 30MB base64 (~22MB original)

  // Text limits
  MAX_PROMPT_LENGTH: 50000, // 50k characters
  MAX_MESSAGE_LENGTH: 10000, // 10k characters
  MAX_HISTORY_LENGTH: 50, // Max chat history items

  // String limits
  MAX_PROJECT_ID_LENGTH: 100,
  MAX_REG_NO_LENGTH: 15,
  MAX_VIN_LENGTH: 20,
} as const;

// --- VALIDATORS ---

/**
 * Validate base64 image data
 */
export function validateBase64Image(
  data: unknown,
  fieldName: string = 'imageBase64',
  maxSize: number = LIMITS.MAX_IMAGE_SIZE_BASE64
): string {
  if (!data) {
    throw new HttpsError('invalid-argument', `${fieldName} is required`);
  }

  if (typeof data !== 'string') {
    throw new HttpsError('invalid-argument', `${fieldName} must be a string`);
  }

  // Check for valid base64 format (optional data URI prefix)
  const base64Data = data.includes(',') ? data.split(',')[1] : data;

  if (!base64Data || base64Data.length === 0) {
    throw new HttpsError('invalid-argument', `${fieldName} is empty or invalid`);
  }

  // Check size limit
  if (base64Data.length > maxSize) {
    const sizeMB = (base64Data.length / (1024 * 1024)).toFixed(1);
    const limitMB = (maxSize / (1024 * 1024)).toFixed(1);
    throw new HttpsError(
      'invalid-argument',
      `${fieldName} exceeds size limit: ${sizeMB}MB > ${limitMB}MB`
    );
  }

  // Validate base64 characters (basic check)
  if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
    throw new HttpsError('invalid-argument', `${fieldName} contains invalid base64 characters`);
  }

  return base64Data;
}

/**
 * Validate base64 audio data
 */
export function validateBase64Audio(
  data: unknown,
  fieldName: string = 'audioBase64'
): string {
  return validateBase64Image(data, fieldName, LIMITS.MAX_AUDIO_SIZE_BASE64);
}

/**
 * Validate string with length limit
 */
export function validateString(
  data: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
  } = {}
): string | undefined {
  const { required = false, minLength = 0, maxLength = 1000, pattern, patternMessage } = options;

  if (data === undefined || data === null || data === '') {
    if (required) {
      throw new HttpsError('invalid-argument', `${fieldName} is required`);
    }
    return undefined;
  }

  if (typeof data !== 'string') {
    throw new HttpsError('invalid-argument', `${fieldName} must be a string`);
  }

  if (data.length < minLength) {
    throw new HttpsError('invalid-argument', `${fieldName} must be at least ${minLength} characters`);
  }

  if (data.length > maxLength) {
    throw new HttpsError('invalid-argument', `${fieldName} exceeds maximum length of ${maxLength} characters`);
  }

  if (pattern && !pattern.test(data)) {
    throw new HttpsError('invalid-argument', patternMessage || `${fieldName} has invalid format`);
  }

  return data;
}

/**
 * Validate project ID
 */
export function validateProjectId(data: unknown): string {
  return validateString(data, 'projectId', {
    required: true,
    maxLength: LIMITS.MAX_PROJECT_ID_LENGTH,
    pattern: /^[a-zA-Z0-9_-]+$/,
    patternMessage: 'projectId contains invalid characters'
  }) as string;
}

/**
 * Validate registration number (Swedish format)
 */
export function validateRegNo(data: unknown, required: boolean = true): string | undefined {
  const regNo = validateString(data, 'regNo', {
    required,
    maxLength: LIMITS.MAX_REG_NO_LENGTH
  });

  if (!regNo) return undefined;

  // Normalize and validate Swedish format
  const normalized = regNo.toUpperCase().replace(/\s/g, '');

  // Swedish formats: ABC123 or ABC12D
  if (!/^[A-Z]{3}\d{2}[A-Z0-9]$/.test(normalized)) {
    throw new HttpsError('invalid-argument', 'regNo must be in Swedish format (ABC123 or ABC12D)');
  }

  return normalized;
}

/**
 * Validate VIN number
 */
export function validateVIN(data: unknown, required: boolean = true): string | undefined {
  const vin = validateString(data, 'vin', {
    required,
    minLength: 17,
    maxLength: 17
  });

  if (!vin) return undefined;

  // VIN is 17 characters, alphanumeric excluding I, O, Q
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin.toUpperCase())) {
    throw new HttpsError('invalid-argument', 'Invalid VIN format');
  }

  return vin.toUpperCase();
}

/**
 * Validate array with length limit
 */
export function validateArray<T>(
  data: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    maxLength?: number;
    itemValidator?: (item: unknown, index: number) => T;
  } = {}
): T[] {
  const { required = false, maxLength = 100, itemValidator } = options;

  if (data === undefined || data === null) {
    if (required) {
      throw new HttpsError('invalid-argument', `${fieldName} is required`);
    }
    return [];
  }

  if (!Array.isArray(data)) {
    throw new HttpsError('invalid-argument', `${fieldName} must be an array`);
  }

  if (data.length > maxLength) {
    throw new HttpsError('invalid-argument', `${fieldName} exceeds maximum length of ${maxLength} items`);
  }

  if (itemValidator) {
    return data.map((item, index) => itemValidator(item, index));
  }

  return data as T[];
}

/**
 * Validate chat history format
 */
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: string;
}

export function validateChatHistory(data: unknown): ChatMessage[] {
  return validateArray(data, 'history', {
    maxLength: LIMITS.MAX_HISTORY_LENGTH,
    itemValidator: (item, index) => {
      if (!item || typeof item !== 'object') {
        throw new HttpsError('invalid-argument', `history[${index}] must be an object`);
      }

      const msg = item as Record<string, unknown>;

      if (msg.role !== 'user' && msg.role !== 'model') {
        throw new HttpsError('invalid-argument', `history[${index}].role must be 'user' or 'model'`);
      }

      const content = validateString(msg.content, `history[${index}].content`, {
        required: true,
        maxLength: LIMITS.MAX_MESSAGE_LENGTH
      }) as string;

      let image: string | undefined;
      if (msg.image) {
        image = validateBase64Image(msg.image, `history[${index}].image`);
      }

      return { role: msg.role, content, image } as ChatMessage;
    }
  });
}

/**
 * Sanitize error message for client (remove sensitive info)
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof HttpsError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Remove sensitive information from error messages
    const message = error.message;

    // Remove API keys, paths, internal details
    const sanitized = message
      .replace(/api[_-]?key[s]?[:\s=]+[\w-]+/gi, '[API_KEY]')
      .replace(/\/[\w\/.-]+\.(ts|js)/g, '[FILE]')
      .replace(/at\s+[\w.]+\s+\([^)]+\)/g, '')
      .trim();

    // Limit length
    return sanitized.substring(0, 200);
  }

  return 'An unexpected error occurred';
}
