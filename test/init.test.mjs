import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Helper to create test environment
async function runWithMocks(responses) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'forgekit-init-test-'));
  const originalCwd = process.cwd;
  const originalExit = process.exit;
  
  process.cwd = () => tmpDir;
  let exitCode = null;
  process.exit = (code) => { exitCode = code; };
  
  const statePath = path.join(tmpDir, 'state.json');
  fs.writeFileSync(statePath, JSON.stringify({
    textPromptCalls: [],
    responses
  }));

  // Create mock prompts module
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
      
      if (opts.message.includes('language codes')) return s.responses.langs || 'vi, ja, en';
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

  // Create mock child_process
  const mockCpCode = `
    export const spawnSync = () => ({ status: 0 });
    export const spawn = () => {};
    export const execSync = () => {};
  `;
  const mockCpPath = path.join(tmpDir, 'mock-cp.mjs');
  fs.writeFileSync(mockCpPath, mockCpCode);

  const cliPath = path.join(rootDir, 'bin', 'forgekit.mjs');
  const cliCode = fs.readFileSync(cliPath, 'utf8');
  
  let testableCode = cliCode.replace(/main\(\)\.catch\([\s\S]*?\}\);/, 'export { main };');
  
  // Replace imports with absolute paths to our mocks
  testableCode = testableCode.replaceAll("'@clack/prompts'", "'" + "file://" + mockPromptsPath + "'");
  testableCode = testableCode.replaceAll("'node:child_process'", "'" + "file://" + mockCpPath + "'");
  
  const tmpCliPath = path.join(__dirname, '.forgekit-test-cli-' + Date.now() + '.mjs');
  fs.writeFileSync(tmpCliPath, testableCode);

  try {
    const { main } = await import(path.join('file://', tmpCliPath));
    await main();
    
    return {
      tmpDir,
      tmpCliPath,
      state: JSON.parse(fs.readFileSync(statePath, 'utf8'))
    };
  } finally {
    process.cwd = originalCwd;
    process.exit = originalExit;
    if (fs.existsSync(tmpCliPath)) {
      try { fs.unlinkSync(tmpCliPath); } catch {}
    }
  }
}

test('forgekit init - Document project type with language configuration', async () => {
  const { tmpDir, tmpCliPath, state } = await runWithMocks({
    type: 'Document',
    defaultLang: 'ja',
    langs: 'vi, ja, en',
    agents: ['gemini_antigravity'],
    toolkits: ['codegraph']
  });
  
  try {
    assert.ok(state.textPromptCalls.some(msg => msg.includes('language codes')), 'Should prompt for language codes');
    
    const configPath = path.join(tmpDir, '.flowgrid', 'config.json');
    assert.ok(fs.existsSync(configPath), 'config.json should be created');
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.strictEqual(config.type, 'Document', 'Project type should be Document');
    assert.deepStrictEqual(config.languages, ['vi', 'ja', 'en'], 'Languages should be parsed correctly');
    assert.strictEqual(config.defaultLanguage, 'ja', 'Default language should be selected correctly');
    
    const mcpConfigPath = path.join(tmpDir, '.agents', 'mcp_config.json');
    if (fs.existsSync(mcpConfigPath)) {
      const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
      assert.strictEqual(mcpConfig.mcpServers.forgekit.env.DOCSKIT_DEFAULT_LANG, 'ja', 'MCP env should contain default language');
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('forgekit init - Frontend project type skips language configuration', async () => {
  const { tmpDir, tmpCliPath, state } = await runWithMocks({
    type: 'Frontend',
    tech: 'nuxt4',
    root: 'docs/fe'
  });
  
  try {
    assert.ok(!state.textPromptCalls.some(msg => msg.includes('language codes')), 'Should NOT prompt for language codes if not Document type');
    
    const configPath = path.join(tmpDir, '.flowgrid', 'config.json');
    assert.ok(fs.existsSync(configPath), 'config.json should be created');
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.strictEqual(config.type, 'Frontend', 'Project type should be Frontend');
    assert.deepStrictEqual(config.languages, ['en'], 'Languages should default to [en]');
    assert.strictEqual(config.defaultLanguage, 'en', 'Default language should default to en');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
