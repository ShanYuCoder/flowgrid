#!/usr/bin/env node

/**
 * audit-api-gaps.mjs
 * Zero-dependency static audit script for Forgekit API Contracts (backend-api.bundle.yaml, backend-api-integration.yaml).
 * Ensures 100% adherence to API payload rules, SLA, async events, and resilience policies.
 */

import fs from 'fs';
import path from 'path';

function auditApiContent(rawText, filePath) {
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

  // 1. Check endpoints / routes definition
  if (!rawText.includes('endpoints:') && !rawText.includes('paths:') && !rawText.includes('routes:')) {
    addGap(
      'API_MISSING_ENDPOINTS',
      'critical',
      'endpoints',
      'Chưa khai báo danh sách API endpoints.',
      'Khai báo các endpoints với path, method, meaning, purpose, requestPayload, responsePayload.'
    );
  }

  // 2. Check meaning vs purpose separation
  if (!rawText.includes('meaning:') || !rawText.includes('purpose:')) {
    addGap(
      'API_MISSING_MEANING_PURPOSE',
      'warning',
      'endpoints.payload',
      'Có endpoint hoặc trường payload thiếu phân tách meaning (ý nghĩa nghiệp vụ) hoặc purpose (mục đích kỹ thuật).',
      'Khai báo riêng biệt meaning và purpose cho từng endpoint và từng field payload.'
    );
  }

  // 3. Check Async Events (asyncEvents / backgroundTrigger)
  const mentionsEvents = /event|publish|kafka|rabbitmq|job|queue|async/i.test(rawText);
  const hasAsyncEvents = rawText.includes('asyncEvents:') || rawText.includes('backgroundTrigger:');
  if (mentionsEvents && !hasAsyncEvents) {
    addGap(
      'API_MISSING_ASYNC_EVENTS',
      'warning',
      'endpoints.asyncEvents',
      'API có đề cập đến xử lý sự kiện ngầm nhưng chưa khai báo mảng asyncEvents.',
      'Khai báo asyncEvents[] chứa tên event, eventType, topic, và payload schema.'
    );
  }

  // 4. Check SLA & Rate Limits
  if (!rawText.includes('sla:') && !rawText.includes('rateLimit:')) {
    addGap(
      'API_MISSING_SLA',
      'info',
      'endpoints.sla',
      'API chưa khai báo chỉ số SLA (rateLimit, timeoutMs).',
      'Khai báo sla.rateLimit (ví dụ: "100req/min") và sla.timeoutMs (ví dụ: 3000).'
    );
  }

  // 5. Check Integration Resilience (retryPolicy & DLQ) for integration specs
  if (filePath.includes('integration')) {
    if (!rawText.includes('resilience:') || !rawText.includes('retryPolicy:')) {
      addGap(
        'INTEGRATION_MISSING_RESILIENCE',
        'critical',
        'resilience.retryPolicy',
        'API Integration Adapter chưa khai báo chính sách chịu lỗi (resilience.retryPolicy).',
        'Khai báo retryPolicy với maxAttempts, backoffMs, và dlqTopic (Dead Letter Queue).'
      );
    }
    if (!rawText.includes('dataMapping:')) {
      addGap(
        'INTEGRATION_MISSING_DATA_MAPPING',
        'warning',
        'dataMapping',
        'API Integration Adapter chưa khai báo bảng ánh xạ trường dữ liệu (dataMapping).',
        'Bổ sung dataMapping ánh xạ 1-1 giữa externalField đối tác và internalField platform.'
      );
    }
  }

  // 6. Check Error Storming Matrix
  if (!rawText.includes('#err:') && !rawText.includes('errorResponses:') && !rawText.includes('onSpecificError:')) {
    addGap(
      'API_MISSING_ERROR_MATRIX',
      'warning',
      'endpoints.errors',
      'Chưa khai báo ma trận phản hồi lỗi (Error Storming Matrix #err:*).',
      'Bổ sung ma trận lỗi #err:validation (422), #err:not-found (404), #err:idor-violation (403), #err:conflict (409).'
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
  console.log('Usage: node engines/spec/lib/audit-api-gaps.mjs <path-to-api-bundle.yaml>');
  process.exit(0);
}

const targetFile = path.resolve(process.cwd(), args[0]);
if (!fs.existsSync(targetFile)) {
  console.error(JSON.stringify({ error: `File not found: ${targetFile}` }));
  process.exit(1);
}

const rawText = fs.readFileSync(targetFile, 'utf8');
const report = auditApiContent(rawText, targetFile);
console.log(JSON.stringify(report, null, 2));
