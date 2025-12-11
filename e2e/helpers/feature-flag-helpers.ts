/**
 * Helper functions for Feature Flag E2E tests
 * Provides utilities for mocking, setup, and common test operations
 */

import { Page } from '@playwright/test';

/**
 * Test user IDs for consistent A/B testing
 */
export const TEST_USERS = {
  // User that always falls in bucket 0-24 (for 25% rollout tests)
  USER_LOW_BUCKET: 'test-user-low-001',
  // User that falls in bucket 50-74 (for 50%+ rollout tests)
  USER_MID_BUCKET: 'test-user-mid-001',
  // User that falls in bucket 75-99 (for 75%+ rollout tests)
  USER_HIGH_BUCKET: 'test-user-high-001',
};

/**
 * Feature names for testing
 */
export const TEST_FEATURES = {
  SIMPLE_ENABLED: 'SHOW_ROADMAP_TAB',
  SIMPLE_DISABLED: 'ENABLE_DARK_MODE',
  ADVANCED_FULL_ROLLOUT: 'ENABLE_CO_WORKING',
  ADVANCED_PARTIAL_ROLLOUT: 'ENABLE_SMART_CONTEXT',
  ADVANCED_ENV_RESTRICTED: 'ENABLE_ICON_GENERATION',
} as const;

/**
 * Set up localStorage dev overrides for feature flags
 */
export const setDevOverride = async (
  page: Page,
  featureName: string,
  enabled: boolean
): Promise<void> => {
  await page.evaluate(
    ({ feature, value }) => {
      const overrides = JSON.parse(
        localStorage.getItem('elton_feature_overrides') || '{}'
      );
      overrides[feature] = value;
      localStorage.setItem('elton_feature_overrides', JSON.stringify(overrides));
    },
    { feature: featureName, value: enabled }
  );
};

/**
 * Clear all dev overrides
 */
export const clearDevOverrides = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    localStorage.removeItem('elton_feature_overrides');
  });
};

/**
 * Get current dev overrides
 */
export const getDevOverrides = async (
  page: Page
): Promise<Record<string, boolean>> => {
  return await page.evaluate(() => {
    const stored = localStorage.getItem('elton_feature_overrides');
    return stored ? JSON.parse(stored) : {};
  });
};

/**
 * Mock the current environment (by changing hostname)
 * Note: This requires navigating to a mocked URL
 */
export const setEnvironment = async (
  page: Page,
  env: 'dev' | 'staging' | 'prod'
): Promise<void> => {
  let hostname = 'localhost:3000';

  if (env === 'staging') {
    hostname = 'staging.elton.app';
  } else if (env === 'prod') {
    hostname = 'elton.app';
  }

  // Note: In real tests, you'd navigate to the actual environment
  // For local testing, we'll use URL query params to simulate
  await page.goto(`/?test_env=${env}`);
};

/**
 * Check if a feature is enabled via the window object
 * Assumes the app exposes feature flags for testing
 */
export const isFeatureEnabledInPage = async (
  page: Page,
  featureName: string,
  userId?: string
): Promise<boolean> => {
  return await page.evaluate(
    ({ feature, user }) => {
      // This assumes the app has a global function for testing
      // You may need to adjust based on your app structure
      const featureFlagService = (window as any).featureFlagService;
      if (featureFlagService && featureFlagService.isFeatureEnabled) {
        return featureFlagService.isFeatureEnabled(feature, user);
      }
      return false;
    },
    { feature: featureName, user: userId }
  );
};

/**
 * Get the rollout bucket for a user
 */
export const getUserBucket = async (
  page: Page,
  userId: string,
  featureName: string
): Promise<number> => {
  return await page.evaluate(
    ({ user, feature }) => {
      // Simple hash function (matches the one in featureFlagService.ts)
      const str = `${user}_${feature}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash) % 100;
    },
    { user: userId, feature: featureName }
  );
};

/**
 * Mock analytics events in Firestore
 * Returns the number of events captured
 */
export const captureAnalyticsEvents = async (page: Page): Promise<any[]> => {
  return await page.evaluate(() => {
    const events: any[] = [];

    // Mock Firestore batch.set calls
    const originalSet = (window as any).firestore?.batch?.set;
    if (originalSet) {
      (window as any).firestore.batch.set = function (docRef: any, data: any) {
        events.push(data);
        return originalSet.call(this, docRef, data);
      };
    }

    return events;
  });
};

/**
 * Wait for analytics event to be logged
 */
export const waitForAnalyticsEvent = async (
  page: Page,
  eventType: 'feature' | 'ai',
  timeout: number = 5000
): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const hasEvent = await page.evaluate((type) => {
      const buffer = (window as any).analyticsEventBuffer || [];
      return buffer.some((event: any) => {
        if (type === 'feature') return 'feature' in event;
        if (type === 'ai') return 'model' in event;
        return false;
      });
    }, eventType);

    if (hasEvent) return true;

    await page.waitForTimeout(100);
  }

  return false;
};

/**
 * Clear analytics event buffer
 */
export const clearAnalyticsBuffer = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    if ((window as any).analyticsEventBuffer) {
      (window as any).analyticsEventBuffer = [];
    }
  });
};

/**
 * Get analytics buffer contents
 */
export const getAnalyticsBuffer = async (page: Page): Promise<any[]> => {
  return await page.evaluate(() => {
    return (window as any).analyticsEventBuffer || [];
  });
};

/**
 * Mock Firestore for testing (prevents actual writes)
 */
export const mockFirestore = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    // Store original Firestore methods
    const originalFirestore = (window as any).db;

    // Create mock that doesn't actually write
    (window as any).mockFirestoreWrites = [];
    (window as any).db = {
      ...originalFirestore,
      collection: (name: string) => ({
        doc: () => ({
          set: (data: any) => {
            (window as any).mockFirestoreWrites.push({ collection: name, data });
            return Promise.resolve();
          },
        }),
      }),
    };
  });
};

/**
 * Get mocked Firestore writes
 */
export const getMockFirestoreWrites = async (page: Page): Promise<any[]> => {
  return await page.evaluate(() => {
    return (window as any).mockFirestoreWrites || [];
  });
};

/**
 * Inject feature flag service into window for testing
 */
export const injectFeatureFlagService = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    // This exposes the service for E2E testing
    // You'll need to import it in your app's main file when in test mode
    import('./services/featureFlagService').then((module) => {
      (window as any).featureFlagService = module;
    });
  });
};

/**
 * Assert feature flag metadata
 */
export const getFeatureMetadata = async (
  page: Page,
  featureName: string
): Promise<any> => {
  return await page.evaluate((feature) => {
    const service = (window as any).featureFlagService;
    if (service && service.getFeatureMetadata) {
      return service.getFeatureMetadata(feature);
    }
    return null;
  }, featureName);
};

/**
 * Get all enabled features for a user
 */
export const getEnabledFeatures = async (
  page: Page,
  userId?: string
): Promise<string[]> => {
  return await page.evaluate((user) => {
    const service = (window as any).featureFlagService;
    if (service && service.getEnabledFeatures) {
      return service.getEnabledFeatures(user);
    }
    return [];
  }, userId);
};

/**
 * Helper to navigate and wait for app to be ready
 */
export const navigateToApp = async (page: Page): Promise<void> => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Wait for React to render
  await page.waitForTimeout(500);
};

/**
 * Helper to login with demo account
 */
export const loginAsDemo = async (page: Page): Promise<void> => {
  await page.goto('/');

  // Check if already logged in
  const isLoggedIn = await page.locator('h1.font-serif').count() > 0;
  if (isLoggedIn) return;

  // Click demo login if available
  const demoButton = page.locator('button:has-text("Demo")');
  if (await demoButton.count() > 0) {
    await demoButton.click();
    await page.waitForLoadState('networkidle');
  }
};
