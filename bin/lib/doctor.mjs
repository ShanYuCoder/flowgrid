import * as fs from 'node:fs';
import * as path from 'node:path';
import { resolveAgentDir, writeRootAgentsMd } from './harness-overlay.mjs';
import { loadProjectConfig, runHarnessSync } from './harness-sync.mjs';
import { AUDIT_ENGINES } from './audit-run.mjs';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function mcpConfigPath(agentDir, agent) {
  return agent === 'gemini_antigravity'
    ? path.join(agentDir, 'mcp_config.json')
    : path.join(agentDir, 'mcp.json');
}

function walkHasUnrenderedPlaceholders(dir) {
  const bad = [];
  if (!fs.existsSync(dir)) return bad;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) stack.push(p);
      else if (/\.(md|mdc)$/.test(ent.name)) {
        const t = fs.readFileSync(p, 'utf8');
        if (t.includes('{{FLOWGRID_')) bad.push(p);
      }
    }
  }
  return bad;
}

/**
 * @param {object} opts
 * @param {string} opts.projectRoot
 * @param {string} opts.packageRoot
 * @param {boolean} [opts.fix]
 * @param {(msg: string) => void} [opts.log]
 */
export function runDoctor(opts) {
  const { projectRoot, packageRoot, fix = false } = opts;
  const log = opts.log ?? console.log;
  const issues = [];
  const warnings = [];

  for (const rel of Object.values(AUDIT_ENGINES)) {
    if (!fs.existsSync(path.join(packageRoot, rel))) {
      issues.push(`Toolkit missing audit engine: ${rel}`);
    }
  }

  const docsHubSkill = path.join(packageRoot, 'harness', 'docs', 'skills', 'docs-hub', 'SKILL.md');
  if (!fs.existsSync(docsHubSkill)) {
    issues.push('Toolkit missing harness/docs/skills/docs-hub/SKILL.md');
  }

  const configPath = path.join(projectRoot, '.flowgrid', 'config.json');
  if (!fs.existsSync(configPath)) {
    warnings.push('No .flowgrid/config.json — run `flowgrid init` on this repo.');
    return { ok: issues.length === 0, issues, warnings, fixed: false };
  }

  const config = loadProjectConfig(projectRoot);
  const agents = config.agents?.length ? config.agents : [];

  if (!agents.length) {
    warnings.push('config.agents is empty — re-run init and select at least one agent.');
  }

  const rootAgents = path.join(projectRoot, 'AGENTS.md');
  if (agents.length && !fs.existsSync(rootAgents)) {
    warnings.push('Missing root AGENTS.md — run `flowgrid harness sync`.');
  }

  const needsDocsPointer =
    config.type !== 'Document' &&
    Boolean(config.frontend?.docsRoot || config.backend?.docsRoot);

  for (const agent of agents) {
    const relDir = resolveAgentDir(agent);
    const agentDir = path.join(projectRoot, relDir);
    if (!fs.existsSync(agentDir)) {
      issues.push(`Agent directory missing: ${relDir}/`);
      continue;
    }

    const mcpPath = mcpConfigPath(agentDir, agent);
    if (!fs.existsSync(mcpPath)) {
      issues.push(`MCP config missing: ${path.relative(projectRoot, mcpPath)}`);
      continue;
    }

    const mcp = readJson(mcpPath);
    const server = mcp.mcpServers?.flowgrid;
    if (!server) {
      issues.push(`MCP server "flowgrid" not configured in ${path.relative(projectRoot, mcpPath)}`);
    } else if (!server.args?.some((a) => String(a).includes('flowgrid-mcp.mjs'))) {
      issues.push(`MCP entry does not point at flowgrid-mcp.mjs (${relDir})`);
    }

    const env = server?.env ?? {};
    if (needsDocsPointer && !env.FLOWGRID_DOCS_ROOT) {
      issues.push(
        `${relDir}: FLOWGRID_DOCS_ROOT unset (consumer repo needs docs hub pointer in MCP env)`,
      );
    }

    if (config.type === 'Document' && !env.FLOWGRID_DEFAULT_LANG && config.defaultLanguage) {
      warnings.push(
        `${relDir}: FLOWGRID_DEFAULT_LANG missing though config.defaultLanguage is set`,
      );
    }

    const hubSkill = path.join(agentDir, 'skills', 'docs-hub', 'SKILL.md');
    const specSkill = path.join(agentDir, 'skills', 'spec', 'SKILL.md');
    if (config.type === 'Document') {
      if (!fs.existsSync(hubSkill)) issues.push(`${relDir}: missing skills/docs-hub (full docs harness)`);
      if (!fs.existsSync(specSkill)) warnings.push(`${relDir}: missing skills/spec`);
    } else if (needsDocsPointer) {
      if (!fs.existsSync(hubSkill)) {
        warnings.push(
          `${relDir}: missing consumer docs-hub skill — run \`flowgrid harness sync\` or \`--full-docs\``,
        );
      }
    }

    const stale = walkHasUnrenderedPlaceholders(agentDir);
    for (const f of stale) {
      issues.push(`Unrendered {{FLOWGRID_*}} in ${path.relative(projectRoot, f)}`);
    }
  }

  let fixed = false;
  if (fix && fs.existsSync(configPath)) {
    log('[flowgrid doctor] running harness sync…');
    runHarnessSync([], { packageRoot, projectRoot, log });
    if (!fs.existsSync(path.join(projectRoot, 'AGENTS.md')) && agents.length) {
      writeRootAgentsMd(projectRoot, agents);
    }
    fixed = true;
    return runDoctor({ projectRoot, packageRoot, fix: false, log });
  }

  return { ok: issues.length === 0, issues, warnings, fixed };
}

export function printDoctorReport(report) {
  for (const w of report.warnings) {
    console.log(`⚠ ${w}`);
  }
  for (const i of report.issues) {
    console.log(`✖ ${i}`);
  }
  if (report.ok && report.warnings.length === 0) {
    console.log('✔ FlowGrid doctor: all checks passed.');
  } else if (report.ok) {
    console.log('✔ FlowGrid doctor: no blocking issues (see warnings).');
  } else {
    console.log('✖ FlowGrid doctor: fix issues above (try `flowgrid doctor --fix`).');
  }
}
