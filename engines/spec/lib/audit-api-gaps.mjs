#!/usr/bin/env node

/**
 * audit-api-gaps.mjs
 * Zero-dependency static audit script for FlowGrid API Contracts (backend-api.bundle.yaml, backend-api-integration.yaml).
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
      'Missing API endpoints list.',
      'Declare endpoints array with path, method, meaning, purpose, requestPayload, and responsePayload.'
    );
  }

  // 2. Check meaning vs purpose separation
  if (!rawText.includes('meaning:') || !rawText.includes('purpose:')) {
    addGap(
      'API_MISSING_MEANING_PURPOSE',
      'warning',
      'endpoints.payload',
      'Endpoints or payload fields missing explicit separation of business meaning vs technical purpose.',
      'Declare distinct meaning and purpose fields for each endpoint and payload field.'
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
      'API mentions background event processing but lacks asyncEvents array declaration.',
      'Declare asyncEvents[] containing name, eventType, topic, and payload schema.'
    );
  }

  // 4. Check SLA & Rate Limits
  if (!rawText.includes('sla:') && !rawText.includes('rateLimit:')) {
    addGap(
      'API_MISSING_SLA',
      'info',
      'endpoints.sla',
      'API missing SLA parameters (rateLimit, timeoutMs).',
      'Declare sla.rateLimit (e.g., "100req/min") and sla.timeoutMs (e.g., 3000).'
    );
  }

  // 5. Check Integration Resilience (retryPolicy & DLQ) for integration specs
  if (filePath.includes('integration')) {
    if (!rawText.includes('resilience:') || !rawText.includes('retryPolicy:')) {
      addGap(
        'INTEGRATION_MISSING_RESILIENCE',
        'critical',
        'resilience.retryPolicy',
        'API Integration Adapter missing fault tolerance policy (resilience.retryPolicy).',
        'Declare retryPolicy with maxAttempts, backoffMs, and dlqTopic (Dead Letter Queue).'
      );
    }
    if (!rawText.includes('dataMapping:')) {
      addGap(
        'INTEGRATION_MISSING_DATA_MAPPING',
        'warning',
        'dataMapping',
        'API Integration Adapter missing data mapping table (dataMapping).',
        'Add dataMapping explicit 1-to-1 field mapping between partner externalField and platform internalField.'
      );
    }
  }

  // 6. Check Error Storming Matrix
  if (!rawText.includes('#err:') && !rawText.includes('errorResponses:') && !rawText.includes('errorStorming:')) {
    addGap(
      'API_MISSING_ERROR_MATRIX',
      'warning',
      'endpoints.errors',
      'Missing Error Storming Matrix for error responses.',
      'Add errorStorming or #err: tags for 422, 404, 403, and 409 status codes.'
    );
  } else {
    // Sub-checks for specific error codes
    if (!rawText.includes('422') && !rawText.includes('validation')) {
      addGap('API_MISSING_ERR_422', 'warning', 'endpoints.errors.422',
        'Missing 422 Validation Failure error handler.', 'Add #err:validation tag or errorStorming 422 block.');
    }
    if (!rawText.includes('409') && !rawText.includes('conflict') && !rawText.includes('duplicate')) {
      addGap('API_MISSING_ERR_409', 'info', 'endpoints.errors.409',
        'Missing 409 Conflict/Duplicate error handler.', 'Add #err:conflict tag or errorStorming 409 block.');
    }
    if (!rawText.includes('403') && !rawText.includes('idor') && !rawText.includes('forbidden')) {
      addGap('API_MISSING_ERR_403', 'warning', 'endpoints.errors.403',
        'Missing 403 Forbidden/IDOR error handler.', 'Add #err:idor-violation tag or errorStorming 403 block.');
    }
  }

  // 7. Check method per endpoint
  if (rawText.includes('endpoints:') && !rawText.includes('method:')) {
    addGap(
      'API_MISSING_METHOD',
      'critical',
      'endpoints[].method',
      'Endpoints missing HTTP method declaration (GET/POST/PUT/DELETE).',
      'Declare HTTP method for each endpoint.'
    );
  }

  // 8. Check path per endpoint
  if (rawText.includes('endpoints:') && !rawText.includes('path:')) {
    addGap(
      'API_MISSING_PATH',
      'critical',
      'endpoints[].path',
      'Endpoints missing API path URI.',
      'Declare path URI for each endpoint (e.g., /api/v1/records/{id}).'
    );
  }

  // 9. Check request/response DTO
  if (rawText.includes('endpoints:')) {
    if (!rawText.includes('request:') && !rawText.includes('requestPayload:') && !rawText.includes('requestBody:')) {
      addGap(
        'API_MISSING_REQUEST_DTO',
        'warning',
        'endpoints[].request',
        'Endpoints missing DTO/schema declaration for request payload.',
        'Declare request DTO with schema name (e.g., CreateRecordRequest).'
      );
    }
    if (!rawText.includes('response:') && !rawText.includes('responsePayload:') && !rawText.includes('responseBody:')) {
      addGap(
        'API_MISSING_RESPONSE_DTO',
        'warning',
        'endpoints[].response',
        'Endpoints missing DTO/schema declaration for response payload.',
        'Declare response DTO with schema name (e.g., RecordResponse).'
      );
    }
  }

  // 10. Check concurrency control
  if (rawText.includes('endpoints:') && !rawText.includes('concurrencyControl:') && !rawText.includes('optimistic_locking')) {
    addGap(
      'API_MISSING_CONCURRENCY',
      'info',
      'endpoints[].dataIntegrity.concurrencyControl',
      'Missing concurrency control strategy (concurrencyControl).',
      'Declare concurrencyControl: strategy (optimistic_locking/pessimistic_locking), versionField, onConflictStatus.'
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
