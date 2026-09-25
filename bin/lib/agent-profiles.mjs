import * as path from 'node:path';

/**
 * Per-agent harness layout (common package + agent-specific overlay).
 * Sync builds one project staging bundle, then materializes per agent dir + overlay.
 */

/** @type {Record<string, {
 *   id: string;
 *   dirName: string;
 *   mcpFile: string;
 *   label: string;
 *   readTool: string;
 *   writeTool: string;
 *   overlayFile: string;
 *   registryPathPrefix: string;
 * }>} */
export const AGENT_PROFILES = {
  cursor: {
    id: 'cursor',
    dirName: '.cursor',
    mcpFile: 'mcp.json',
    label: 'Cursor',
    readTool: 'Read',
    writeTool: 'Write',
    overlayFile: 'AGENTS.md',
    registryPathPrefix: '.cursor',
  },
  gemini_antigravity: {
    id: 'gemini_antigravity',
    dirName: '.agents',
    mcpFile: 'mcp_config.json',
    label: 'Antigravity',
    readTool: 'Read',
    writeTool: 'Write',
    overlayFile: 'AGENTS.md',
    registryPathPrefix: '.agents',
  },
  claude: {
    id: 'claude',
    dirName: '.claude',
    mcpFile: 'mcp.json',
    label: 'Claude Code',
    readTool: 'Read',
    writeTool: 'Write',
    overlayFile: 'AGENTS.md',
    registryPathPrefix: '.claude',
  },
  codex: {
    id: 'codex',
    dirName: '.codex',
    mcpFile: 'mcp.json',
    label: 'Codex CLI',
    readTool: 'Read',
    writeTool: 'Write',
    overlayFile: 'AGENTS.md',
    registryPathPrefix: '.codex',
  },
  opencode: {
    id: 'opencode',
    dirName: '.opencode',
    mcpFile: 'mcp.json',
    label: 'OpenCode',
    readTool: 'Read',
    writeTool: 'Write',
    overlayFile: 'AGENTS.md',
    registryPathPrefix: '.opencode',
  },
  hermes: {
    id: 'hermes',
    dirName: '.hermes',
    mcpFile: 'mcp.json',
    label: 'Hermes',
    readTool: 'Read',
    writeTool: 'Write',
    overlayFile: 'AGENTS.md',
    registryPathPrefix: '.hermes',
  },
  kiro: {
    id: 'kiro',
    dirName: '.kiro',
    mcpFile: 'mcp.json',
    label: 'Kiro',
    readTool: 'Read',
    writeTool: 'Write',
    overlayFile: 'AGENTS.md',
    registryPathPrefix: '.kiro',
  },
  kilo: {
    id: 'kilo',
    dirName: '.kilo',
    mcpFile: 'mcp.json',
    label: 'Kilo Code',
    readTool: 'Read',
    writeTool: 'Write',
    overlayFile: 'AGENTS.md',
    registryPathPrefix: '.kilo',
  },
};

const DEFAULT_PROFILE = {
  id: 'unknown',
  dirName: '.flowgrid-agent',
  mcpFile: 'mcp.json',
  label: 'Agent',
  readTool: 'Read',
  writeTool: 'Write',
  overlayFile: 'AGENTS.md',
  registryPathPrefix: '.flowgrid-agent',
};

export function getAgentProfile(agent) {
  return AGENT_PROFILES[agent] ?? { ...DEFAULT_PROFILE, id: agent, label: agent };
}

export function resolveAgentDir(agent) {
  return getAgentProfile(agent).dirName;
}

export function resolveAgentMcpConfigPath(agent, agentDir) {
  const { mcpFile } = getAgentProfile(agent);
  return path.join(agentDir, mcpFile);
}

export function agentHarnessOverlayPath(packageRoot, agent) {
  return path.join(packageRoot, 'harness', 'agents', agent);
}
