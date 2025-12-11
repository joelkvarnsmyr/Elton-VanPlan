/**
 * ANALYTICS SERVICE
 * Loggning av feature usage och AI-interaktioner för framtida analys
 */

import { FEATURES } from '@/config/features';
import { PROMPT_METADATA } from '@/config/prompts';
import { db } from '@/services/firebase';
import { collection, addDoc, writeBatch, doc, Timestamp } from 'firebase/firestore';

/**
 * Feature usage event
 */
export interface FeatureUsageEvent {
  feature: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * AI usage event
 */
export interface AIUsageEvent {
  model: string;
  promptVersion?: string;
  userId?: string;
  projectId?: string;
  timestamp: string;
  tokensUsed?: number;
  responseTimeMs?: number;
  success: boolean;
  error?: string;
}

// In-memory buffer for analytics (kan senare skickas till Firestore eller external analytics)
const eventBuffer: (FeatureUsageEvent | AIUsageEvent)[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Log feature usage
 */
export const logFeatureUsage = (
  featureName: keyof typeof FEATURES,
  userId?: string,
  metadata?: Record<string, any>
): void => {
  const event: FeatureUsageEvent = {
    feature: String(featureName),
    userId,
    timestamp: new Date().toISOString(),
    metadata
  };

  eventBuffer.push(event);

  // Keep buffer size manageable
  if (eventBuffer.length > MAX_BUFFER_SIZE) {
    eventBuffer.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Feature used:', event);
  }
};

/**
 * Log AI usage
 */
export const logAIUsage = (params: {
  model: string;
  promptVersion?: string;
  userId?: string;
  projectId?: string;
  tokensUsed?: number;
  responseTimeMs?: number;
  success: boolean;
  error?: string;
}): void => {
  const event: AIUsageEvent = {
    ...params,
    timestamp: new Date().toISOString()
  };

  eventBuffer.push(event);

  if (eventBuffer.length > MAX_BUFFER_SIZE) {
    eventBuffer.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] AI used:', event);
  }
};

/**
 * Get buffered events (for debugging or batch sending)
 */
export const getBufferedEvents = (): (FeatureUsageEvent | AIUsageEvent)[] => {
  return [...eventBuffer];
};

/**
 * Clear event buffer
 */
export const clearEventBuffer = (): void => {
  eventBuffer.length = 0;
};

/**
 * Send events to Firestore
 * Batch writes all buffered events to analytics collection
 */
export const flushEventsToFirestore = async (): Promise<void> => {
  if (eventBuffer.length === 0) {
    return;
  }

  try {
    const batch = writeBatch(db);
    const analyticsCollection = collection(db, 'analytics');

    eventBuffer.forEach(event => {
      const docRef = doc(analyticsCollection);
      batch.set(docRef, {
        ...event,
        timestamp: Timestamp.fromDate(new Date(event.timestamp))
      });
    });

    await batch.commit();

    console.log(`[Analytics] Flushed ${eventBuffer.length} events to Firestore`);
    clearEventBuffer();
  } catch (e) {
    console.error('[Analytics] Failed to flush events:', e);
  }
};

/**
 * Get feature usage stats (from buffer)
 */
export const getFeatureUsageStats = (): Record<string, number> => {
  const stats: Record<string, number> = {};

  eventBuffer.forEach(event => {
    if ('feature' in event) {
      stats[event.feature] = (stats[event.feature] || 0) + 1;
    }
  });

  return stats;
};

/**
 * Get AI model usage stats (from buffer)
 */
export const getAIModelStats = (): Record<string, number> => {
  const stats: Record<string, number> = {};

  eventBuffer.forEach(event => {
    if ('model' in event) {
      stats[event.model] = (stats[event.model] || 0) + 1;
    }
  });

  return stats;
};

/**
 * Auto-flush setup
 * Automatically flush events to Firestore every 5 minutes
 */
let autoFlushInterval: NodeJS.Timeout | null = null;

export const startAutoFlush = (): void => {
  if (autoFlushInterval) {
    return; // Already started
  }

  autoFlushInterval = setInterval(() => {
    flushEventsToFirestore().catch(err => {
      console.error('[Analytics] Auto-flush failed:', err);
    });
  }, 5 * 60 * 1000); // 5 minutes

  console.log('[Analytics] Auto-flush started (every 5 minutes)');
};

export const stopAutoFlush = (): void => {
  if (autoFlushInterval) {
    clearInterval(autoFlushInterval);
    autoFlushInterval = null;
    console.log('[Analytics] Auto-flush stopped');
  }
};

// Start auto-flush on module load (if in browser environment)
if (typeof window !== 'undefined') {
  startAutoFlush();

  // Flush on page unload
  window.addEventListener('beforeunload', () => {
    flushEventsToFirestore().catch(err => {
      console.error('[Analytics] Failed to flush on unload:', err);
    });
  });
}
