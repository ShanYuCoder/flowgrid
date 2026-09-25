import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  createCopyRecursive,
  ensureHarnessStaging,
  harnessStagingCacheKey,
  syncAgentHarness,
} from '../bin/lib/harness-sync.mjs';

const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

test('harness staging cache key stable for same config', () => {
  const config = { type: 'Document', frontend: null, backend: null };
  const a = harnessStagingCacheKey(config, false);
  const b = harnessStagingCacheKey(config, false);
  assert.strictEqual(a, b);
  assert.notStrictEqual(a, harnessStagingCacheKey(config, true));
});

test('multi-agent sync reuses staging bundle', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-staging-'));
  try {
    fs.mkdirSync(path.join(tmpDir, '.flowgrid'), { recursive: true });
    const config = { type: 'Document', agents: ['cursor', 'claude'] };
    fs.writeFileSync(path.join(tmpDir, '.flowgrid', 'config.json'), JSON.stringify(config));

    const copyRecursive = createCopyRecursive();
    const first = ensureHarnessStaging({
      packageRoot,
      projectRoot: tmpDir,
      config,
      consumerDocsFull: false,
      copyRecursive,
    });
    assert.strictEqual(first.rebuilt, true);

    const second = ensureHarnessStaging({
      packageRoot,
      projectRoot: tmpDir,
      config,
      consumerDocsFull: false,
      copyRecursive,
    });
    assert.strictEqual(second.rebuilt, false);
    assert.strictEqual(second.bundleDir, first.bundleDir);

    syncAgentHarness({ packageRoot, projectRoot: tmpDir, agent: 'cursor', config });
    syncAgentHarness({ packageRoot, projectRoot: tmpDir, agent: 'claude', config });

    assert.ok(fs.existsSync(path.join(tmpDir, '.cursor', 'skills', 'docs-hub', 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, '.claude', 'skills', 'docs-hub', 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, '.cursor', 'rules', 'cursor-flowgrid.mdc')));
    assert.ok(fs.existsSync(path.join(tmpDir, '.claude', 'rules', 'claude-flowgrid.mdc')));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('antigravity gets mcp_config and agent overlay rule', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-ag-'));
  try {
    fs.mkdirSync(path.join(tmpDir, '.flowgrid'), { recursive: true });
    const config = { type: 'Document', agents: ['gemini_antigravity'] };
    fs.writeFileSync(path.join(tmpDir, '.flowgrid', 'config.json'), JSON.stringify(config));

    syncAgentHarness({ packageRoot, projectRoot: tmpDir, agent: 'gemini_antigravity', config });

    assert.ok(fs.existsSync(path.join(tmpDir, '.agents', 'mcp_config.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, '.agents', 'rules', 'antigravity-mcp.mdc')));
    const mcp = JSON.parse(
      fs.readFileSync(path.join(tmpDir, '.agents', 'mcp_config.json'), 'utf8'),
    );
    assert.ok(mcp.mcpServers.flowgrid);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
