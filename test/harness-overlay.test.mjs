import test from 'node:test';
import assert from 'node:assert';
import {
  renderHarnessPlaceholders,
  buildOverlayContext,
  applyHarnessOverlay,
} from '../bin/lib/harness-overlay.mjs';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

test('renderHarnessPlaceholders replaces FLOWGRID_* tokens', () => {
  const ctx = buildOverlayContext('cursor');
  const out = renderHarnessPlaceholders(
    'read={{FLOWGRID_READ_TOOL}} dir={{FLOWGRID_AGENT_DIR}}',
    ctx,
  );
  assert.ok(out.includes('Read'));
  assert.ok(out.includes('.cursor'));
  assert.ok(!out.includes('{{FLOWGRID_'));
});

test('applyHarnessOverlay renders files under agent dir', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fg-overlay-'));
  const agentDir = path.join(tmp, '.cursor');
  fs.mkdirSync(agentDir, { recursive: true });
  fs.writeFileSync(
    path.join(agentDir, 'AGENTS.md'),
    '# {{FLOWGRID_AGENT_LABEL}}\nTool: {{FLOWGRID_READ_TOOL}}\n',
  );
  applyHarnessOverlay(agentDir);
  const body = fs.readFileSync(path.join(agentDir, 'AGENTS.md'), 'utf8');
  assert.match(body, /Cursor/);
  assert.match(body, /Read/);
  fs.rmSync(tmp, { recursive: true, force: true });
});
