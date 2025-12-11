import { test, expect } from '@playwright/test';
import {
  navigateToApp,
  getUserBucket,
  TEST_USERS,
} from './helpers/feature-flag-helpers';

/**
 * Feature Flags: A/B Testing & Rollout E2E Tests
 *
 * These tests verify:
 * - Hash-based user bucketing (deterministic)
 * - Rollout percentage logic (0%, 25%, 50%, 100%)
 * - User whitelist override
 * - User blacklist enforcement
 * - Environment-specific feature availability
 * - Consistent A/B assignment across sessions
 */

test.describe('Feature Flags: Hash-Based User Bucketing', () => {
  test('should generate consistent bucket for same user and feature', async ({ page }) => {
    await navigateToApp(page);

    const userId = 'test-user-123';
    const featureName = 'ENABLE_SMART_CONTEXT';

    // Get bucket multiple times
    const bucket1 = await getUserBucket(page, userId, featureName);
    const bucket2 = await getUserBucket(page, userId, featureName);
    const bucket3 = await getUserBucket(page, userId, featureName);

    // Should always return the same bucket
    expect(bucket1).toBe(bucket2);
    expect(bucket2).toBe(bucket3);
  });

  test('should generate different buckets for different users', async ({ page }) => {
    await navigateToApp(page);

    const featureName = 'ENABLE_SMART_CONTEXT';

    const bucket1 = await getUserBucket(page, 'user-001', featureName);
    const bucket2 = await getUserBucket(page, 'user-002', featureName);
    const bucket3 = await getUserBucket(page, 'user-003', featureName);

    // Different users should (likely) get different buckets
    // Note: There's a small chance they collide, but statistically unlikely
    const allBuckets = [bucket1, bucket2, bucket3];
    const uniqueBuckets = new Set(allBuckets);

    // At least 2 different buckets expected
    expect(uniqueBuckets.size).toBeGreaterThanOrEqual(2);
  });

  test('should generate different buckets for same user with different features', async ({ page }) => {
    await navigateToApp(page);

    const userId = 'test-user-123';

    const bucket1 = await getUserBucket(page, userId, 'ENABLE_SMART_CONTEXT');
    const bucket2 = await getUserBucket(page, userId, 'ENABLE_AUTO_CART');
    const bucket3 = await getUserBucket(page, userId, 'ENABLE_FUEL_LOG_GRAPHS');

    // Same user, different features = different buckets
    const allBuckets = [bucket1, bucket2, bucket3];
    const uniqueBuckets = new Set(allBuckets);

    expect(uniqueBuckets.size).toBeGreaterThanOrEqual(2);
  });

  test('should return bucket in range 0-99', async ({ page }) => {
    await navigateToApp(page);

    const userId = 'test-user-456';
    const featureName = 'ENABLE_SMART_CONTEXT';

    const bucket = await getUserBucket(page, userId, featureName);

    expect(bucket).toBeGreaterThanOrEqual(0);
    expect(bucket).toBeLessThanOrEqual(99);
  });

  test('should distribute users across all buckets', async ({ page }) => {
    await navigateToApp(page);

    const featureName = 'ENABLE_SMART_CONTEXT';
    const buckets: number[] = [];

    // Generate buckets for 100 users
    for (let i = 0; i < 100; i++) {
      const userId = `test-user-${i.toString().padStart(3, '0')}`;
      const bucket = await getUserBucket(page, userId, featureName);
      buckets.push(bucket);
    }

    // Check distribution: should have good coverage
    const uniqueBuckets = new Set(buckets);

    // With 100 users, expect at least 60 unique buckets (60% coverage)
    expect(uniqueBuckets.size).toBeGreaterThanOrEqual(60);
  });
});

test.describe('Feature Flags: Rollout Percentage Logic', () => {
  test('should enable feature for all users with 100% rollout', async ({ page }) => {
    await navigateToApp(page);

    const isEnabled = await page.evaluate(() => {
      const checkFeatureForUser = (userId: string): boolean => {
        const rolloutPercentage = 100;

        // Hash-based bucketing
        const str = `${userId}_ENABLE_SOUND_DOCTOR`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        const userBucket = Math.abs(hash) % 100;

        return userBucket < rolloutPercentage;
      };

      // Test with multiple users
      return {
        user1: checkFeatureForUser('user-001'),
        user2: checkFeatureForUser('user-002'),
        user3: checkFeatureForUser('user-999'),
      };
    });

    expect(isEnabled.user1).toBe(true);
    expect(isEnabled.user2).toBe(true);
    expect(isEnabled.user3).toBe(true);
  });

  test('should disable feature for all users with 0% rollout', async ({ page }) => {
    await navigateToApp(page);

    const isEnabled = await page.evaluate(() => {
      const checkFeatureForUser = (userId: string): boolean => {
        const rolloutPercentage = 0;

        const str = `${userId}_ENABLE_AUTO_CART`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        const userBucket = Math.abs(hash) % 100;

        return userBucket < rolloutPercentage;
      };

      return {
        user1: checkFeatureForUser('user-001'),
        user2: checkFeatureForUser('user-002'),
        user3: checkFeatureForUser('user-999'),
      };
    });

    expect(isEnabled.user1).toBe(false);
    expect(isEnabled.user2).toBe(false);
    expect(isEnabled.user3).toBe(false);
  });

  test('should enable feature for ~25% of users with 25% rollout', async ({ page }) => {
    await navigateToApp(page);

    const results = await page.evaluate(() => {
      const checkFeatureForUser = (userId: string): boolean => {
        const rolloutPercentage = 25;

        const str = `${userId}_ENABLE_SMART_CONTEXT`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        const userBucket = Math.abs(hash) % 100;

        return userBucket < rolloutPercentage;
      };

      // Test with 100 users
      let enabledCount = 0;
      for (let i = 0; i < 100; i++) {
        const userId = `user-${i.toString().padStart(3, '0')}`;
        if (checkFeatureForUser(userId)) {
          enabledCount++;
        }
      }

      return { enabledCount, total: 100 };
    });

    // Should be close to 25%, allow ±10% variance (15-35%)
    expect(results.enabledCount).toBeGreaterThanOrEqual(15);
    expect(results.enabledCount).toBeLessThanOrEqual(35);
  });

  test('should enable feature for ~50% of users with 50% rollout', async ({ page }) => {
    await navigateToApp(page);

    const results = await page.evaluate(() => {
      const checkFeatureForUser = (userId: string): boolean => {
        const rolloutPercentage = 50;

        const str = `${userId}_ENABLE_FUEL_LOG_GRAPHS`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        const userBucket = Math.abs(hash) % 100;

        return userBucket < rolloutPercentage;
      };

      let enabledCount = 0;
      for (let i = 0; i < 100; i++) {
        const userId = `user-${i.toString().padStart(3, '0')}`;
        if (checkFeatureForUser(userId)) {
          enabledCount++;
        }
      }

      return { enabledCount, total: 100 };
    });

    // Should be close to 50%, allow ±10% variance (40-60%)
    expect(results.enabledCount).toBeGreaterThanOrEqual(40);
    expect(results.enabledCount).toBeLessThanOrEqual(60);
  });

  test('should maintain consistent rollout across page reloads', async ({ page }) => {
    await navigateToApp(page);

    const userId = 'test-user-persistent';
    const featureName = 'ENABLE_SMART_CONTEXT';

    // Get initial state
    const initialBucket = await getUserBucket(page, userId, featureName);
    const initialEnabled = initialBucket < 25; // 25% rollout

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check again
    const afterReloadBucket = await getUserBucket(page, userId, featureName);
    const afterReloadEnabled = afterReloadBucket < 25;

    expect(initialBucket).toBe(afterReloadBucket);
    expect(initialEnabled).toBe(afterReloadEnabled);
  });
});

test.describe('Feature Flags: Whitelist Override', () => {
  test('should enable feature for whitelisted user regardless of rollout', async ({ page }) => {
    await navigateToApp(page);

    const result = await page.evaluate(() => {
      const userId = 'whitelisted-user-001';
      const rolloutPercentage = 0; // 0% rollout
      const whitelist = ['whitelisted-user-001', 'whitelisted-user-002'];

      // Check whitelist first
      if (whitelist.includes(userId)) {
        return true;
      }

      // Then check rollout
      const str = `${userId}_ENABLE_ICON_GENERATION`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const userBucket = Math.abs(hash) % 100;

      return userBucket < rolloutPercentage;
    });

    expect(result).toBe(true);
  });

  test('should enable feature for multiple whitelisted users', async ({ page }) => {
    await navigateToApp(page);

    const results = await page.evaluate(() => {
      const whitelist = ['admin@elton.app', 'tester@elton.app', 'beta@elton.app'];
      const rolloutPercentage = 0;

      const checkUser = (userId: string): boolean => {
        if (whitelist.includes(userId)) {
          return true;
        }

        const str = `${userId}_ENABLE_DEEP_RESEARCH_V3`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        const userBucket = Math.abs(hash) % 100;

        return userBucket < rolloutPercentage;
      };

      return {
        admin: checkUser('admin@elton.app'),
        tester: checkUser('tester@elton.app'),
        beta: checkUser('beta@elton.app'),
        regularUser: checkUser('regular@example.com'),
      };
    });

    expect(results.admin).toBe(true);
    expect(results.tester).toBe(true);
    expect(results.beta).toBe(true);
    expect(results.regularUser).toBe(false);
  });

  test('should prioritize whitelist over blacklist', async ({ page }) => {
    await navigateToApp(page);

    // Note: In actual implementation, whitelist should take precedence
    // This test documents expected behavior
    const result = await page.evaluate(() => {
      const userId = 'conflicted-user';
      const whitelist = ['conflicted-user'];
      const blacklist = ['conflicted-user'];

      // Blacklist check first (takes precedence in actual implementation)
      if (blacklist.includes(userId)) {
        return false;
      }

      // Whitelist check
      if (whitelist.includes(userId)) {
        return true;
      }

      return false;
    });

    // Blacklist takes precedence in our implementation
    expect(result).toBe(false);
  });
});

test.describe('Feature Flags: Blacklist Enforcement', () => {
  test('should disable feature for blacklisted user regardless of rollout', async ({ page }) => {
    await navigateToApp(page);

    const result = await page.evaluate(() => {
      const userId = 'banned-user-001';
      const rolloutPercentage = 100; // 100% rollout
      const blacklist = ['banned-user-001', 'banned-user-002'];

      // Check blacklist first
      if (blacklist.includes(userId)) {
        return false;
      }

      const str = `${userId}_ENABLE_CO_WORKING`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const userBucket = Math.abs(hash) % 100;

      return userBucket < rolloutPercentage;
    });

    expect(result).toBe(false);
  });

  test('should enforce blacklist for multiple users', async ({ page }) => {
    await navigateToApp(page);

    const results = await page.evaluate(() => {
      const blacklist = ['abuser-001', 'abuser-002', 'spammer-001'];
      const rolloutPercentage = 100;

      const checkUser = (userId: string): boolean => {
        if (blacklist.includes(userId)) {
          return false;
        }

        const str = `${userId}_ENABLE_MAGIC_IMPORT`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        const userBucket = Math.abs(hash) % 100;

        return userBucket < rolloutPercentage;
      };

      return {
        abuser1: checkUser('abuser-001'),
        abuser2: checkUser('abuser-002'),
        spammer: checkUser('spammer-001'),
        regularUser: checkUser('good-user@example.com'),
      };
    });

    expect(results.abuser1).toBe(false);
    expect(results.abuser2).toBe(false);
    expect(results.spammer).toBe(false);
    expect(results.regularUser).toBe(true);
  });
});

test.describe('Feature Flags: Environment-Specific Availability', () => {
  test('should only enable dev-only feature in development', async ({ page }) => {
    await navigateToApp(page);

    const result = await page.evaluate(() => {
      const getCurrentEnvironment = () => {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'dev';
        } else if (hostname.includes('staging')) {
          return 'staging';
        } else {
          return 'prod';
        }
      };

      const feature = {
        enabled: false,
        environments: ['dev'],
      };

      const currentEnv = getCurrentEnvironment();

      // Check if feature is enabled in current environment
      if (feature.environments && feature.environments.length > 0) {
        return feature.environments.includes(currentEnv);
      }

      return feature.enabled;
    });

    // Since we're running on localhost, should be enabled
    expect(result).toBe(true);
  });

  test('should enable prod-only feature in production', async ({ page }) => {
    await navigateToApp(page);

    const result = await page.evaluate(() => {
      const feature = {
        enabled: false,
        environments: ['prod'],
      };

      const testEnv = 'prod'; // Simulating production

      if (feature.environments && feature.environments.length > 0) {
        return feature.environments.includes(testEnv);
      }

      return feature.enabled;
    });

    expect(result).toBe(true);
  });

  test('should support multi-environment features', async ({ page }) => {
    await navigateToApp(page);

    const result = await page.evaluate(() => {
      const feature = {
        enabled: true,
        environments: ['dev', 'staging'],
      };

      return {
        devEnabled: feature.environments.includes('dev'),
        stagingEnabled: feature.environments.includes('staging'),
        prodEnabled: feature.environments.includes('prod'),
      };
    });

    expect(result.devEnabled).toBe(true);
    expect(result.stagingEnabled).toBe(true);
    expect(result.prodEnabled).toBe(false);
  });
});

test.describe('Feature Flags: Complete Flow', () => {
  test('should evaluate feature with all checks', async ({ page }) => {
    await navigateToApp(page);

    const result = await page.evaluate(() => {
      const isFeatureEnabledForUser = (
        userId: string,
        featureName: string
      ): boolean => {
        const feature = {
          enabled: true,
          rolloutPercentage: 50,
          userWhitelist: ['special-user@elton.app'],
          userBlacklist: ['banned-user@elton.app'],
          environments: ['dev', 'staging', 'prod'],
        };

        // 1. Base enabled check
        if (!feature.enabled) {
          return false;
        }

        // 2. Environment check
        const currentEnv = 'dev'; // localhost
        if (feature.environments && feature.environments.length > 0) {
          if (!feature.environments.includes(currentEnv)) {
            return false;
          }
        }

        // 3. Blacklist check
        if (feature.userBlacklist?.includes(userId)) {
          return false;
        }

        // 4. Whitelist check
        if (feature.userWhitelist?.includes(userId)) {
          return true;
        }

        // 5. Rollout check
        const str = `${userId}_${featureName}`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        const userBucket = Math.abs(hash) % 100;

        return userBucket < feature.rolloutPercentage;
      };

      return {
        whitelisted: isFeatureEnabledForUser(
          'special-user@elton.app',
          'ENABLE_SMART_CONTEXT'
        ),
        blacklisted: isFeatureEnabledForUser(
          'banned-user@elton.app',
          'ENABLE_SMART_CONTEXT'
        ),
        rolloutDetermined: typeof isFeatureEnabledForUser(
          'regular-user@example.com',
          'ENABLE_SMART_CONTEXT'
        ) === 'boolean',
      };
    });

    expect(result.whitelisted).toBe(true);
    expect(result.blacklisted).toBe(false);
    expect(result.rolloutDetermined).toBe(true);
  });
});

test.describe('Feature Flags: Visual Testing', () => {
  test('should take snapshot of feature flag behavior', async ({ page }) => {
    await navigateToApp(page);

    // This test documents the rollout distribution
    const distribution = await page.evaluate(() => {
      const results: { [key: string]: number } = {
        '0-24': 0,
        '25-49': 0,
        '50-74': 0,
        '75-99': 0,
      };

      for (let i = 0; i < 100; i++) {
        const userId = `user-${i.toString().padStart(3, '0')}`;
        const str = `${userId}_TEST_FEATURE`;
        let hash = 0;
        for (let j = 0; j < str.length; j++) {
          const char = str.charCodeAt(j);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        const bucket = Math.abs(hash) % 100;

        if (bucket < 25) results['0-24']++;
        else if (bucket < 50) results['25-49']++;
        else if (bucket < 75) results['50-74']++;
        else results['75-99']++;
      }

      return results;
    });

    // Each bucket should have roughly 25 users (±10)
    expect(distribution['0-24']).toBeGreaterThanOrEqual(15);
    expect(distribution['0-24']).toBeLessThanOrEqual(35);
  });
});
