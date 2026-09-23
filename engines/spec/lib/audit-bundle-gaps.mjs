#!/usr/bin/env node

/**
 * audit-bundle-gaps.mjs
 * Zero-dependency deterministic gap audit script for Forgekit feature bundle YAML files.
 * Performs fast static analysis to detect missing or incomplete specification fields
 * and outputs a structured JSON report for LLMs/AskQuestion wizards.
 */

import fs from 'fs';
import path from 'path';

/**
 * Minimal YAML parser supporting objects, arrays, and multiline text.
 */
function parseYamlLight(yamlString) {
  const lines = yamlString.split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, val: root }];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    // Ignore comments and empty lines
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;

    const indent = rawLine.search(/\S/);
    const line = rawLine.trim();

    // Pop stack to match current indentation
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const current = stack[stack.length - 1].val;

    if (line.startsWith('- ')) {
      const itemContent = line.slice(2).trim();
      let parentArray;
      if (Array.isArray(current)) {
        parentArray = current;
      } else {
        // If current is an object, convert or find parent
        parentArray = [];
      }

      if (itemContent.includes(':')) {
        const colonIdx = itemContent.indexOf(':');
        const key = itemContent.slice(0, colonIdx).trim();
        const valStr = itemContent.slice(colonIdx + 1).trim();
        const itemObj = {};
        if (valStr) itemObj[key] = cleanVal(valStr);
        parentArray.push(itemObj);
        stack.push({ indent, val: itemObj });
      } else if (itemContent) {
        parentArray.push(cleanVal(itemContent));
      } else {
        const itemObj = {};
        parentArray.push(itemObj);
        stack.push({ indent, val: itemObj });
      }
    } else if (line.includes(':')) {
      const colonIdx = line.indexOf(':');
      const key = line.slice(0, colonIdx).trim();
      let valStr = line.slice(colonIdx + 1).trim();

      if (valStr === '' || valStr === '|' || valStr === '>') {
        const nextObj = valStr === '' ? {} : '';
        if (Array.isArray(current)) {
          const last = current[current.length - 1];
          if (typeof last === 'object') last[key] = nextObj;
        } else if (typeof current === 'object') {
          current[key] = nextObj;
        }
        stack.push({ indent, val: nextObj });
      } else {
        const cleaned = cleanVal(valStr);
        if (Array.isArray(current)) {
          const last = current[current.length - 1];
          if (typeof last === 'object') last[key] = cleaned;
        } else if (typeof current === 'object') {
          current[key] = cleaned;
        }
      }
    }
  }

  return root;
}

function cleanVal(val) {
  val = val.trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null' || val === '~') return null;
  if (!isNaN(Number(val)) && val !== '') return Number(val);
  return val;
}

function auditBundleContent(rawText, filePath) {
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

  // 1. Check Screen Access (screenAccess)
  const hasScreenAccess = rawText.includes('screenAccess:');
  const hasAccessType = rawText.includes('accessType:');
  if (!hasScreenAccess || !hasAccessType) {
    addGap(
      'MISSING_SCREEN_ACCESS',
      'critical',
      'userStories.contextAndHandoff.screenAccess',
      'Thiếu cấu hình cách thức truy cập màn hình (screenAccess).',
      'Cần bổ sung accessType (directRoute | sidebarMenu | contextualAction) và mô tả chi tiết router/menu/action.'
    );
  } else {
    if (rawText.includes('accessType: directRoute') && !rawText.includes('routePath:')) {
      addGap(
        'INCOMPLETE_DIRECT_ROUTE',
        'critical',
        'userStories.contextAndHandoff.screenAccess.directRoute',
        'Loại truy cập directRoute yêu cầu đường dẫn routePath.',
        'Khai báo routePath (ví dụ: "/auth/login").'
      );
    }
    if (rawText.includes('accessType: sidebarMenu') && (!rawText.includes('menuLabel:') || !rawText.includes('menuHierarchy:'))) {
      addGap(
        'INCOMPLETE_SIDEBAR_MENU',
        'critical',
        'userStories.contextAndHandoff.screenAccess.sidebarMenu',
        'Loại truy cập sidebarMenu yêu cầu menuHierarchy và menuLabel.',
        'Khai báo menuHierarchy (danh sách menu cha) và menuLabel (text hiển thị menu).'
      );
    }
    if (rawText.includes('accessType: contextualAction') && (!rawText.includes('triggerControl:') || !rawText.includes('sourceScreen:'))) {
      addGap(
        'INCOMPLETE_CONTEXTUAL_ACTION',
        'critical',
        'userStories.contextAndHandoff.screenAccess.contextualAction',
        'Loại truy cập contextualAction yêu cầu sourceScreen và triggerControl.',
        'Khai báo sourceScreen và control kích hoạt (nút bấm/link).'
      );
    }
  }

  // 2. Check UI Sections & Primitives
  if (!rawText.includes('sections:')) {
    addGap(
      'EMPTY_UI_SECTIONS',
      'warning',
      'design.sections',
      'Cây layout UI (sections) chưa được định nghĩa.',
      'Bổ sung danh sách các khối UI (sections[]) với đầy đủ kind, meaning, purpose, primitive, và visual.'
    );
  } else {
    if (!rawText.includes('meaning:') || !rawText.includes('purpose:')) {
      addGap(
        'MISSING_MEANING_PURPOSE',
        'warning',
        'design.sections',
        'Có node UI thiếu phân tách meaning (ý nghĩa nghiệp vụ) hoặc purpose (mục đích thao tác).',
        'Khai báo riêng biệt meaning và purpose cho từng node.'
      );
    }
    if (!rawText.includes('primitive:') && !rawText.includes('#ui:')) {
      addGap(
        'MISSING_UI_PRIMITIVE_STYLING',
        'info',
        'design.sections',
        'Các khối UI chưa gắn tag primitive (#ui: Card, #ui: Form...) hoặc visual.className.',
        'Khai báo primitive (ví dụ: "#ui: Input") và visual.className để render đúng UI Shadcn.'
      );
    }
  }

  // 3. Check Actions
  if (rawText.includes('actions:') && (!rawText.includes('onSuccess:') || !rawText.includes('onSpecificError:'))) {
    addGap(
      'INCOMPLETE_ACTION_HANDLERS',
      'warning',
      'design.actions',
      'Các hành động trong actions[] chưa được khai báo đầy đủ onSuccess hoặc error handlers.',
      'Khai báo onSuccess (toast/navigation/backgroundTrigger) và onSpecificError cho từng action.'
    );
  }

  // 4. Check Codegen Profile
  const profileMatch = rawText.match(/profile:\s*["']?([^"'\r\n]*)["']?/);
  if (!profileMatch || !profileMatch[1] || profileMatch[1].trim() === '') {
    addGap(
      'MISSING_CODEGEN_PROFILE',
      'critical',
      'gen.codegen.profile',
      'Chưa cấu hình codegen.profile trong khối gen.',
      'Khai báo codegen.profile (ví dụ: "admin-crud", "list", "create", "auth").'
    );
  }

  return {
    file: filePath,
    totalGaps: gaps.length,
    criticalGaps: gaps.filter(g => g.severity === 'critical').length,
    warningGaps: gaps.filter(g => g.severity === 'warning').length,
    infoGaps: gaps.filter(g => g.severity === 'info').length,
    gaps
  };
}

// CLI Execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node engines/spec/lib/audit-bundle-gaps.mjs <path-to-bundle.yaml>');
  process.exit(0);
}

const targetFile = path.resolve(process.cwd(), args[0]);
if (!fs.existsSync(targetFile)) {
  console.error(JSON.stringify({ error: `File not found: ${targetFile}` }));
  process.exit(1);
}

const rawText = fs.readFileSync(targetFile, 'utf8');
const report = auditBundleContent(rawText, targetFile);
console.log(JSON.stringify(report, null, 2));
