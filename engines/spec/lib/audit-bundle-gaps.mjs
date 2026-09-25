#!/usr/bin/env node

/**
 * audit-bundle-gaps.mjs
 * Zero-dependency deterministic gap audit for FlowGrid feature bundle YAML.
 *
 * PURPOSE: Check QUANTITY only — does the field EXIST or not?
 *          Quality analysis (is content good? logical? consistent?) is the Agent's job.
 *
 * Usage:
 *   node engines/spec/lib/audit-bundle-gaps.mjs <path-to-bundle.yaml> --type <pageType>
 *
 * pageType: list | create | detail | admin-crud | auth | change-password | public | not-found | error
 * If --type is omitted, script auto-detects from codegen.profile or design.shell.tag.
 *
 * Output: JSON with gaps[] (missing required) + confirms[] (optional, agent must ask member).
 * UX affordance checks (flowgrid-ux-common) merge in with category "ux" and codes UX_* / CONFIRM_UX_*.
 */

import fs from 'fs';
import path from 'path';
import { auditUxAffordance } from './audit-ux-affordance.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function has(text, keyword) {
  return text.includes(keyword);
}

function hasAny(text, keywords) {
  return keywords.some(k => text.includes(k));
}

function countOccurrences(text, keyword) {
  let count = 0;
  let pos = 0;
  while ((pos = text.indexOf(keyword, pos)) !== -1) {
    count++;
    pos += keyword.length;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Page type detection (fallback when --type not provided)
// ---------------------------------------------------------------------------

const PROFILE_ALIASES = {
  'list': 'list',
  'create': 'create',
  'admin-crud': 'admin-crud',
  'detail': 'detail',
  'auth': 'auth',
  'login': 'auth',
  'change-password': 'change-password',
  'public': 'public',
  'not-found': 'public',
  'error': 'public',
};

function detectPageType(rawText) {
  // 1. From codegen.profile
  const profileMatch = rawText.match(/profile:\s*["']?([\w-]+)["']?/);
  if (profileMatch) {
    const p = profileMatch[1].toLowerCase();
    if (PROFILE_ALIASES[p]) return PROFILE_ALIASES[p];
  }

  // 2. From design.shell.tag
  if (has(rawText, 'DataListPage')) return 'list';
  if (has(rawText, 'AuthPage')) return 'auth';

  // 3. From structural cues
  if (has(rawText, 'ui.list') || has(rawText, 'list:')) return 'list';
  if (has(rawText, 'ui.form') || has(rawText, 'form:')) return 'create';
  if (has(rawText, 'ui.detail') || has(rawText, 'detail:')) return 'detail';

  return 'unknown';
}

// ---------------------------------------------------------------------------
// Helpers for page type groups
// ---------------------------------------------------------------------------

function isListType(type) {
  return type === 'list' || type === 'admin-crud';
}

function isFormType(type) {
  return type === 'create' || type === 'admin-crud';
}

function isDetailType(type) {
  return type === 'detail';
}

function isAuthType(type) {
  return type === 'auth' || type === 'change-password';
}

function hasMutationActions(rawText) {
  return hasAny(rawText, ['actions:', 'btn_save', 'btn_submit', 'btn_create', 'btn_update', 'btn_delete', 'btn_approve']);
}

// ---------------------------------------------------------------------------
// Core audit
// ---------------------------------------------------------------------------

function auditBundleContent(rawText, filePath, pageType) {
  const gaps = [];
  const confirms = [];

  function addGap(code, severity, fieldPath, message, suggestedFix) {
    gaps.push({ code, severity, type: 'gap', path: fieldPath, message, suggestedFix });
  }

  function addConfirm(code, fieldPath, question, options, defaultRecommend) {
    confirms.push({
      code,
      type: 'confirm',
      path: fieldPath,
      question,
      options: options || [],
      defaultRecommend: defaultRecommend ?? 0
    });
  }

  // =========================================================================
  // ALL PAGES — Required fields
  // =========================================================================

  // Title
  if (!has(rawText, 'title:')) {
    addGap('MISSING_PAGE_TITLE', 'critical', 'title',
      'Missing screen page title (title).',
      'Declare title describing screen functionality.');
  }

  // Page ID
  if (!has(rawText, 'page-id:')) {
    addGap('MISSING_PAGE_ID', 'critical', 'page-id',
      'Missing screen identifier (page-id).',
      'Declare page-id following W-* naming convention.');
  }

  // Summary
  if (!has(rawText, 'summary:')) {
    addGap('MISSING_SUMMARY', 'critical', 'summary',
      'Missing page overview summary (summary).',
      'Declare summary covering business goals, stakeholders, user journey, and context.');
  }

  // Screen Access
  if (!has(rawText, 'screenAccess:') || !has(rawText, 'accessType:')) {
    addGap('MISSING_SCREEN_ACCESS', 'critical', 'userStories.contextAndHandoff.screenAccess',
      'Missing screen access configuration (screenAccess).',
      'Declare accessType (directRoute | sidebarMenu | contextualAction).');
  } else {
    // Sub-checks per access type
    if (has(rawText, 'accessType: directRoute') && !has(rawText, 'routePath:')) {
      addGap('INCOMPLETE_DIRECT_ROUTE', 'critical', 'screenAccess.directRoute',
        'directRoute accessType requires routePath parameter.',
        'Declare routePath (e.g., "/auth/login").');
    }
    if (has(rawText, 'accessType: sidebarMenu') && (!has(rawText, 'menuLabel:') || !has(rawText, 'menuHierarchy:'))) {
      addGap('INCOMPLETE_SIDEBAR_MENU', 'critical', 'screenAccess.sidebarMenu',
        'sidebarMenu accessType requires menuHierarchy and menuLabel.',
        'Declare menuHierarchy (parent menu) and menuLabel (display text).');
    }
    if (has(rawText, 'accessType: contextualAction') && (!has(rawText, 'triggerControl:') || !has(rawText, 'sourceScreen:'))) {
      addGap('INCOMPLETE_CONTEXTUAL_ACTION', 'critical', 'screenAccess.contextualAction',
        'contextualAction accessType requires sourceScreen and triggerControl.',
        'Declare sourceScreen code and triggering control ID.');
    }
  }

  // User Stories scenarios
  if (!has(rawText, 'scenarios:')) {
    addGap('MISSING_SCENARIOS', 'critical', 'userStories.scenarios',
      'Missing user story scenarios array (scenarios).',
      'Declare >=5 scenarios: Initial Load, Input & Validation, Happy Path, Exceptions, Background.');
  }

  // Acceptance criteria
  if (!has(rawText, 'acceptanceCriteria:')) {
    addGap('MISSING_ACCEPTANCE', 'warning', 'userStories.acceptanceCriteria',
      'Missing acceptance criteria (acceptanceCriteria).',
      'Declare acceptanceCriteria list.');
  }

  // Codegen profile
  const profileMatch = rawText.match(/profile:\s*["']?([\w-]*)["']?/);
  if (!profileMatch || !profileMatch[1] || profileMatch[1].trim() === '') {
    addGap('MISSING_CODEGEN_PROFILE', 'critical', 'gen.codegen.profile',
      'Missing codegen.profile configuration.',
      'Declare profile: "list" | "create" | "admin-crud" | "detail" | "auth" | ...');
  }

  // Shell tag
  if (!has(rawText, 'shell:') || !hasAny(rawText, ['#shell:', 'tag:'])) {
    addGap('MISSING_SHELL_TAG', 'warning', 'design.shell.tag',
      'Missing shell layout tag declaration.',
      'Declare design.shell.tag (e.g., "#shell: DataListPage" | "#shell: AuthPage").');
  }

  // UI Sections
  if (!has(rawText, 'sections:')) {
    addGap('MISSING_SECTIONS', 'warning', 'design.sections',
      'UI layout tree (sections) is not defined.',
      'Add sections[] array with kind, meaning, purpose, primitive, and visual properties.');
  } else {
    if (!has(rawText, 'meaning:') || !has(rawText, 'purpose:')) {
      addGap('MISSING_MEANING_PURPOSE', 'warning', 'design.sections',
        'One or more section/item nodes missing meaning or purpose.',
        'Declare meaning (business intent) and purpose (interaction goal) for every node.');
    }
  }

  // Breadcrumb — confirm (optional)
  if (!has(rawText, 'breadcrumb:') && !isAuthType(pageType)) {
    addConfirm('CONFIRM_BREADCRUMB', 'design.nav.breadcrumb',
      'Does this screen feature breadcrumb navigation?',
      ['Yes — declare breadcrumb items', 'No breadcrumb required'],
      0);
  }

  // Handoff navigation
  if (!has(rawText, 'nextScreenOnSuccess:')) {
    addGap('MISSING_HANDOFF_SUCCESS', 'warning', 'contextAndHandoff.nextScreenOnSuccess',
      'Missing target screen transition upon successful action completion.',
      'Declare nextScreenOnSuccess (target W-* ID).');
  }

  // =========================================================================
  // LIST PAGE — Specific rules
  // =========================================================================

  if (isListType(pageType)) {
    // Columns
    if (!has(rawText, 'columns:')) {
      addGap('MISSING_LIST_COLUMNS', 'critical', 'spec.ui.list.columns',
        'Data table columns list is undefined.',
        'Declare columns[] array with key, title, meaning, purpose, and widget.');
    }

    // Search / Filters — confirm
    if (!has(rawText, 'filters:')) {
      addConfirm('CONFIRM_LIST_SEARCH', 'spec.ui.list.filters',
        'Does this list screen include search or filtering controls?',
        ['Yes — single keyword search', 'Yes — multi-field filter bar', 'No search or filters'],
        0);
    }

    // Sort — confirm
    if (!has(rawText, 'sortable:')) {
      addConfirm('CONFIRM_LIST_SORT', 'spec.ui.list.columns[].sortable',
        'Which columns are sortable in the table?',
        ['All columns sortable', 'Select columns only', 'No column sorting'],
        1);
    }

    // Pagination — confirm
    if (!has(rawText, 'pagination:')) {
      addConfirm('CONFIRM_LIST_PAGINATION', 'spec.ui.list.pagination',
        'Does the table feature pagination, and what page size options?',
        ['Yes — standard 20/50/100', 'Yes — custom page sizes', 'No pagination (load all)'],
        0);
    }

    // Row actions — confirm
    if (!has(rawText, 'rowActions:')) {
      addConfirm('CONFIRM_LIST_ROW_ACTIONS', 'spec.ui.list.rowActions',
        'What row-level actions are available per data item?',
        ['Edit + Delete + View', 'Edit + Delete', 'View only (readonly)', 'No row actions'],
        0);
    }

    // Bulk actions — confirm
    if (!has(rawText, 'bulkActions:')) {
      addConfirm('CONFIRM_LIST_BULK_ACTIONS', 'spec.ui.list.bulkActions',
        'Does the table support multi-row selection for batch processing?',
        ['Yes — Batch Delete selected', 'Yes — Batch Export selected', 'Yes — both', 'No bulk actions'],
        3);
    }

    // Empty state
    if (!has(rawText, 'emptyState:')) {
      addGap('MISSING_EMPTY_STATE', 'warning', 'spec.ui.list.emptyState',
        'Missing empty state declaration when no records are returned.',
        'Declare emptyState: title + message for empty data table.');
    }

    // Export — confirm
    if (!hasAny(rawText, ['export', 'Export'])) {
      addConfirm('CONFIRM_LIST_EXPORT', 'spec.ui.list.export',
        'Is there a data Export button (CSV/Excel)?',
        ['Yes — Export CSV', 'Yes — Export Excel', 'Yes — both', 'No export button'],
        3);
    }
  }

  // =========================================================================
  // FORM / CREATE PAGE — Specific rules
  // =========================================================================

  if (isFormType(pageType)) {
    // Form fields
    if (!has(rawText, 'fields:')) {
      addGap('MISSING_FORM_FIELDS', 'critical', 'spec.ui.form.fields',
        'Form input fields list is undefined.',
        'Declare fields[] array with key, label, type, widget, meaning, purpose, and validation.');
    }

    // Validation existence
    if (has(rawText, 'fields:') && !has(rawText, 'validation:')) {
      addGap('MISSING_VALIDATION', 'critical', 'spec.ui.form.fields[].validation',
        'Form input fields lack validation rules.',
        'Declare 5-tier validation: prototype, boundaries, regex, conditional, and remoteCheck.');
    }

    // Validation messages
    if (has(rawText, 'validation:') && !has(rawText, 'message:')) {
      addGap('MISSING_VALIDATION_MESSAGES', 'warning', 'spec.ui.form.fields[].validation.rules[].message',
        'Validation rules missing user-facing error messages.',
        'Each validation rule must specify a clear error message.');
    }

    // Submit button
    if (!has(rawText, 'submit:')) {
      addGap('MISSING_SUBMIT', 'warning', 'spec.ui.form.submit',
        'Missing form submit button configuration.',
        'Declare submit: { label: "Save Record" }.');
    }

    // Form layout — confirm
    if (!hasAny(rawText, ['single-column', 'two-column', 'layoutMode'])) {
      addConfirm('CONFIRM_FORM_LAYOUT', 'spec.ui.form.layout.mode',
        'Should the form render as 1 column or 2 columns?',
        ['1 column (single-column)', '2 columns (two-column)', 'Custom grid layout'],
        0);
    }

    // Remote check — confirm
    if (!has(rawText, 'remoteCheck:')) {
      addConfirm('CONFIRM_REMOTE_CHECK', 'spec.ui.form.fields[].validation.remoteCheck',
        'Do any fields require asynchronous DB uniqueness check?',
        ['Yes — specify field names', 'No fields require async uniqueness check'],
        1);
    }

    // Cross-field dependency — confirm
    if (!hasAny(rawText, ['conditionalRules:', 'visibleWhen:', 'requiredWhen:'])) {
      addConfirm('CONFIRM_CROSS_FIELD', 'spec.ui.form.fields[].states',
        'Are there cross-field dependencies (visible/required based on another field)?',
        ['Yes — specify dependencies', 'No cross-field dependencies'],
        1);
    }

    // Form empty state
    if (!has(rawText, 'emptyState:')) {
      addGap('MISSING_FORM_EMPTY_STATE', 'info', 'spec.ui.form.emptyState',
        'Missing form empty state declaration.',
        'Declare emptyState title + message when form is unconfigured.');
    }
  }

  // =========================================================================
  // DETAIL PAGE — Specific rules
  // =========================================================================

  if (isDetailType(pageType)) {
    // Detail sections
    if (!has(rawText, 'detail:') || countOccurrences(rawText, 'sections:') < 2) {
      addGap('MISSING_DETAIL_SECTIONS', 'critical', 'spec.ui.detail.sections',
        'Detail view sections (detail.sections) are undefined.',
        'Declare sections[] for detail page covering attributes and relationships.');
    }

    // Badges — confirm
    if (!hasAny(rawText, ['badges:', 'badge', 'chip'])) {
      addConfirm('CONFIRM_DETAIL_BADGES', 'spec.ui.detail.header.badges',
        'Does the detail page header include status badges/chips?',
        ['Yes — single status badge', 'Yes — multiple status badges', 'No badges'],
        0);
    }

    // Detail actions — confirm
    if (!has(rawText, 'actions:')) {
      addConfirm('CONFIRM_DETAIL_ACTIONS', 'spec.ui.detail.actions',
        'What action buttons are present on the detail page?',
        ['Edit + Delete', 'Edit + Print + Export', 'Approve/Reject', 'View only (readonly)'],
        0);
    }

    // Tabs — confirm
    if (!hasAny(rawText, ['tab', 'Tab', 'Tabs'])) {
      addConfirm('CONFIRM_DETAIL_TABS', 'spec.ui.detail.tabs',
        'Does the detail view partition content into tabs (info / audit history / notes)?',
        ['Yes — multiple tabs', 'No — display all content on single page'],
        1);
    }

    // Detail empty state
    if (!has(rawText, 'emptyState:')) {
      addGap('MISSING_DETAIL_EMPTY_STATE', 'info', 'spec.ui.detail.emptyState',
        'Missing emptyState declaration for detail page.',
        'Declare emptyState title + message when record is not found.');
    }
  }

  // =========================================================================
  // AUTH PAGE — Specific rules
  // =========================================================================

  if (isAuthType(pageType)) {
    // Redirect after auth
    if (!has(rawText, 'nextScreenOnSuccess:')) {
      addGap('MISSING_AUTH_REDIRECT', 'critical', 'contextAndHandoff.nextScreenOnSuccess',
        'Missing target screen redirect upon successful authentication.',
        'Declare nextScreenOnSuccess (dashboard or home page W-* ID).');
    }

    // Remember me — confirm
    addConfirm('CONFIRM_REMEMBER_ME', 'auth.rememberMe',
      'Should the login form include a "Remember me" checkbox?',
      ['Yes', 'No'],
      0);

    // Forgot password — confirm
    if (pageType === 'auth') {
      addConfirm('CONFIRM_FORGOT_PASSWORD', 'auth.forgotPassword',
        'Should the login form include a "Forgot password" link?',
        ['Yes — link to reset password page', 'No'],
        0);

      // Social login — confirm
      addConfirm('CONFIRM_SOCIAL_LOGIN', 'auth.socialLogin',
        'Does authentication support external identity providers (Google/Facebook/SSO)?',
        ['Yes — Google', 'Yes — SSO/LDAP', 'Yes — multiple providers', 'No'],
        3);
    }
  }

  // =========================================================================
  // MUTATION ACTIONS — Any page with submit/action buttons
  // =========================================================================

  if (hasMutationActions(rawText)) {
    // State Matrix
    if (!has(rawText, 'stateMatrix:')) {
      addGap('MISSING_STATE_MATRIX', 'critical', 'design.stateMatrix',
        'Missing UI state & permission matrix (stateMatrix).',
        'Declare stateMatrix: recordStatuses, behaviors (status -> fieldsState -> visibleButtons -> rbacOverrides).');
    } else if (!has(rawText, 'rbacOverrides:')) {
      addGap('MISSING_RBAC_OVERRIDES', 'warning', 'design.stateMatrix.behaviors[].rbacOverrides',
        'stateMatrix missing role-based rbacOverrides.',
        'Add rbacOverrides for roles requiring elevated/restricted permissions.');
    }

    // Actions exist
    if (!has(rawText, 'actions:')) {
      addGap('MISSING_ACTIONS', 'critical', 'design.actions',
        'Missing actions array declaration.',
        'Declare actions[] with id, label, kind, variant, meaning, and purpose.');
    }

    // Action preconditions
    if (has(rawText, 'actions:') && !has(rawText, 'preconditions:')) {
      addGap('MISSING_ACTION_PRECONDITIONS', 'warning', 'design.actions[].preconditions',
        'Actions missing execution preconditions (preconditions).',
        'Declare preconditions: uiState, recordState, requiredPermissions, and disabledReason.');
    }

    // Double submit lock
    if (has(rawText, 'actions:') && !has(rawText, 'preventDoubleSubmit:')) {
      addGap('MISSING_DOUBLE_SUBMIT', 'warning', 'design.actions[].interactionControl',
        'Actions missing double-submit prevention mechanism (preventDoubleSubmit).',
        'Declare interactionControl.preventDoubleSubmit: true, debounceMs, and loadingIndicator.');
    }

    // Outcomes matrix
    if (has(rawText, 'actions:') && !has(rawText, 'outcomes:')) {
      addGap('MISSING_OUTCOMES', 'critical', 'design.actions[].outcomes',
        'Actions missing execution outcome matrix (outcomes).',
        'Declare outcomes 4-tier: onSuccess, onBusinessErrors (422/409), onSecurityErrors (401/403), and onSystemErrors (500/504/offline).');
    } else if (has(rawText, 'outcomes:')) {
      // Check 4-tier completeness
      if (!has(rawText, 'onSuccess:')) {
        addGap('MISSING_OUTCOME_SUCCESS', 'critical', 'outcomes.onSuccess',
          'Missing onSuccess outcome handler (toast, navigation, backgroundTrigger).',
          'Declare onSuccess: toast message, navigation target, background event.');
      }
      if (!hasAny(rawText, ['onBusinessErrors:', '422', '409'])) {
        addGap('MISSING_OUTCOME_BUSINESS', 'warning', 'outcomes.onBusinessErrors',
          'Missing onBusinessErrors outcome handler (422 Validation, 409 Conflict).',
          'Declare onBusinessErrors: 422 field mapping, 409 duplicate warning.');
      }
      if (!hasAny(rawText, ['onSecurityErrors:', '401', '403'])) {
        addGap('MISSING_OUTCOME_SECURITY', 'warning', 'outcomes.onSecurityErrors',
          'Missing onSecurityErrors outcome handler (401 Session Expired, 403 Forbidden).',
          'Declare onSecurityErrors: 401 re-login + localStorage state preservation, 403 toast.');
      }
      if (!hasAny(rawText, ['onSystemErrors:', '500', '504', 'NETWORK_OFFLINE'])) {
        addGap('MISSING_OUTCOME_SYSTEM', 'warning', 'outcomes.onSystemErrors',
          'Missing onSystemErrors outcome handler (500/504 Timeout, Network Offline).',
          'Declare onSystemErrors: timeout resubmit lock, offline data preservation.');
      }
    }

    // Concurrency handling
    if (has(rawText, 'actions:') && !hasAny(rawText, ['concurrencyHandling:', 'optimistic_locking', 'pessimistic_locking'])) {
      addGap('MISSING_CONCURRENCY', 'warning', 'executionContract.concurrencyHandling',
        'Actions missing concurrency control strategy (concurrency).',
        'Declare concurrencyHandling: strategy (optimistic_locking), onConflictStatus (409).');
    }
  }

  // =========================================================================
  // UX affordance (flowgrid-ux-common checklists)
  // =========================================================================

  const ux = auditUxAffordance(rawText, pageType);
  for (const g of ux.gaps) gaps.push(g);
  for (const c of ux.confirms) confirms.push(c);

  const uxGaps = gaps.filter((g) => g.category === 'ux').length;
  const uxConfirms = confirms.filter((c) => c.category === 'ux').length;

  // =========================================================================
  // Result
  // =========================================================================

  return {
    file: filePath,
    detectedType: pageType,
    totalGaps: gaps.length,
    totalConfirms: confirms.length,
    uxAffordanceGaps: uxGaps,
    uxAffordanceConfirms: uxConfirms,
    criticalGaps: gaps.filter(g => g.severity === 'critical').length,
    warningGaps: gaps.filter(g => g.severity === 'warning').length,
    infoGaps: gaps.filter(g => g.severity === 'info').length,
    gaps,
    confirms
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node engines/spec/lib/audit-bundle-gaps.mjs <path-to-bundle.yaml> [--type <pageType>]');
  console.log('  pageType: list | create | detail | admin-crud | auth | change-password | public');
  process.exit(0);
}

// Parse args
let targetPath = null;
let typeArg = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--type' && args[i + 1]) {
    typeArg = args[i + 1].toLowerCase();
    i++;
  } else if (!targetPath) {
    targetPath = args[i];
  }
}

const targetFile = path.resolve(process.cwd(), targetPath);
if (!fs.existsSync(targetFile)) {
  console.error(JSON.stringify({ error: `File not found: ${targetFile}` }));
  process.exit(1);
}

const rawText = fs.readFileSync(targetFile, 'utf8');
const pageType = typeArg || detectPageType(rawText);
const report = auditBundleContent(rawText, targetFile, pageType);
console.log(JSON.stringify(report, null, 2));
