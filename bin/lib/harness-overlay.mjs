import * as fs from 'node:fs';
import * as path from 'node:path';
import { getAgentProfile, resolveAgentDir, AGENT_PROFILES } from './agent-profiles.mjs';

export { resolveAgentDir, AGENT_PROFILES as AGENT_META };

export function buildOverlayContext(agent) {
  const meta = getAgentProfile(agent);
  const agentDir = resolveAgentDir(agent);
  return {
    FLOWGRID_AGENT_LABEL: meta.label,
    FLOWGRID_AGENT_ID: meta.id,
    FLOWGRID_AGENT_DIR: agentDir,
    FLOWGRID_OVERLAY_FILE: meta.overlayFile,
    FLOWGRID_READ_TOOL: meta.readTool,
    FLOWGRID_WRITE_TOOL: meta.writeTool,
  };
}

export function renderHarnessPlaceholders(text, ctx) {
  return text.replace(/\{\{FLOWGRID_([A-Z0-9_]+)\}\}/g, (match, key) => {
    const full = `FLOWGRID_${key}`;
    return ctx[full] ?? match;
  });
}

const OVERLAY_EXTENSIONS = new Set(['.md', '.mdc']);

export function applyHarnessOverlay(agentDir, agentId) {
  const agent =
    agentId ??
    (path.basename(agentDir) === 'agents' ? 'gemini_antigravity' : path.basename(agentDir).replace(/^\./, ''));
  const ctx = buildOverlayContext(agent);

  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(p);
        continue;
      }
      if (!OVERLAY_EXTENSIONS.has(path.extname(ent.name))) continue;
      const raw = fs.readFileSync(p, 'utf8');
      if (!raw.includes('{{FLOWGRID_')) continue;
      fs.writeFileSync(p, renderHarnessPlaceholders(raw, ctx));
    }
  };

  walk(agentDir);
  return ctx;
}

export function writeRootAgentsMd(projectRoot, agents) {
  const lines = [
    '# FlowGrid — Agent harness',
    '',
    'Repo được cấu hình bởi `flowgrid init`. **Common** harness được build một lần vào `.flowgrid/harness/staging/`; mỗi agent nhận bản materialize + overlay riêng:',
    '',
  ];

  for (const agent of agents) {
    const dir = resolveAgentDir(agent);
    const meta = getAgentProfile(agent);
    const overlayPkg = `harness/agents/${agent}/` ;
    lines.push(
      `- **${meta.label}** (\`${agent}\`): [\`${dir}/${meta.overlayFile}\`](${dir}/${meta.overlayFile}) · MCP \`${meta.mcpFile}\` · overlay package \`${overlayPkg}\``,
    );
  }

  lines.push(
    '',
    'Đồng bộ lại skill/rules: `flowgrid harness sync`.',
    'MCP server: `flowgrid` trong `mcp.json` / `mcp_config.json`.',
    '',
  );

  const out = path.join(projectRoot, 'AGENTS.md');
  fs.writeFileSync(out, lines.join('\n'));
}
