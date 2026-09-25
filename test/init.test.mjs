import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function runWithMocks(responses) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowgrid-init-test-'));
  const originalCwd = process.cwd;
  const originalExit = process.exit;

  process.cwd = () => tmpDir;
  process.exit = (code) => {
    process.exitCode = code;
  };

  const statePath = path.join(tmpDir, 'state.json');
  fs.writeFileSync(
    statePath,
    JSON.stringify({
      textPromptCalls: [],
      responses,
    })
  );

  const mockPromptsCode = `
    import fs from 'node:fs';
    const statePath = ${JSON.stringify(statePath)};
    function getState() { return JSON.parse(fs.readFileSync(statePath, 'utf8')); }
    function saveState(s) { fs.writeFileSync(statePath, JSON.stringify(s)); }
    
    export const intro = () => {};
    export const outro = () => {};
    export const select = async (opts) => {
      const s = getState();
      if (opts.message.includes('project type')) return s.responses.type || 'Document';
      if (opts.message.includes('default language')) return s.responses.defaultLang || 'ja';
      if (opts.message.includes('Base Architecture')) return s.responses.baseProfile || 'standard';
      return opts.options && opts.options.length ? opts.options[0].value : null;
    };
    export const multiselect = async (opts) => {
      const s = getState();
      if (opts.message.includes('Agents/Skills')) return s.responses.agents || [];
      if (opts.message.includes('Optional toolkits')) return s.responses.toolkits || [];
      return [];
    };
    export const text = async (opts) => {
      const s = getState();
      s.textPromptCalls.push(opts.message);
      saveState(s);
      
      if (opts.message.includes('supported languages')) return s.responses.langs || 'vi, ja, en';
      if (opts.message.includes('technology')) return s.responses.tech || 'nuxt4';
      if (opts.message.includes('root directory')) return s.responses.root || 'docs/fe';
      return '';
    };
    export const confirm = async () => true;
    export const isCancel = () => false;
    export const cancel = () => {};
  `;
  const mockPromptsPath = path.join(tmpDir, 'mock-prompts.mjs');
  fs.writeFileSync(mockPromptsPath, mockPromptsCode);

  const mockCpCode = `
    export const spawnSync = () => ({ status: 0 });
    export const spawn = () => {};
    export const execSync = () => {};
  `;
  const mockCpPath = path.join(tmpDir, 'mock-cp.mjs');
  fs.writeFileSync(mockCpPath, mockCpCode);

  const cliPath = path.join(rootDir, 'bin', 'flowgrid.mjs');
  const cliCode = fs.readFileSync(cliPath, 'utf8');

  let testableCode = cliCode.replace(/\nif \(isDirectCli\) \{[\s\S]*?\n\}\s*$/m, '');

  testableCode = testableCode.replaceAll("'@clack/prompts'", `'file://${mockPromptsPath}'`);
  testableCode = testableCode.replaceAll("'node:child_process'", `'file://${mockCpPath}'`);
  const libDir = path.join(rootDir, 'bin', 'lib');
  const toFileUrl = (name) => `from 'file://${path.join(libDir, name)}'`;
  testableCode = testableCode.replace("from './lib/agent-mcp.mjs'", toFileUrl('agent-mcp.mjs'));
  testableCode = testableCode.replace(
    "from './lib/project-gitignore.mjs'",
    toFileUrl('project-gitignore.mjs'),
  );
  testableCode = testableCode.replace("from './lib/audit-run.mjs'", toFileUrl('audit-run.mjs'));
  testableCode = testableCode.replace("from './lib/harness-sync.mjs'", toFileUrl('harness-sync.mjs'));
  testableCode = testableCode.replace(
    "from './lib/harness-overlay.mjs'",
    toFileUrl('harness-overlay.mjs'),
  );
  testableCode = testableCode.replace("from './lib/doctor.mjs'", toFileUrl('doctor.mjs'));

  const tmpCliPath = path.join(__dirname, `.flowgrid-test-cli-${Date.now()}.mjs`);
  fs.writeFileSync(tmpCliPath, testableCode);

  try {
    const { main } = await import(path.join('file://', tmpCliPath));
    await main();

    return {
      tmpDir,
      state: JSON.parse(fs.readFileSync(statePath, 'utf8')),
    };
  } finally {
    process.cwd = originalCwd;
    process.exit = originalExit;
    if (fs.existsSync(tmpCliPath)) {
      try {
        fs.unlinkSync(tmpCliPath);
      } catch {}
    }
  }
}

test('flowgrid init - Document + Antigravity writes mcp_config with flowgrid', async () => {
  const { tmpDir, state } = await runWithMocks({
    type: 'Document',
    defaultLang: 'ja',
    langs: 'vi, ja, en',
    agents: ['gemini_antigravity'],
    toolkits: [],
  });

  try {
    assert.ok(
      state.textPromptCalls.some((msg) => msg.includes('supported languages')),
      'Should prompt for supported languages'
    );
    assert.ok(
      !state.textPromptCalls.some((msg) => msg.includes('root directory for documentation')),
      'Document hub must not prompt for docs root path'
    );

    const configPath = path.join(tmpDir, '.flowgrid', 'config.json');
    assert.ok(fs.existsSync(configPath), 'config.json should be created');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.strictEqual(config.type, 'Document');
    assert.deepStrictEqual(config.languages, ['vi', 'ja', 'en']);
    assert.strictEqual(config.defaultLanguage, 'ja');
    assert.strictEqual(config.frontend, null);
    assert.strictEqual(config.backend, null);

    const mcpConfigPath = path.join(tmpDir, '.agents', 'mcp_config.json');
    assert.ok(fs.existsSync(mcpConfigPath), 'Antigravity MCP config should exist');

    const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    assert.strictEqual(mcpConfig.mcpServers.flowgrid.env.FLOWGRID_DEFAULT_LANG, 'ja');
    assert.strictEqual(mcpConfig.mcpServers.flowgrid.env.FLOWGRID_DOCS_ROOT, undefined);
    assert.deepStrictEqual(config.agents, ['gemini_antigravity']);

    const agentsMd = path.join(tmpDir, 'AGENTS.md');
    assert.ok(fs.existsSync(agentsMd), 'root AGENTS.md should exist');
    const overlay = fs.readFileSync(path.join(tmpDir, '.agents', 'AGENTS.md'), 'utf8');
    assert.ok(!overlay.includes('{{FLOWGRID_'), 'harness overlay placeholders should be rendered');
    assert.ok(overlay.includes('Read'), 'Antigravity read tool should be set');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('flowgrid init - Cursor writes .cursor/mcp.json', async () => {
  const { tmpDir } = await runWithMocks({
    type: 'Document',
    defaultLang: 'en',
    langs: 'en',
    agents: ['cursor'],
    toolkits: [],
  });

  try {
    const mcpPath = path.join(tmpDir, '.cursor', 'mcp.json');
    assert.ok(fs.existsSync(mcpPath), 'Cursor MCP config should exist');

    const mcpConfig = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
    assert.ok(mcpConfig.mcpServers.flowgrid);
    assert.strictEqual(mcpConfig.mcpServers.flowgrid.env.FLOWGRID_DEFAULT_LANG, 'en');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('flowgrid init - Frontend prompts docs root for SSOT pointer', async () => {
  const { tmpDir, state } = await runWithMocks({
    type: 'Frontend',
    tech: 'nuxt4',
    root: 'docs/fe',
    agents: [],
  });

  try {
    assert.ok(
      state.textPromptCalls.some((msg) => msg.includes('root directory for documentation')),
      'Frontend should prompt for external docs hub path'
    );
    const config = JSON.parse(fs.readFileSync(path.join(tmpDir, '.flowgrid', 'config.json'), 'utf8'));
    assert.strictEqual(config.frontend.docsRoot, 'docs/fe');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('flowgrid init - Frontend skips language configuration', async () => {
  const { tmpDir, state } = await runWithMocks({
    type: 'Frontend',
    tech: 'nuxt4',
    root: 'docs/fe',
    agents: [],
  });

  try {
    assert.ok(
      !state.textPromptCalls.some((msg) => msg.includes('supported languages')),
      'Should NOT prompt for languages on Frontend type'
    );

    const configPath = path.join(tmpDir, '.flowgrid', 'config.json');
    assert.ok(fs.existsSync(configPath));

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.strictEqual(config.type, 'Frontend');
    assert.strictEqual(config.defaultLanguage, undefined);
    assert.strictEqual(config.languages, undefined);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
