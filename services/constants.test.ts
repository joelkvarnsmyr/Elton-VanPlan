
import { describe, it, expect } from 'vitest';
import { DEMO_PROJECT } from '../constants';

describe('Constants', () => {
  it('DEMO_PROJECT should be defined', () => {
    expect(DEMO_PROJECT).toBeDefined();
  });

  it('DEMO_PROJECT should have correct id', () => {
    expect(DEMO_PROJECT.id).toBe('demo-elton');
  });

  it('DEMO_PROJECT should have tasks array', () => {
    expect(Array.isArray(DEMO_PROJECT.tasks)).toBe(true);
  });

  it('DEMO_PROJECT tasks should have required fields', () => {
      if (DEMO_PROJECT.tasks.length > 0) {
          const task = DEMO_PROJECT.tasks[0];
          expect(task).toHaveProperty('id');
          expect(task).toHaveProperty('title');
          expect(task).toHaveProperty('status');
      }
  });
});
