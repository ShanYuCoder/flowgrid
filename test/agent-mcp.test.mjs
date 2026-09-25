import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  buildMcpEnv,
  buildMcpConfig,
  writeAgentMcpConfig,
  resolveAgentMcpConfigPath,
} from '../bin/lib/agent-mcp.mjs';

test('buildMcpEnv sets docs and codegen roots for Fullstack', () => {
  const env = buildMcpEnv({
    selectedType: 'Fullstack',
    feDocRoot: 'docs/fe',
    feTestRoot: 'tests/fe',
    feAdapter: 'nuxt4',
    beAdapter: 'nestjs',
    defaultLanguage: undefined,
  });
  assert.ok(path.isAbsolute(env.FLOWGRID_DOCS_ROOT));
  assert.strictEqual(env.FLOWGRID_ADAPTER, 'nuxt4');
  assert.strictEqual(env.FLOWGRID_BE_ADAPTER, 'nestjs');
  assert.strictEqual(env.FLOWGRID_TESTS_ROOT, path.resolve('tests/fe'));
});

test('buildMcpConfig registers flowgrid MCP server', () => {
  const root = path.resolve('/pkg');
  const config = buildMcpConfig(root, { FLOWGRID_DOCS_ROOT: '/docs' });
  assert.ok(config.mcpServers.flowgrid);
  assert.ok(config.mcpServers.flowgrid.args[0].endsWith('flowgrid-mcp.mjs'));
});

test('writeAgentMcpConfig writes cursor mcp.json and antigravity mcp_config.json', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-mcp-test-'));
  const packageRoot = path.resolve(path.join(tmpDir, 'flowgrid-pkg'));
  fs.mkdirSync(path.join(packageRoot, 'bin'), { recursive: true });
  fs.writeFileSync(path.join(packageRoot, 'bin', 'flowgrid-mcp.mjs'), '');

  const cursorDir = path.join(tmpDir, '.cursor');
  fs.mkdirSync(cursorDir, { recursive: true });
  const agentsDir = path.join(tmpDir, '.agents');
  fs.mkdirSync(agentsDir, { recursive: true });

  const env = { FLOWGRID_DEFAULT_LANG: 'vi' };
  const cursorPath = writeAgentMcpConfig({
    agent: 'cursor',
    agentDir: cursorDir,
    packageRoot,
    env,
  });
  const agPath = writeAgentMcpConfig({
    agent: 'gemini_antigravity',
    agentDir: agentsDir,
    packageRoot,
    env,
  });

  assert.strictEqual(cursorPath, resolveAgentMcpConfigPath('cursor', cursorDir));
  assert.strictEqual(agPath, resolveAgentMcpConfigPath('gemini_antigravity', agentsDir));

  const cursorCfg = JSON.parse(fs.readFileSync(cursorPath, 'utf8'));
  assert.strictEqual(cursorCfg.mcpServers.flowgrid.env.FLOWGRID_DEFAULT_LANG, 'vi');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
