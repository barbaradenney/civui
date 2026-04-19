import { describe, it, expect } from 'vitest';
import { createServer } from './server.js';

describe('createServer', () => {
  it('returns an McpServer instance', async () => {
    const server = await createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe('function');
  });

  it('can be created multiple times without conflict', async () => {
    const server1 = await createServer();
    const server2 = await createServer();
    expect(server1).not.toBe(server2);
  });
});
