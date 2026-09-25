#!/usr/bin/env node

/**
 * audit-testcase-gaps.mjs
 * Audits cases/TC-*.yaml (v2) or legacy plan YAML.
 * Optional --bundle cross-reference against *.bundle.yaml.
 */

import fs from 'fs';
import path from 'path';
import { auditTestcaseBundleCross } from './audit-testcase-bundle-cross.mjs';
import { auditTestcasePlanContent } from './audit-testcase-plan-gaps.mjs';
import { auditTestcaseTcFile, isTestCaseArtifact } from './audit-testcase-tc.mjs';

export function auditTestcaseContent(rawText, filePath) {
  if (isTestCaseArtifact(filePath, rawText)) {
    return auditTestcaseTcFile(rawText, filePath);
  }
  const report = auditTestcasePlanContent(rawText, filePath);
  return { ...report, artifactKind: 'plan' };
}

function parseCliArgs(argv) {
  let bundlePath = null;
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--bundle' && argv[i + 1]) {
      bundlePath = argv[++i];
    } else {
      positional.push(argv[i]);
    }
  }
  return { targetFile: positional[0], bundlePath };
}

function mergeBundleReport(report, bundleFile, bundleText, tcText) {
  const cross = auditTestcaseBundleCross(bundleText, tcText, bundleFile);
  report.bundle = cross.bundle;
  report.bundleCrossGaps = cross.bundleCrossGaps;
  for (const g of cross.bundleCrossGaps) {
    report.gaps.push(g);
  }
  report.totalGaps = report.gaps.length;
  report.criticalGaps = report.gaps.filter((g) => g.severity === 'critical').length;
  report.warningGaps = report.gaps.filter((g) => g.severity === 'warning').length;
  report.infoGaps = report.gaps.filter((g) => g.severity === 'info').length;
  return report;
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(
    'Usage: node engines/spec/lib/audit-testcase-gaps.mjs <TC-*.yaml|plan.test.yaml> [--bundle path/to/foo.bundle.yaml]',
  );
  process.exit(0);
}

const { targetFile: targetArg, bundlePath: bundleArg } = parseCliArgs(args);
const targetFile = path.resolve(process.cwd(), targetArg);
if (!fs.existsSync(targetFile)) {
  console.error(JSON.stringify({ error: `File not found: ${targetFile}` }));
  process.exit(1);
}

const rawText = fs.readFileSync(targetFile, 'utf8');
let report = auditTestcaseContent(rawText, targetFile);

if (bundleArg) {
  const bundleFile = path.resolve(process.cwd(), bundleArg);
  if (!fs.existsSync(bundleFile)) {
    console.error(JSON.stringify({ error: `Bundle not found: ${bundleFile}` }));
    process.exit(1);
  }
  const bundleText = fs.readFileSync(bundleFile, 'utf8');
  report = mergeBundleReport(report, bundleFile, bundleText, rawText);
}

console.log(JSON.stringify(report, null, 2));
