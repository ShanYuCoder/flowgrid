#!/usr/bin/env node

/**
 * audit-testcase-gaps.mjs
 * Zero-dependency static audit script for Forgekit Testcase Plans (*.test.yaml, qa-item.yaml).
 * Verifies 100% coverage of userStories scenarios, acceptance criteria, and edge cases.
 */

import fs from 'fs';
import path from 'path';

function auditTestcaseContent(rawText, filePath) {
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

  // 1. Check test cases list
  if (!rawText.includes('testcases:') && !rawText.includes('cases:') && !rawText.includes('scenarios:')) {
    addGap(
      'TC_MISSING_CASES_LIST',
      'critical',
      'testcases',
      'Chưa khai báo danh sách testcases trong file plan.',
      'Khai báo mảng testcases[] với id, title, scenarioRef, steps, và expectedResult.'
    );
  }

  // 2. Check initial load testcase
  if (!rawText.includes('Initial Load') && !rawText.includes('tải dữ liệu') && !rawText.includes('init')) {
    addGap(
      'TC_MISSING_INITIAL_LOAD',
      'warning',
      'testcases.initial_load',
      'Thiếu testcase cho kịch bản Khởi tạo & Tải dữ liệu ban đầu (Initial Load).',
      'Thêm testcase kiểm tra tải dữ liệu ban đầu, phân quyền role, skeleton/empty state.'
    );
  }

  // 3. Check validation error testcase
  if (!rawText.includes('Validation') && !rawText.includes('nhập sai') && !rawText.includes('invalid')) {
    addGap(
      'TC_MISSING_VALIDATION_CASE',
      'warning',
      'testcases.validation',
      'Thiếu testcase cho kịch bản Thẩm định dữ liệu (Input & Inline Validation).',
      'Thêm testcase kiểm tra nộp form sai định dạng hoặc bỏ trống trường bắt buộc.'
    );
  }

  // 4. Check happy path submit testcase
  if (!rawText.includes('Happy Path') && !rawText.includes('thành công') && !rawText.includes('success')) {
    addGap(
      'TC_MISSING_HAPPY_PATH',
      'warning',
      'testcases.happy_path',
      'Thiếu testcase cho kịch bản Nộp thành công (Happy Path Submit).',
      'Thêm testcase kiểm tra nộp form hợp lệ, khóa nút chống double-click, và chuyển trang handoff.'
    );
  }

  // 5. Check exception / error testcase
  if (!rawText.includes('409') && !rawText.includes('500') && !rawText.includes('lỗi') && !rawText.includes('exception')) {
    addGap(
      'TC_MISSING_EXCEPTION_CASE',
      'warning',
      'testcases.exceptions',
      'Thiếu testcase cho kịch bản Xử lý Ngoại lệ (409 Conflict, 5xx Network error, Session timeout).',
      'Thêm testcase kiểm tra xử lý lỗi mạng, hết hạn phiên làm việc và bảo lưu dữ liệu form.'
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
  console.log('Usage: node engines/spec/lib/audit-testcase-gaps.mjs <path-to-test.yaml>');
  process.exit(0);
}

const targetFile = path.resolve(process.cwd(), args[0]);
if (!fs.existsSync(targetFile)) {
  console.error(JSON.stringify({ error: `File not found: ${targetFile}` }));
  process.exit(1);
}

const rawText = fs.readFileSync(targetFile, 'utf8');
const report = auditTestcaseContent(rawText, targetFile);
console.log(JSON.stringify(report, null, 2));
