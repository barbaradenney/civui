import { describe, it, expect } from 'vitest';
import { createServer } from './server.js';

describe('createServer', () => {
  it('returns an McpServer instance', () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe('function');
  });

  it('can be created multiple times without conflict', () => {
    const server1 = createServer();
    const server2 = createServer();
    expect(server1).not.toBe(server2);
  });
});
