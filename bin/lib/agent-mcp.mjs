import * as fs from 'node:fs';
import * as path from 'node:path';
import { resolveAgentMcpConfigPath } from './agent-profiles.mjs';

/**
 * MCP environment variables shared by Cursor, Antigravity, and other agent installs.
 */
export function buildMcpEnv({
  selectedType,
  feDocRoot,
  feTestRoot,
  feAdapter,
  beAdapter,
  defaultLanguage,
}) {
  const env = {};
  if (selectedType !== 'Document') {
    if (feDocRoot) {
      const docsRoot = path.resolve(feDocRoot);
      env.FLOWGRID_DOCS_ROOT = docsRoot;
    }
    if (feTestRoot) {
      env.FLOWGRID_TESTS_ROOT = path.resolve(feTestRoot);
    }
  }
  if (feAdapter) {
    env.FLOWGRID_ADAPTER = feAdapter;
    env.FLOWGRID_CODE_ROLE = 'fe';
  }
  if (beAdapter) {
    env.FLOWGRID_BE_ADAPTER = beAdapter;
    if (!feAdapter) {
      env.FLOWGRID_ADAPTER = beAdapter;
      env.FLOWGRID_CODE_ROLE = 'be';
    }
  }
  if (defaultLanguage) {
    env.FLOWGRID_DEFAULT_LANG = defaultLanguage;
  }
  return env;
}

function mcpServerEntry(packageRoot, scriptName, env) {
  const entry = {
    command: 'node',
    args: [path.join(packageRoot, 'bin', scriptName)],
  };
  if (env && Object.keys(env).length > 0) {
    entry.env = env;
  }
  return entry;
}

export function buildMcpConfig(packageRoot, env) {
  return {
    mcpServers: {
      flowgrid: mcpServerEntry(packageRoot, 'flowgrid-mcp.mjs', env),
    },
  };
}

export { resolveAgentMcpConfigPath };

export function writeAgentMcpConfig({ agent, agentDir, packageRoot, env }) {
  const config = buildMcpConfig(packageRoot, env);
  const configPath = resolveAgentMcpConfigPath(agent, agentDir);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  return configPath;
}
