import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { buildMcpEnv, writeAgentMcpConfig } from './agent-mcp.mjs';
import {
  agentHarnessOverlayPath,
  getAgentProfile,
  resolveAgentDir,
} from './agent-profiles.mjs';
import { applyHarnessOverlay, writeRootAgentsMd } from './harness-overlay.mjs';

/** Skills/rules synced on code repos that point at an external docs hub. */
export const CONSUMER_DOC_SKILL_NAMES = new Set([
  'docs-hub',
  'spec',
  'update-spec',
  'grill',
  'grill-bqa',
  'grill-dev',
  'grill-docs',
  'grill-common-spec',
  'qa-resolve',
  'api-spec',
  'api-update',
]);

export const CONSUMER_DOC_RULE_NAMES = new Set([
  'docs-hub.mdc',
  'agent-compliance.mdc',
  'team-flow-spec.mdc',
  'team-flow-grill.mdc',
]);

const STAGING_VERSION = 2;
const REGISTRY_SOURCE_PREFIX = '.cursor';

function copyFlowgridPackageSchemas(packageHarnessRoot, agentDir, copyRecursive) {
  const schemasRoot = path.join(packageHarnessRoot, 'schemas');
  if (!fs.existsSync(schemasRoot)) return;
  for (const ent of fs.readdirSync(schemasRoot, { withFileTypes: true })) {
    if (!ent.isDirectory() || !ent.name.startsWith('flowgrid-')) continue;
    copyRecursive(
      path.join(schemasRoot, ent.name),
      path.join(agentDir, 'schemas', ent.name),
    );
  }
}

function copyDocsRulesFiltered(rulesSrc, rulesDest, allowedFiles) {
  if (!fs.existsSync(rulesSrc)) return;
  if (!fs.existsSync(rulesDest)) fs.mkdirSync(rulesDest, { recursive: true });
  for (const ent of fs.readdirSync(rulesSrc, { withFileTypes: true })) {
    if (!ent.isFile() || !ent.name.endsWith('.mdc')) continue;
    if (allowedFiles && !allowedFiles.has(ent.name)) continue;
    fs.copyFileSync(path.join(rulesSrc, ent.name), path.join(rulesDest, ent.name));
  }
}

function copyDocsSkillsFiltered(skillsSrc, skillsDest, allowedNames, copyRecursive) {
  if (!fs.existsSync(skillsSrc)) return;
  for (const ent of fs.readdirSync(skillsSrc, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    if (allowedNames && !allowedNames.has(ent.name)) continue;
    copyRecursive(path.join(skillsSrc, ent.name), path.join(skillsDest, ent.name));
  }
}

export function createCopyRecursive() {
  return function copyRecursive(srcDir, destDir, log = false) {
    if (!fs.existsSync(srcDir)) return;
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const items = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const item of items) {
      if (
        ['node_modules', '.git', 'dist', '.agents', '.gemini', '.cursor', '.flowgrid'].includes(
          item.name,
        )
      ) {
        continue;
      }
      if (item.name.endsWith('.db')) continue;

      const srcPath = path.join(srcDir, item.name);
      const destPath = path.join(destDir, item.name);
      if (item.isDirectory()) {
        copyRecursive(srcPath, destPath, log);
      } else {
        fs.copyFileSync(srcPath, destPath);
        if (log) console.log(`  + Copied ${item.name}`);
      }
    }
  };
}

function syncFeHarness(packageRoot, agentDir, feAdapter, copyRecursive) {
  const feHarness = path.join(packageRoot, 'harness', 'fe');
  if (!fs.existsSync(feHarness)) return;
  for (const item of fs.readdirSync(feHarness, { withFileTypes: true })) {
    if (item.name !== 'adapters') {
      copyRecursive(path.join(feHarness, item.name), path.join(agentDir, item.name));
    }
  }
  if (feAdapter) {
    copyRecursive(path.join(feHarness, 'adapters', feAdapter), agentDir);
  }
}

function syncBeHarness(packageRoot, agentDir, beAdapter, copyRecursive) {
  const beHarness = path.join(packageRoot, 'harness', 'be');
  if (!fs.existsSync(beHarness)) return;
  for (const item of fs.readdirSync(beHarness, { withFileTypes: true })) {
    if (item.name !== 'adapters') {
      copyRecursive(path.join(beHarness, item.name), path.join(agentDir, item.name));
    }
  }
  if (beAdapter) {
    copyRecursive(path.join(beHarness, 'adapters', beAdapter), agentDir);
  }
}

function syncDocsHarness(packageRoot, agentDir, { full, copyRecursive }) {
  const docsRoot = path.join(packageRoot, 'harness', 'docs');
  if (!fs.existsSync(docsRoot)) return;

  if (full) {
    for (const ent of fs.readdirSync(docsRoot, { withFileTypes: true })) {
      const srcPath = path.join(docsRoot, ent.name);
      const destPath = path.join(agentDir, ent.name);
      if (ent.name === 'skills') {
        copyDocsSkillsFiltered(srcPath, destPath, null, copyRecursive);
      } else if (ent.name === 'schemas') {
        copyFlowgridPackageSchemas(docsRoot, agentDir, copyRecursive);
      } else if (ent.name === 'rules') {
        copyDocsRulesFiltered(srcPath, destPath, null);
      } else if (ent.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
      }
    }
    return;
  }

  const skillsSrc = path.join(docsRoot, 'skills');
  const skillsDest = path.join(agentDir, 'skills');
  copyDocsSkillsFiltered(skillsSrc, skillsDest, CONSUMER_DOC_SKILL_NAMES, copyRecursive);

  copyDocsRulesFiltered(
    path.join(docsRoot, 'rules'),
    path.join(agentDir, 'rules'),
    CONSUMER_DOC_RULE_NAMES,
  );

  copyRecursive(path.join(docsRoot, 'extracts'), path.join(agentDir, 'extracts'));
  copyFlowgridPackageSchemas(docsRoot, agentDir, copyRecursive);
}

function syncSharedHarness(packageRoot, agentDir, copyRecursive) {
  const sharedRoot = path.join(packageRoot, 'harness', 'shared');
  if (!fs.existsSync(sharedRoot)) return;
  for (const ent of fs.readdirSync(sharedRoot, { withFileTypes: true })) {
    const srcPath = path.join(sharedRoot, ent.name);
    const destPath = path.join(agentDir, ent.name);
    if (ent.name === 'schemas') {
      copyFlowgridPackageSchemas(sharedRoot, agentDir, copyRecursive);
    } else if (ent.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** Build agent-neutral harness tree (extract paths still use `.cursor` template prefix). */
function populateHarnessBundle(stagingDir, { packageRoot, config, consumerDocsFull, copyRecursive }) {
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  const selectedType = config.type;
  const feAdapter = config.frontend?.adapter ?? '';
  const beAdapter = config.backend?.adapter ?? '';
  const feDocRoot = config.frontend?.docsRoot ?? config.backend?.docsRoot ?? '';
  const needsConsumerDocs =
    selectedType !== 'Document' && Boolean(feDocRoot || config.backend?.docsRoot);

  copyRecursive(path.join(packageRoot, 'harness', 'common'), stagingDir);
  syncSharedHarness(packageRoot, stagingDir, copyRecursive);

  if (selectedType === 'Document') {
    syncDocsHarness(packageRoot, stagingDir, { full: true, copyRecursive });
  } else if (needsConsumerDocs) {
    syncDocsHarness(packageRoot, stagingDir, {
      full: consumerDocsFull,
      copyRecursive,
    });
  }

  if (selectedType === 'Test') {
    copyRecursive(path.join(packageRoot, 'harness', 'tests'), stagingDir);
  }

  if (selectedType === 'Frontend' || selectedType === 'Fullstack') {
    syncFeHarness(packageRoot, stagingDir, feAdapter, copyRecursive);
  }

  if (selectedType === 'Backend' || selectedType === 'Fullstack') {
    syncBeHarness(packageRoot, stagingDir, beAdapter, copyRecursive);
  }
}

export function harnessStagingCacheKey(config, consumerDocsFull) {
  const payload = {
    v: STAGING_VERSION,
    type: config.type,
    frontend: config.frontend ?? null,
    backend: config.backend ?? null,
    consumerDocsFull: Boolean(consumerDocsFull),
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

export function ensureHarnessStaging(opts) {
  const { packageRoot, projectRoot, config, consumerDocsFull = false, copyRecursive } = opts;
  const key = harnessStagingCacheKey(config, consumerDocsFull);
  const stagingRoot = path.join(projectRoot, '.flowgrid', 'harness', 'staging', key);
  const markerPath = path.join(stagingRoot, '.flowgrid-staging.json');
  const bundleDir = path.join(stagingRoot, 'bundle');

  if (fs.existsSync(markerPath)) {
    try {
      const marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'));
      if (marker.key === key && marker.version === STAGING_VERSION && fs.existsSync(bundleDir)) {
        return { bundleDir, cacheKey: key, rebuilt: false };
      }
    } catch {
      /* rebuild */
    }
  }

  fs.mkdirSync(stagingRoot, { recursive: true });
  populateHarnessBundle(bundleDir, {
    packageRoot,
    config,
    consumerDocsFull,
    copyRecursive,
  });
  fs.writeFileSync(
    markerPath,
    JSON.stringify({ version: STAGING_VERSION, key, builtAt: new Date().toISOString() }, null, 2) +
      '\n',
  );
  return { bundleDir, cacheKey: key, rebuilt: true };
}

function materializeBundleToAgent(bundleDir, agentDir) {
  fs.mkdirSync(agentDir, { recursive: true });
  fs.cpSync(bundleDir, agentDir, { recursive: true, force: true });
}

function applyAgentPackageOverlay(packageRoot, agent, agentDir, copyRecursive) {
  const overlaySrc = agentHarnessOverlayPath(packageRoot, agent);
  if (!fs.existsSync(overlaySrc)) return false;
  copyRecursive(overlaySrc, agentDir);
  return true;
}

function rewriteExtractRegistryPaths(agentDir, agentPrefix) {
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, item.name);
      if (item.isDirectory()) {
        walk(p);
      } else if (item.name.includes('extract-registry') && item.name.endsWith('.json')) {
        try {
          const content = JSON.parse(fs.readFileSync(p, 'utf8'));
          if (content.bundles) {
            let modified = false;
            for (const [key, paths] of Object.entries(content.bundles)) {
              content.bundles[key] = paths.map((fp) => {
                if (fp.startsWith(REGISTRY_SOURCE_PREFIX)) {
                  modified = true;
                  return fp.replace(REGISTRY_SOURCE_PREFIX, agentPrefix);
                }
                return fp;
              });
            }
            if (modified) {
              fs.writeFileSync(p, JSON.stringify(content, null, 2) + '\n');
            }
          }
        } catch {
          /* ignore */
        }
      }
    }
  };
  walk(agentDir);
}

/**
 * @param {object} opts
 * @param {string} opts.packageRoot
 * @param {string} opts.projectRoot
 * @param {string} opts.agent
 * @param {object} opts.config — .flowgrid/config.json
 */
export function syncAgentHarness(opts) {
  const { packageRoot, projectRoot, agent, config, consumerDocsFull = false } = opts;
  const copyRecursive = opts.copyRecursive ?? createCopyRecursive();
  const profile = getAgentProfile(agent);

  const agentDir = path.join(projectRoot, profile.dirName);
  if (!fs.existsSync(agentDir)) {
    fs.mkdirSync(agentDir, { recursive: true });
  }

  const { bundleDir } = ensureHarnessStaging({
    packageRoot,
    projectRoot,
    config,
    consumerDocsFull,
    copyRecursive,
  });

  materializeBundleToAgent(bundleDir, agentDir);
  applyAgentPackageOverlay(packageRoot, agent, agentDir, copyRecursive);
  rewriteExtractRegistryPaths(agentDir, profile.registryPathPrefix);

  const selectedType = config.type;
  const feDocRoot = config.frontend?.docsRoot ?? config.backend?.docsRoot ?? '';
  const feTestRoot = config.frontend?.testsRoot ?? '';
  const feAdapter = config.frontend?.adapter ?? '';
  const beAdapter = config.backend?.adapter ?? '';
  const defaultLanguage = config.defaultLanguage;

  const mcpEnv = buildMcpEnv({
    selectedType,
    feDocRoot: selectedType === 'Document' ? projectRoot : feDocRoot,
    feTestRoot,
    feAdapter,
    beAdapter,
    defaultLanguage,
  });

  writeAgentMcpConfig({
    agent,
    agentDir,
    packageRoot,
    env: mcpEnv,
  });

  applyHarnessOverlay(agentDir, agent);

  return { agentDir, mcpEnv, profile };
}

export function loadProjectConfig(projectRoot) {
  const p = path.join(projectRoot, '.flowgrid', 'config.json');
  if (!fs.existsSync(p)) {
    throw new Error('Missing .flowgrid/config.json — run flowgrid init first.');
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function runHarnessSync(argv, { packageRoot, projectRoot = process.cwd(), log = console.log }) {
  const fullDocs = argv.includes('--full-docs');
  const agentsArg = argv.find((a) => a.startsWith('--agent='));
  const agentFilter = agentsArg ? agentsArg.slice('--agent='.length) : null;

  const config = loadProjectConfig(projectRoot);
  const agents = (config.agents?.length ? config.agents : ['cursor']).filter(Boolean);
  const selected = agentFilter ? agents.filter((a) => a === agentFilter) : agents;

  if (agentFilter && selected.length === 0) {
    throw new Error(`Agent "${agentFilter}" not in config.agents: ${agents.join(', ')}`);
  }

  if (fullDocs && config.type === 'Document') {
    log('[flowgrid] --full-docs ignored (Document hub already syncs full bộ docs harness)');
  }

  const staging = ensureHarnessStaging({
    packageRoot,
    projectRoot,
    config,
    consumerDocsFull: fullDocs,
    copyRecursive: createCopyRecursive(),
  });
  if (staging.rebuilt) {
    log(`[flowgrid] harness staging built (${staging.cacheKey})`);
  } else {
    log(`[flowgrid] harness staging cache hit (${staging.cacheKey})`);
  }

  for (const agent of selected) {
    log(
      `[flowgrid] harness sync → ${agent}${fullDocs && config.type !== 'Document' ? ' (full bộ docs)' : ''}`,
    );
    syncAgentHarness({
      packageRoot,
      projectRoot,
      agent,
      config,
      consumerDocsFull: fullDocs,
    });
  }

  writeRootAgentsMd(projectRoot, agents);
  log('[flowgrid] harness sync done.');
}
