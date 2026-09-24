import * as path from 'node:path';
import * as fs from 'node:fs';
import pc from 'picocolors';
import { scanProject, extractDna, generateDesignRegistry, parameterizeTemplate } from './scanner.mjs';

export async function runBuildTemplateCode(args = []) {
  const projectRoot = process.cwd();
  const isDry = args.includes('--dry-run');
  const isForce = args.includes('--force');
  
  let samplePath = '';
  const sampleArg = args.find(a => a.startsWith('--sample='));
  if (sampleArg) {
    samplePath = sampleArg.split('=')[1];
  }

  // Load config if exists
  const configPath = path.join(projectRoot, '.forgekit', 'config.json');
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (!samplePath && config.goldenSample) {
        samplePath = config.goldenSample;
      }
    } catch {}
  }

  console.log(pc.cyan(`\n=== Forgekit Custom Template & DSL Builder ===`));
  console.log(`- Project Root: ${projectRoot}`);
  console.log(`- Base Profile: ${config.baseProfile || 'custom'}`);

  // 1. Scan Project
  const projectInfo = scanProject(projectRoot);
  console.log(pc.green(`✔ Detected UI Library:`), projectInfo.uiLibrary);

  // 2. Resolve Golden Sample
  if (!samplePath) {
    // Attempt auto-discovery in src/pages or pages
    const candidateDirs = ['src/pages', 'pages', 'src/views', 'views', 'src/app'];
    for (const dir of candidateDirs) {
      const fullDir = path.join(projectRoot, dir);
      if (fs.existsSync(fullDir)) {
        const files = fs.readdirSync(fullDir, { recursive: true });
        const sample = files.find(f => (typeof f === 'string') && (f.endsWith('.vue') || f.endsWith('.tsx') || f.endsWith('.jsx')));
        if (sample) {
          samplePath = path.join(dir, sample);
          break;
        }
      }
    }
  }

  if (!samplePath || !fs.existsSync(path.join(projectRoot, samplePath))) {
    console.log(pc.yellow(`\n[WARN] No Golden Sample found. Please provide one via: forgekit build-template-code --sample=<path/to/Sample.vue>`));
    return { code: 0 };
  }

  const fullSamplePath = path.join(projectRoot, samplePath);
  console.log(pc.green(`✔ Using Golden Sample:`), samplePath);

  // 3. Extract DNA
  const dna = extractDna(fullSamplePath);
  console.log(`  * Layout Shells: ${dna.shells.join(', ')}`);
  console.log(`  * Widgets: ${dna.widgets.length} components extracted`);

  // 4. Target output directory
  const outputDir = path.join(projectRoot, '.forgekit', 'adapters', 'custom');
  if (isDry) {
    console.log(pc.magenta(`\n[DRY RUN] Would generate:`));
    console.log(`  - ${path.join(outputDir, 'registries', 'design.registry.json')}`);
    console.log(`  - ${path.join(outputDir, 'templates', 'list.vue.hbs')}`);
    return { code: 0 };
  }

  // 5. Generate Registry & Templates
  const regResult = generateDesignRegistry({
    uiLibrary: projectInfo.uiLibrary,
    shells: dna.shells,
    widgets: dna.widgets,
    outputDir
  });
  console.log(pc.green(`✔ Generated Registry:`), regResult.registryPath);

  const tplResult = parameterizeTemplate({
    sampleContent: dna.rawContent,
    outputDir,
    templateName: dna.ext === '.tsx' ? 'list.tsx.hbs' : 'list.vue.hbs'
  });
  console.log(pc.green(`✔ Generated Template:`), tplResult.templatePath);

  console.log(pc.cyan(`\n✨ Custom Template and DSL Registry successfully established!`));
  console.log(pc.gray(`Run 'forgekit split' or '/spec' to author specifications matching this custom base.\n`));

  return { code: 0 };
}
