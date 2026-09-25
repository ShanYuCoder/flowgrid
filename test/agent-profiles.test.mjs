import test from 'node:test';
import assert from 'node:assert';
import {
  getAgentProfile,
  resolveAgentDir,
  resolveAgentMcpConfigPath,
} from '../bin/lib/agent-profiles.mjs';
import path from 'node:path';

test('agent profiles define distinct dirs and MCP files', () => {
  assert.strictEqual(resolveAgentDir('cursor'), '.cursor');
  assert.strictEqual(resolveAgentDir('claude'), '.claude');
  assert.strictEqual(resolveAgentDir('kiro'), '.kiro');
  assert.strictEqual(resolveAgentDir('gemini_antigravity'), '.agents');

  const agDir = '/tmp/.agents';
  assert.ok(
    resolveAgentMcpConfigPath('gemini_antigravity', agDir).endsWith('mcp_config.json'),
  );
  assert.ok(resolveAgentMcpConfigPath('cursor', '/tmp/.cursor').endsWith('mcp.json'));
});

test('registry path prefix matches agent dir', () => {
  for (const id of ['cursor', 'claude', 'gemini_antigravity', 'kiro']) {
    const p = getAgentProfile(id);
    assert.strictEqual(p.registryPathPrefix, p.dirName);
  }
});
