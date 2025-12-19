
import { describe, it, expect, vi } from 'vitest';

import * as promptBuilder from '../promptBuilder';

describe('Import PromptBuilder Test', () => {
    it('should load promptBuilder module', () => {
        expect(promptBuilder).toBeDefined();
    });
});
