#!/usr/bin/env node

import { stdin as input, stdout as output } from 'node:process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { intro, outro, select, multiselect, text, confirm as confirmPrompt, isCancel, cancel } from '@clack/prompts';
import pc from 'picocolors';
import {
  FLOWGRID_PROJECT_IGNORES,
  appendFlowgridProjectIgnores,
  removeFlowgridProjectIgnores,
} from './lib/project-gitignore.mjs';
import { runAuditCommand, resolveAuditInvocation } from './lib/audit-run.mjs';
import { syncAgentHarness, runHarnessSync, createCopyRecursive } from './lib/harness-sync.mjs';
import { writeRootAgentsMd } from './lib/harness-overlay.mjs';
import { runDoctor, printDoctorReport } from './lib/doctor.mjs';

export async function main() {
  const args = process.argv.slice(2);
  if (args.includes('version') || args.includes('-v') || args.includes('--version')) {
    const pkgPath = path.resolve(new URL(import.meta.url).pathname, '../../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log(`FlowGrid v${pkg.version}`);
    return;
  }

  const command = args[0];
  const engineCommands = ['split', 'merge', 'check', 'split_all', 'normalize', 'render', 'publish', 'legacy_validate', 'extract_i18n', 'openapi_render', 'openapi_build_ui', 'openapi_gen'];
  
  if (engineCommands.includes(command)) {
    try {
      const { runEngine } = await import('../dist/docs/cli/engines.js');
      const res = await runEngine(command, args.slice(1));
      if (res.stdout) console.log(res.stdout);
      if (res.stderr) console.error(pc.red(res.stderr));
      process.exit(res.code || 0);
    } catch (e) {
      console.error(pc.red('Engine execution failed: ' + e.message));
      process.exit(1);
    }
  }

  const testCommands = ['cases:render', 'cases:check', 'cases:coverage', 'cases:gate', 'tests:publish', 'testcase:gen', 'testcase:gen:dry', 'testcase:gen:all', 'e2e-registry'];
  if (testCommands.includes(command)) {
    try {
      const { runEngine } = await import('../dist/test/engines/run.js');
      const root = process.cwd();
      let engineRel = [];
      let argv = args.slice(1);
      
      if (command === 'cases:render') engineRel = ['cases', 'render-cases.mjs'];
      if (command === 'cases:check') engineRel = ['cases', 'check-plans.mjs'];
      if (command === 'cases:coverage') engineRel = ['cases', 'check-coverage.mjs'];
      if (command === 'cases:gate') engineRel = ['cases', 'gate.mjs'];
      if (command === 'tests:publish') engineRel = ['cases', 'publish.mjs'];
      if (command.startsWith('testcase:gen')) {
        engineRel = ['testcase', 'runners', 'generate.mjs'];
        if (command === 'testcase:gen:dry' && !argv.includes('--dry-run')) argv.push('--dry-run');
        if (command === 'testcase:gen:all' && !argv.includes('--all')) argv.push('--all');
      }
      if (command === 'e2e-registry') engineRel = ['testcase', 'runners', 'validate-registry.mjs'];

      const res = runEngine({ engineRel, projectRoot: root, argv });
      if (res.stdout) console.log(res.stdout);
      if (res.stderr) console.error(pc.red(res.stderr));
      process.exit(res.status || 0);
    } catch (e) {
      console.error(pc.red('Test engine execution failed: ' + e.message));
      process.exit(1);
    }
  }

  const codegenCommands = [
    'api-gen', 'api-gen:dry', 'api-registry', 'api-unit-gen', 'api-unit-gen:dry', 'api-unit-registry',
    'gen', 'gen:dry', 'registry', 'unit-gen', 'unit-gen:dry', 'unit-registry',
    'gen-common', 'gen-common:dry', 'gen-css', 'gen-css:dry', 'contract-gen', 'contract-gen:dry', 'contract-registry',
    'build-template-code'
  ];
  
  if (codegenCommands.includes(command)) {
    try {
      const configPath = path.join(process.cwd(), '.flowgrid', 'config.json');
      let config = {};
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
      const root = process.cwd();
      const argv = args.slice(1);
      const isDry = command.endsWith(':dry');
      
      const beAdapter = config.backend?.adapter || 'fastapi';
      const feAdapter = config.frontend?.adapter || 'nextjs';
      const docsRoot = config.frontend?.docsRoot;

      if (command.startsWith('api-')) {
        const { runBeEngine } = await import('../dist/codegen/adapters/run-be.js');
        const kindMap = {
          'api-gen': 'codegen', 'api-gen:dry': 'codegen', 'api-registry': 'registry',
          'api-unit-gen': 'unitgen', 'api-unit-gen:dry': 'unitgen', 'api-unit-registry': 'unit-registry'
        };
        const res = runBeEngine({ adapter: beAdapter, projectRoot: root, kind: kindMap[command], argv, dryRun: isDry });
        if (res.stdout) console.log(res.stdout);
        if (res.stderr) console.error(pc.red(res.stderr));
        process.exit(res.status || 0);
      } else if (command.startsWith('contract-')) {
        const { runContractEngine } = await import('../dist/codegen/adapters/run.js');
        const isRegistry = command === 'contract-registry';
        const res = runContractEngine({ projectRoot: root, docsRoot, argv, dryRun: isDry, registry: isRegistry });
        if (res.stdout) console.log(res.stdout);
        if (res.stderr) console.error(pc.red(res.stderr));
        process.exit(res.status || 0);
      } else if (command.startsWith('gen-common')) {
        const { runCommonGen } = await import('../dist/codegen/adapters/run.js');
        const res = runCommonGen({ adapter: feAdapter, projectRoot: root, docsRoot, argv, dryRun: isDry });
        if (res.stdout) console.log(res.stdout);
        if (res.stderr) console.error(pc.red(res.stderr));
        process.exit(res.status || 0);
      } else if (command === 'build-template-code') {
        const { runBuildTemplateCode } = await import('../engines/template-builder/runner.mjs');
        const res = await runBuildTemplateCode(argv);
        process.exit(res.code || 0);
      } else if (command.startsWith('gen-css')) {
        const { runCssGen } = await import('../dist/codegen/adapters/run.js');
        const res = runCssGen({ adapter: feAdapter, projectRoot: root, docsRoot, argv, dryRun: isDry });
        if (res.stdout) console.log(res.stdout);
        if (res.stderr) console.error(pc.red(res.stderr));
        process.exit(res.status || 0);
      } else {
        const { runAdapterEngine } = await import('../dist/codegen/adapters/run.js');
        const kindMap = {
          'gen': 'codegen', 'gen:dry': 'codegen', 'registry': 'codegen',
          'unit-gen': 'unitgen', 'unit-gen:dry': 'unitgen', 'unit-registry': 'unitgen'
        };
        const scriptMap = {
          'gen': 'generate.mjs', 'gen:dry': 'generate.mjs', 'registry': 'validate-registry.mjs',
          'unit-gen': 'generate.mjs', 'unit-gen:dry': 'generate.mjs', 'unit-registry': 'validate-registry.mjs'
        };
        const res = runAdapterEngine({ adapter: feAdapter, kind: kindMap[command], script: scriptMap[command], projectRoot: root, docsRoot, argv, dryRun: isDry });
        if (res.stdout) console.log(res.stdout);
        if (res.stderr) console.error(pc.red(res.stderr));
        process.exit(res.status || 0);
      }
    } catch (e) {
      console.error(pc.red('Codegen engine execution failed: ' + e.message));
      process.exit(1);
    }
  }

  if (command === 'dev' || command === 'serve') {
    const { spawn, spawnSync } = await import('node:child_process');
    const configPath = path.join(process.cwd(), '.flowgrid', 'config.json');
    let docsRoot, testsRoot, feAdapter;
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      docsRoot = config.frontend?.docsRoot || config.backend?.docsRoot;
      testsRoot = config.frontend?.testsRoot;
      feAdapter = config.frontend?.adapter;
    }
    feAdapter = feAdapter || 'nextjs';
    const projectRoot = process.cwd();

    // ── gen-common: initial build (watch is handled by VitePress plugin) ──
    const webAdapters = new Set(['nuxt4', 'nextjs']);
    if (docsRoot && webAdapters.has(feAdapter)) {
      const resolvedDocsRoot = path.resolve(docsRoot);
      const packageRoot = path.resolve(new URL(import.meta.url).pathname, '../..');
      const commonEngine = path.join(packageRoot, 'adapters', 'shared', 'common-gen.mjs');
      const env = {
        ...process.env,
        FLOWGRID_PROJECT_ROOT: projectRoot,
        FLOWGRID_ADAPTER: feAdapter,
        FLOWGRID_DOCS_ROOT: resolvedDocsRoot,
      };
      const res = spawnSync(process.execPath, [commonEngine, '--all-surfaces', '--all-modules'], {
        cwd: projectRoot,
        encoding: 'utf8',
        env,
      });
      if (res.status === 0) {
        const lines = (res.stdout || '').split('\n').filter(Boolean);
        console.log(pc.green(`[Common] initial build — ${lines.length ? lines[0] : 'done'}`));
      } else {
        const msg = (res.stderr || res.stdout || '').trim().split('\n')[0];
        console.log(pc.yellow(`[Common] skipped: ${msg || 'no common sources'}`));
      }
    }

    // ── VitePress dev servers ────────────────────────────────────────
    if (docsRoot) {
      console.log(pc.blue(`[Docs] Starting VitePress in ${docsRoot}...`));
      spawn('npx', ['vitepress', 'dev', docsRoot, ...args.slice(1)], { stdio: 'inherit' });
    }
    if (testsRoot) {
      console.log(pc.blue(`[Tests] Starting VitePress in ${testsRoot} (Port 5174)...`));
      spawn('npx', ['vitepress', 'dev', testsRoot, '--port', '5174', ...args.slice(1)], { stdio: 'inherit' });
    }
    if (!docsRoot && !testsRoot) {
      spawn('npx', ['vitepress', 'dev', ...args.slice(1)], { stdio: 'inherit' });
    }
    // Keep alive for spawned processes
    setInterval(() => {}, 1000);
    return;
  }

  if (command === 'build') {
    const { spawnSync } = await import('node:child_process');
    const configPath = path.join(process.cwd(), '.flowgrid', 'config.json');
    let docsRoot, testsRoot;
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      docsRoot = config.frontend?.docsRoot || config.backend?.docsRoot;
      testsRoot = config.frontend?.testsRoot;
    }
    if (docsRoot) {
      console.log(pc.blue(`[Docs] Building VitePress in ${docsRoot}...`));
      spawnSync('npx', ['vitepress', 'build', docsRoot, ...args.slice(1)], { stdio: 'inherit' });
    }
    if (testsRoot) {
      console.log(pc.blue(`[Tests] Building VitePress in ${testsRoot}...`));
      spawnSync('npx', ['vitepress', 'build', testsRoot, ...args.slice(1)], { stdio: 'inherit' });
    }
    if (!docsRoot && !testsRoot) {
      spawnSync('npx', ['vitepress', 'build', ...args.slice(1)], { stdio: 'inherit' });
    }
    return;
  }

  if (command === 'uninstall') {
    console.log(pc.yellow('Để gỡ cài đặt toàn cầu, vui lòng chạy: bash install.sh --uninstall'));
    console.log(pc.yellow('Hoặc nếu bạn cài đặt local: sh install-local.sh --uninstall'));
    process.exit(0);
  }

  if (command === 'deinit') {
    intro(pc.inverse(' === FlowGrid Deinit === '));
    const confirm = await confirmPrompt({
      message: 'Bạn có chắc chắn muốn gỡ cài đặt FlowGrid khỏi dự án này?',
      initialValue: false
    });
    if (isCancel(confirm) || !confirm) { cancel('Cancelled.'); process.exit(0); }

    const keepRegistry = await confirmPrompt({
      message: 'Giữ lại cấu hình và DSL Registry (.flowgrid/config.json)? (Khuyến nghị CÓ để giữ cấu hình)',
      initialValue: true
    });

    const keepAgents = await confirmPrompt({
      message: 'Giữ lại thư mục Agent Skills (.agents, .gemini, .cursor)? (Để tận dụng cache)',
      initialValue: false
    });

    console.log(pc.blue('\n[INFO] Đang tiến hành gỡ bỏ...'));
    const targetDir = path.join(process.cwd(), '.flowgrid');
    if (fs.existsSync(targetDir)) {
      if (keepRegistry && fs.existsSync(path.join(targetDir, 'config.json'))) {
        const items = fs.readdirSync(targetDir);
        for (const item of items) {
          if (item !== 'config.json') {
            fs.rmSync(path.join(targetDir, item), { recursive: true, force: true });
          }
        }
        console.log('  - Đã dọn dẹp .flowgrid/ nhưng giữ lại config.json');
      } else {
        fs.rmSync(targetDir, { recursive: true, force: true });
        console.log('  - Đã xóa hoàn toàn thư mục .flowgrid/');
      }
    }

    if (!keepRegistry) {
      const artifactGraphDir = path.join(process.cwd(), 'artifactgraph');
      if (fs.existsSync(artifactGraphDir)) {
        fs.rmSync(artifactGraphDir, { recursive: true, force: true });
        console.log('  - Đã xóa hoàn toàn thư mục backup artifactgraph/');
      }
    }

    if (!keepAgents) {
      const dirs = ['.agents', '.gemini', '.cursor', '.claude', '.codex', '.opencode', '.hermes', '.kiro', '.kilo'];
      for (const d of dirs) {
        const p = path.join(process.cwd(), d);
        if (fs.existsSync(p)) {
          fs.rmSync(p, { recursive: true, force: true });
          console.log(`  - Đã xóa thư mục ${d}/`);
        }
      }
    } else {
      console.log('  - Đã bỏ qua bước xóa Agent Skills (giữ lại cache)');
    }

    const vpPath = path.join(process.cwd(), '.vitepress');
    if (fs.existsSync(vpPath)) {
      fs.rmSync(vpPath, { recursive: true, force: true });
      console.log('  - Đã xóa thư mục .vitepress/ (cấu hình docs/testcases)');
    }

    const pkgPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.scripts) {
          let modified = false;
          for (const key of Object.keys(pkg.scripts)) {
            if (key.startsWith('flowgrid:') || key.startsWith('flow:')) {
              delete pkg.scripts[key];
              modified = true;
            }
          }
          if (modified) {
            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
            console.log('  - Đã xóa các lệnh liên quan khỏi package.json');
          }
        }
      } catch (e) {}
    }

    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      const ignoresToRemove = [];
      if (!keepAgents) {
        ignoresToRemove.push(...FLOWGRID_PROJECT_IGNORES);
      }
      const { content, modified } = removeFlowgridProjectIgnores(gitignoreContent, ignoresToRemove);
      if (modified) {
        fs.writeFileSync(gitignorePath, content);
        console.log('  - Đã dọn dẹp các mục FlowGrid khỏi .gitignore');
      }
    }

    outro(pc.green('Đã dọn dẹp FlowGrid thành công!'));
    process.exit(0);
  }

  if (command === 'doctor') {
    try {
      const packageRoot = path.resolve(new URL(import.meta.url).pathname, '../../');
      const fix = args.includes('--fix');
      const report = runDoctor({
        projectRoot: process.cwd(),
        packageRoot,
        fix,
      });
      printDoctorReport(report);
      process.exit(report.ok ? 0 : 1);
    } catch (e) {
      console.error(pc.red(e.message));
      process.exit(1);
    }
  }

  if (command === 'harness' && args[1] === 'sync') {
    try {
      const packageRoot = path.resolve(new URL(import.meta.url).pathname, '../../');
      runHarnessSync(args.slice(2), { packageRoot });
      process.exit(0);
    } catch (e) {
      console.error(pc.red(e.message));
      process.exit(1);
    }
  }

  try {
    const audit = resolveAuditInvocation(args);
    if (audit) {
      process.exit(runAuditCommand(audit.command, audit.argv));
    }
  } catch (e) {
    console.error(pc.red(e.message));
    process.exit(1);
  }

  if (command && command !== 'init') {
    console.error(pc.red(`Lệnh không hợp lệ: ${command}`));
    console.log(`Chạy 'flowgrid init', 'flowgrid doctor', 'flowgrid harness sync', hoặc 'flowgrid audit'.`);
    process.exit(1);
  }

  intro(pc.inverse(' === FlowGrid Unified Installer === '));
  console.log(pc.gray("Welcome to FlowGrid. This tool will initialize MCP configuration, scripts, and agents for your project.\n"));

  // 1. Agents
  const agentsAns = await multiselect({
    message: 'Select Agents/Skills to integrate:',
    options: [
      { value: 'gemini_antigravity', label: 'Gemini & Antigravity' },
      { value: 'cursor', label: 'Cursor' },
      { value: 'claude', label: 'Claude Code' },
      { value: 'codex', label: 'Codex CLI' },
      { value: 'opencode', label: 'opencode' },
      { value: 'hermes', label: 'Hermes Agent' },
      { value: 'kiro', label: 'Kiro' },
      { value: 'kilo', label: 'Kilo Code' }
    ],
    required: false
  });
  if (isCancel(agentsAns)) {
    cancel('Cancelled.');
    process.exit(0);
  }
  const selectedAgents = agentsAns;

  // 2. Project Type
  const selectedType = await select({
    message: 'Select project type:',
    options: [
      { value: 'Frontend', label: 'Frontend' },
      { value: 'Backend', label: 'Backend' },
      { value: 'Fullstack', label: 'Fullstack' },
      { value: 'Document', label: 'Document' },
      { value: 'Test', label: 'Test' }
    ],
    initialValue: 'Frontend'
  });
  if (isCancel(selectedType)) {
    cancel('Cancelled.');
    process.exit(0);
  }

  let feAdapter = '';
  let beAdapter = '';
  let feDocRoot = '';
  let feTestRoot = '';
  let baseProfile = 'standard';
  let goldenSample = '';

  if (selectedType !== 'Document') {
    const baseProfileAns = await select({
      message: 'Select Base Architecture Profile:',
      options: [
        { value: 'standard', label: 'Standard Base (Khuyến nghị cho dự án mới: Nuxt4, NextJS, NestJS, FastAPI)' },
        { value: 'custom', label: 'Custom / Existing Base (Dành cho dự án Maintain hoặc Tech Stack khác Base)' }
      ],
      initialValue: 'standard'
    });
    if (isCancel(baseProfileAns)) { cancel('Cancelled.'); process.exit(0); }
    baseProfile = baseProfileAns;

    if (baseProfile === 'custom') {
      const sampleAns = await text({
        message: 'Enter path to Golden Sample file (màn hình/file mẫu đẹp nhất để bóc tách DNA, tùy chọn):',
        placeholder: 'src/pages/users/UserList.vue'
      });
      if (isCancel(sampleAns)) { cancel('Cancelled.'); process.exit(0); }
      goldenSample = sampleAns ? sampleAns.trim() : '';
    }

    if (selectedType === 'Fullstack') {
      const feAns = await select({
        message: 'Select Frontend technology:',
        options: [
          { value: 'nuxt4', label: 'nuxt4' },
          { value: 'nextjs', label: 'nextjs' },
          { value: 'custom', label: 'custom (Other Vue/React/Angular)' }
        ]
      });
      if (isCancel(feAns)) { cancel('Cancelled.'); process.exit(0); }
      feAdapter = feAns;
      beAdapter = 'nestjs';
      console.log(pc.cyan(`=> Selected Fullstack: Frontend (${feAdapter}) + Backend (${beAdapter})`));
    } else if (selectedType === 'Frontend') {
      const feAns = await text({
        message: 'Enter Frontend technology (e.g. nuxt4, nextjs, or custom):',
        placeholder: baseProfile === 'custom' ? 'custom' : 'nuxt4'
      });
      if (isCancel(feAns)) { cancel('Cancelled.'); process.exit(0); }
      feAdapter = feAns || (baseProfile === 'custom' ? 'custom' : 'nuxt4');
    } else if (selectedType === 'Backend') {
      const beAns = await text({
        message: 'Enter Backend technology (e.g. nestjs, fastapi, laravel, dotnet, or custom):',
        placeholder: baseProfile === 'custom' ? 'custom' : 'nestjs'
      });
      if (isCancel(beAns)) { cancel('Cancelled.'); process.exit(0); }
      beAdapter = beAns || (baseProfile === 'custom' ? 'custom' : 'nestjs');
    }

    const docRootAns = await text({
      message: 'Enter the root directory for documentation:',
      placeholder: 'docs/fe',
      defaultValue: 'docs/fe'
    });
    if (isCancel(docRootAns)) { cancel('Cancelled.'); process.exit(0); }
    feDocRoot = docRootAns;

    if (selectedType === 'Frontend' || selectedType === 'Fullstack') {
      const testRootAns = await text({
        message: 'Enter the root directory for Frontend tests:',
        placeholder: 'tests/fe',
        defaultValue: 'tests/fe'
      });
      if (isCancel(testRootAns)) { cancel('Cancelled.'); process.exit(0); }
      feTestRoot = testRootAns;
    }

    if (selectedType === 'Test') {
      const testRootAns = await text({
        message: 'Enter the root directory for test plans / cases (VitePress cases hub):',
        placeholder: 'tests',
        defaultValue: 'tests'
      });
      if (isCancel(testRootAns)) { cancel('Cancelled.'); process.exit(0); }
      feTestRoot = testRootAns;
    }
  }
  // Document hub: repo cwd is the docs SSOT — no docsRoot pointer in config or MCP env.

  let defaultLanguage = undefined;
  let supportedLanguages = undefined;
  if (selectedType === 'Document') {
    const langsAns = await text({
      message: 'Enter supported languages (comma separated, e.g. vi,en,ja) or leave empty:',
      placeholder: 'vi,en'
    });
    if (isCancel(langsAns)) { cancel('Cancelled.'); process.exit(0); }
    
    if (langsAns) {
      supportedLanguages = langsAns.split(',').map(l => l.trim()).filter(Boolean);
      if (supportedLanguages.length === 1) {
        defaultLanguage = supportedLanguages[0];
      } else if (supportedLanguages.length > 1) {
        const defLangAns = await select({
          message: 'Select default language:',
          options: supportedLanguages.map(l => ({ value: l, label: l }))
        });
        if (isCancel(defLangAns)) { cancel('Cancelled.'); process.exit(0); }
        defaultLanguage = defLangAns;
      }
    }
  }

  console.log(pc.magenta("\n=== Installation Plan ==="));
  console.log(`- Project Type: ${selectedType}`);
  if (selectedType === 'Document') {
    console.log(`- Docs hub: repository root (không cấu hình docsRoot / FLOWGRID_DOCS_ROOT)`);
    if (supportedLanguages?.length) {
      console.log(`- Languages: ${supportedLanguages.join(', ')} (default: ${defaultLanguage ?? '—'})`);
    }
  } else {
    console.log(`- Base Profile: ${baseProfile}${goldenSample ? ` (Sample: ${goldenSample})` : ''}`);
    if (feDocRoot) {
      console.log(`- Docs SSOT pointer: ${feDocRoot} (consumer → external docs hub)`);
    }
    if (feTestRoot) {
      console.log(`- Tests root: ${feTestRoot}`);
    }
    if (feAdapter) {
      console.log(`- Frontend Adapter: ${feAdapter}`);
    }
    if (beAdapter) {
      console.log(`- Backend Adapter: ${beAdapter}`);
    }
  }
  console.log(`- Setup Agents: ${selectedAgents.length > 0 ? selectedAgents.join(', ') : 'No'}`);
  console.log(`- Destination folder: .flowgrid/`);

  const confirm = await confirmPrompt({
    message: 'Proceed with initialization?',
    initialValue: true
  });
  if (isCancel(confirm) || !confirm) {
    cancel('Cancelled.');
    process.exit(0);
  }

  console.log(pc.blue("\n[INFO] Initializing .flowgrid folder..."));
  const targetDir = path.join(process.cwd(), '.flowgrid');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const projectConfig = {
    type: selectedType,
    agents: selectedAgents,
    baseProfile,
    goldenSample: goldenSample || undefined,
    languages: supportedLanguages,
    defaultLanguage,
    frontend: feAdapter ? {
      adapter: feAdapter,
      docsRoot: feDocRoot,
      testsRoot: feTestRoot
    } : null,
    backend: beAdapter ? {
      adapter: beAdapter,
      docsRoot: (!feAdapter && feDocRoot) ? feDocRoot : undefined
    } : null
  };
  fs.writeFileSync(path.join(targetDir, 'config.json'), JSON.stringify(projectConfig, null, 2));
  console.log("  + Wrote config.json");

  const packageRoot = path.resolve(new URL(import.meta.url).pathname, '../../');
  
  const copyRecursive = (srcDir, destDir, log = false) => {
    if (!fs.existsSync(srcDir)) return;
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const items = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const item of items) {
      if (['node_modules', '.git', 'dist', '.agents', '.gemini', '.cursor', '.flowgrid'].includes(item.name)) continue;
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

  if (feAdapter) {
    console.log(pc.blue(`[INFO] Syncing Frontend adapter (${feAdapter})...`));
    copyRecursive(path.join(packageRoot, 'adapters', feAdapter), targetDir);
  }
  if (beAdapter) {
    console.log(pc.blue(`[INFO] Syncing Backend adapter (${beAdapter})...`));
    copyRecursive(path.join(packageRoot, 'adapters', beAdapter), targetDir);
  }

  const vitepressDocsSource = path.join(packageRoot, 'engines', 'docs', 'vitepress');
  if (fs.existsSync(vitepressDocsSource)) {
    let destDocVp;
    let destDocsRoot;
    if (selectedType === 'Document') {
       destDocsRoot = process.cwd();
       destDocVp = path.join(process.cwd(), '.vitepress');
    } else if (feDocRoot) {
       destDocsRoot = path.join(process.cwd(), feDocRoot);
       destDocVp = path.join(process.cwd(), feDocRoot, '.vitepress');
    }
    if (destDocVp && destDocsRoot) {
       console.log(pc.blue(`  + Syncing .vitepress configs to ${path.relative(process.cwd(), destDocVp) || '.vitepress'}...`));
       copyRecursive(vitepressDocsSource, destDocVp);
       
       const baseDocsSource = path.join(packageRoot, 'templates', 'project-skeleton');
       if (fs.existsSync(baseDocsSource)) {
          console.log(pc.blue(`  + Initializing Base Docs Structure to ${path.relative(process.cwd(), destDocsRoot) || '.'}...`));
          if (!fs.existsSync(destDocsRoot)) fs.mkdirSync(destDocsRoot, { recursive: true });
          const items = fs.readdirSync(baseDocsSource, { withFileTypes: true });
          for (const item of items) {
             const srcPath = path.join(baseDocsSource, item.name);
             const destPath = path.join(destDocsRoot, item.name);
             if (!fs.existsSync(destPath)) {
                if (item.isDirectory()) {
                  copyRecursive(srcPath, destPath);
                } else {
                  fs.copyFileSync(srcPath, destPath);
                }
                console.log(`    - Created ${item.name}`);
             }
          }
       }
    }
  }

  const vitepressCasesSource = path.join(packageRoot, 'engines', 'cases', 'vitepress');
  if (fs.existsSync(vitepressCasesSource)) {
    let destCasesVp;
    if (selectedType === 'Test') {
       destCasesVp = path.join(process.cwd(), '.vitepress');
    } else if (feTestRoot && feTestRoot !== feDocRoot) {
       destCasesVp = path.join(process.cwd(), feTestRoot, '.vitepress');
    }
    if (destCasesVp) {
       console.log(pc.blue(`  + Syncing .vitepress configs for Testcases to ${path.relative(process.cwd(), destCasesVp) || '.vitepress'}...`));
       copyRecursive(vitepressCasesSource, destCasesVp);
    }
  }

  console.log(pc.blue(`[INFO] Syncing global templates & schemas...`));
  const tplSrc = path.join(packageRoot, 'templates');
  const tplDest = path.join(targetDir, 'templates');
  if (fs.existsSync(path.join(tplSrc, 'shared'))) {
    copyRecursive(path.join(tplSrc, 'shared'), tplDest);
  }
  const otherTpls = ['schemas'];
  for (const t of otherTpls) {
    if (fs.existsSync(path.join(tplSrc, t))) {
      copyRecursive(path.join(tplSrc, t), path.join(tplDest, t));
    }
  }
  copyRecursive(path.join(packageRoot, 'schemas'), path.join(targetDir, 'schemas'));
  
  const harnessCopy = createCopyRecursive();
  if (selectedAgents.length > 0) {
    console.log(pc.blue('[INFO] Initializing Agent Harnesses...'));
    for (const agent of selectedAgents) {
      console.log(`  + Syncing Skills for ${agent}...`);
      const { agentDir, profile } = syncAgentHarness({
        packageRoot,
        projectRoot: process.cwd(),
        agent,
        config: projectConfig,
        copyRecursive: harnessCopy,
      });
      const mcpConfigPath = path.join(agentDir, profile.mcpFile);
      console.log(
        pc.gray(`  + Wrote MCP config: ${path.relative(process.cwd(), mcpConfigPath) || mcpConfigPath}`)
      );
    }
    writeRootAgentsMd(process.cwd(), selectedAgents);
    console.log(pc.gray('  + Wrote root AGENTS.md'));
  }

  const pkgPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      pkg.scripts = pkg.scripts || {};
      pkg.devDependencies = pkg.devDependencies || {};

      if (selectedType === 'Document' || feDocRoot || feTestRoot || selectedType === 'Test') {
        pkg.devDependencies['vitepress'] = '^1.4.0';
        pkg.devDependencies['vitepress-plugin-mermaid'] = '^2.0.17';
        pkg.devDependencies['vitepress-mermaid-renderer'] = '^1.2.0';
        pkg.devDependencies['mermaid'] = '^11.17.2';
        pkg.devDependencies['dayjs'] = '^1.11.13';
        pkg.devDependencies['debug'] = '^4.3.4';
        pkg.devDependencies['cytoscape'] = '^3.30.3';
        pkg.devDependencies['cytoscape-cose-bilkent'] = '^4.1.0';
        pkg.devDependencies['@braintree/sanitize-url'] = '^7.1.0';
      }

      pkg.scripts['flowgrid:audit'] = 'flowgrid audit';
      pkg.scripts['flowgrid:audit:spec'] = 'flowgrid audit spec';
      pkg.scripts['flowgrid:audit:flow'] = 'flowgrid audit flow';
      pkg.scripts['flowgrid:audit:api'] = 'flowgrid audit api';
      pkg.scripts['flowgrid:audit:testcase'] = 'flowgrid audit testcase';
      pkg.scripts['flowgrid:audit:legacy'] = 'flowgrid audit legacy';
      pkg.scripts['flowgrid:harness-sync'] = 'flowgrid harness sync';
      pkg.scripts['flowgrid:harness-sync:full-docs'] = 'flowgrid harness sync --full-docs';
      pkg.scripts['flowgrid:doctor'] = 'flowgrid doctor';
      pkg.scripts['flowgrid:doctor:fix'] = 'flowgrid doctor --fix';

      if (selectedType === 'Document') {
        pkg.scripts['flowgrid:split'] = 'flowgrid split';
        pkg.scripts['flowgrid:split_all'] = 'flowgrid split_all';
        pkg.scripts['flowgrid:render'] = 'flowgrid render';
        pkg.scripts['flowgrid:openapi'] = 'flowgrid openapi_render';
        pkg.scripts['flowgrid:openapi-ui'] = 'flowgrid openapi_build_ui';
        pkg.scripts['flowgrid:dev'] = 'flowgrid dev';
        pkg.scripts['flowgrid:build'] = 'flowgrid build';
        pkg.scripts['flowgrid:publish'] = 'flowgrid publish';
        pkg.scripts['flow:dev'] = 'flowgrid dev';
        pkg.scripts['flow:render'] = 'flowgrid render';
        pkg.scripts['flow:publish'] = 'flowgrid publish';
      }

      if (selectedType === 'Frontend' || selectedType === 'Fullstack') {
        pkg.scripts['flowgrid:gen'] = 'flowgrid gen';
        pkg.scripts['flowgrid:unit'] = 'flowgrid unit-gen';
        pkg.scripts['flowgrid:css'] = 'flowgrid gen-css';
      }

      if (selectedType === 'Backend' || selectedType === 'Fullstack') {
        pkg.scripts['flowgrid:api-gen'] = 'flowgrid api-gen';
        pkg.scripts['flowgrid:api-unit'] = 'flowgrid api-unit-gen';
        pkg.scripts['flowgrid:openapi'] = 'flowgrid openapi_render';
      }

      if (selectedType === 'Frontend' || selectedType === 'Backend' || selectedType === 'Fullstack') {
        pkg.scripts['flowgrid:contract'] = 'flowgrid contract-gen';
      }

      if (selectedType === 'Test') {
        pkg.scripts['flowgrid:cases'] = 'flowgrid cases:render';
        pkg.scripts['flowgrid:cases-check'] = 'flowgrid cases:check';
        pkg.scripts['flowgrid:cases-cov'] = 'flowgrid cases:coverage';
        pkg.scripts['flowgrid:cases-gate'] = 'flowgrid cases:gate';
        pkg.scripts['flowgrid:e2e-gen'] = 'flowgrid testcase:gen';
        pkg.scripts['flowgrid:e2e-reg'] = 'flowgrid e2e-registry';
      }
      
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log(pc.blue('  + Injected flowgrid:* & flow:* scripts into package.json'));
    } catch (e) {
      console.log(pc.yellow('  ! Could not inject scripts into package.json'));
    }
  }

  console.log(pc.blue('\n[INFO] Khởi tạo bộ đệm (SQLite cache) cho ArtifactGraph...'));
  try {
    const { loadEffectiveRepoConfig } = await import('../dist/graph/config/load-config.js');
    const { IndexStore } = await import('../dist/graph/db/index-store.js');
    const { loadRegistries, indexRegistries } = await import('../dist/graph/registry/load-registries.js');
    const { indexLexicons } = await import('../dist/graph/lexicon/load-lexicon.js');

    const root = process.cwd();
    const cfg = loadEffectiveRepoConfig(root);
    const store = new IndexStore(root);
    store.transaction(() => {
      const loaded = loadRegistries(root, cfg);
      indexRegistries(store, loaded, root, cfg);
      indexLexicons(store, root, cfg);
    });
    store.close();
    console.log('  + Đã build SQLite cache thành công tại .flowgrid/index.db');
  } catch (e) {
    console.log(pc.yellow('  ! Không thể khởi tạo SQLite cache (chưa có specs/registry): ' + e.message));
  }

  const dslBackupDir = path.join(process.cwd(), 'artifactgraph');
  if (!fs.existsSync(dslBackupDir)) {
    fs.mkdirSync(dslBackupDir, { recursive: true });
    fs.mkdirSync(path.join(dslBackupDir, 'registries'), { recursive: true });
    fs.mkdirSync(path.join(dslBackupDir, 'specs'), { recursive: true });
    console.log(pc.blue('\n[INFO] Đã tạo thư mục backup DSL tại artifactgraph/'));
  }

  const destLexicon = path.join(dslBackupDir, 'lexicon');
  if (!fs.existsSync(destLexicon)) {
    fs.mkdirSync(destLexicon, { recursive: true });
    const srcLexicon = path.join(packageRoot, 'lexicon');
    if (fs.existsSync(srcLexicon)) {
      copyRecursive(srcLexicon, destLexicon);
      console.log(pc.blue('  + Đã mồi (seed) lexicon mặc định vào artifactgraph/lexicon/'));
    }
  }

  if (['Frontend', 'Backend', 'Fullstack'].includes(selectedType)) {
    const optionalAns = await multiselect({
      message: 'Optional toolkits to initialize now (none = skip, add later):',
      options: [
        { value: 'codegraph', label: 'Codegraph — semantic code intelligence' }
      ],
      required: false
    });
    if (!isCancel(optionalAns) && optionalAns.includes('codegraph')) {
      console.log(pc.blue('\n[INFO] Initializing Codegraph...'));
      try {
        const { spawnSync } = await import('node:child_process');
        const res = spawnSync('npx', ['codegraph', 'init'], { stdio: 'inherit' });
        if (res.status === 0) {
          console.log('  + Codegraph initialized successfully');
        } else {
          console.log(pc.yellow(`  ! Codegraph initialization failed with status ${res.status}`));
        }
      } catch (e) {
        console.log(pc.yellow('  ! Failed to run Codegraph init: ' + e.message));
      }
    }
  }

  const gitignorePath = path.join(process.cwd(), '.gitignore');
  let gitignoreContent = '';
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }
  const { content: nextGitignore, appended } = appendFlowgridProjectIgnores(
    gitignoreContent,
    FLOWGRID_PROJECT_IGNORES,
  );
  if (appended.length > 0) {
    fs.writeFileSync(gitignorePath, nextGitignore);
    console.log(pc.blue(`\n[INFO] Cập nhật .gitignore: đã thêm ${appended.join(', ')}`));
  }

  outro(pc.green("Success! FlowGrid is initialized for your project."));
}

const isDirectCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectCli) {
  main().catch((err) => {
    console.error(pc.red(err.message));
    process.exit(1);
  });
}
