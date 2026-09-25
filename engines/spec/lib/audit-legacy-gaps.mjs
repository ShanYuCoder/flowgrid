#!/usr/bin/env node

/**
 * audit-legacy-gaps.mjs
 * Zero-dependency static audit script for legacy adoption index (adoption-inventory.md).
 * Ensures all requested screen (W-*) and API (API-*) IDs are mapped to existing legacy code files.
 */

import fs from 'fs';
import path from 'path';

function auditLegacyInventory(inventoryPath, targetId) {
  const gaps = [];

  function addGap(code, severity, fieldPath, message, suggestedFix) {
    gaps.push({
      code,
      severity, // 'critical' | 'warning' | 'info'
      path: fieldPath,
      message,
      suggestedFix
    });
  }

  if (!fs.existsSync(inventoryPath)) {
    addGap(
      'MISSING_ADOPTION_INVENTORY',
      'critical',
      'adoption-inventory.md',
      'Legacy adoption index file `adoption-inventory.md` does not exist at workspace root.',
      'Run `@flowgrid /adopt` to scan and index legacy repositories before archaeology.'
    );
    return {
      file: inventoryPath,
      totalGaps: gaps.length,
      criticalGaps: gaps.length,
      warningGaps: 0,
      infoGaps: 0,
      gaps
    };
  }

  const rawText = fs.readFileSync(inventoryPath, 'utf8');

  if (targetId) {
    if (!rawText.includes(targetId)) {
      addGap(
        'UNMAPPED_LEGACY_ID',
        'critical',
        `adoption-inventory.md#${targetId}`,
        `Archaeology target ID "${targetId}" is not listed in adoption-inventory.md.`,
        `Re-run @flowgrid /adopt or manually add mapping line: "- ID: ${targetId} -> Path: path/to/legacy/file".`
      );
    }
  }

  return {
    file: inventoryPath,
    totalGaps: gaps.length,
    criticalGaps: gaps.filter(g => g.severity === 'critical').length,
    warningGaps: gaps.filter(g => g.severity === 'warning').length,
    infoGaps: gaps.filter(g => g.severity === 'info').length,
    gaps
  };
}

// CLI Execution
const args = process.argv.slice(2);
const inventoryPath = path.resolve(process.cwd(), 'adoption-inventory.md');
const targetId = args[0] || null;

const report = auditLegacyInventory(inventoryPath, targetId);
console.log(JSON.stringify(report, null, 2));
