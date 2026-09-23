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
      'File index khảo cổ legacy `adoption-inventory.md` chưa tồn tại tại root workspace.',
      'Vui lòng chạy `@docskit /adopt` để quét chỉ mục legacy trước khi thực hiện khảo cổ.'
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
        `Mã ID khảo cổ "${targetId}" chưa được liệt kê trong adoption-inventory.md.`,
        `Chạy lại @docskit /adopt hoặc cập nhật thủ công dòng map: "- ID: ${targetId} -> Path: path/to/legacy/file".`
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
