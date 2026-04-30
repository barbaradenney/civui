import { describe, it, expect } from 'vitest';
import { taskStatusTag } from './task-status.js';

describe('taskStatusTag', () => {
  it('returns Not started / blue for not-started', () => {
    const tag = taskStatusTag('not-started');
    expect(tag.label).toBe('Not started');
    expect(tag.variant).toBe('blue');
    expect(tag.tagStyle).toBeUndefined();
  });

  it('returns In progress / teal for in-progress', () => {
    const tag = taskStatusTag('in-progress');
    expect(tag.variant).toBe('teal');
  });

  it('returns Complete / green primary for complete', () => {
    const tag = taskStatusTag('complete');
    expect(tag.label).toBe('Complete');
    expect(tag.variant).toBe('green');
    expect(tag.tagStyle).toBe('primary');
  });

  it('returns Cannot start / gray for cannot-start', () => {
    const tag = taskStatusTag('cannot-start');
    expect(tag.variant).toBe('gray');
  });

  it('returns red for error', () => {
    expect(taskStatusTag('error').variant).toBe('red');
  });

  it('returns yellow primary for review', () => {
    const tag = taskStatusTag('review');
    expect(tag.variant).toBe('yellow');
    expect(tag.tagStyle).toBe('primary');
  });
});
