/**
 * UX affordance gap checks (deterministic), aligned with flowgrid-ux-common / ux-common-patterns.
 * Merged into `audit spec` as gaps[] / confirms[] (codes UX_* / CONFIRM_UX_*).
 */

function has(text, keyword) {
  return text.includes(keyword);
}

function hasAny(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

function isListType(type) {
  return type === 'list' || type === 'admin-crud';
}

function isDetailType(type) {
  return type === 'detail';
}

function isAuthType(type) {
  return type === 'auth' || type === 'change-password';
}

function hasDeleteIntent(rawText) {
  if (has(rawText, '#pattern: delete-flow') || has(rawText, 'delete-flow')) {
    return hasAny(rawText, ['btn_delete', 'bulkDelete', 'Delete', 'delete']);
  }
  return hasAny(rawText, [
    'btn_delete',
    'bulkDelete',
    'bulk_delete',
    'Batch Delete',
    'kind: delete',
    'action: delete',
    'label: Delete',
    'Delete Selected',
    'rowActions:',
  ]) && hasAny(rawText, ['delete', 'Delete']);
}

function deleteFlowDocumented(rawText) {
  return hasAny(rawText, [
    '#pattern: delete-flow',
    'delete-flow',
    'common-delete-flow',
    'confirmDialog',
    'confirmDialog:',
    'confirmation:',
    'AlertDialog',
    'confirm-dialog',
  ]);
}

function deleteResultDocumented(rawText) {
  return hasAny(rawText, [
    'resultDialog',
    'result-dialog',
    'successDialog',
    'errorDialog',
    'acknowledge',
    'result dialog',
  ]);
}

/**
 * @param {string} rawText
 * @param {string} pageType
 * @returns {{ gaps: object[], confirms: object[] }}
 */
export function auditUxAffordance(rawText, pageType) {
  const gaps = [];
  const confirms = [];

  function addGap(code, severity, fieldPath, message, suggestedFix, suggestedStoryPatch) {
    gaps.push({
      code,
      severity,
      type: 'gap',
      category: 'ux',
      path: fieldPath,
      message,
      suggestedFix,
      ...(suggestedStoryPatch ? { suggestedStoryPatch } : {}),
    });
  }

  function addConfirm(code, fieldPath, question, options, defaultRecommend, suggestedStoryPatch) {
    confirms.push({
      code,
      type: 'confirm',
      category: 'ux',
      path: fieldPath,
      question,
      options: options || [],
      defaultRecommend: defaultRecommend ?? 0,
      ...(suggestedStoryPatch ? { suggestedStoryPatch } : {}),
    });
  }

  // --- Delete flow (§11 ux-common-patterns) ---
  if (hasDeleteIntent(rawText)) {
    if (!deleteFlowDocumented(rawText)) {
      addGap(
        'UX_GAP_DELETE_CONFIRM',
        'warning',
        'design.actions[].interactionControl.confirmDialog',
        'Delete action present but no blocking confirm (AlertDialog / delete-flow pattern).',
        'Add #pattern: delete-flow and confirmDialog on delete/bulk-delete actions (flowgrid-ux-common).',
        {
          scenario: 'Affordances UX chuẩn portal (UX — khi áp dụng)',
          step:
            'Trước khi xóa, hệ thống hiển thị hộp thoại xác nhận chặn; người dùng chọn Hủy hoặc Xóa rõ ràng.',
          acceptance:
            '[ ] Xóa bản ghi yêu cầu xác nhận trước khi gọi API.',
        },
      );
    }
    const toastOnlyDelete =
      hasAny(rawText, ['toast', 'Toast']) &&
      !deleteResultDocumented(rawText) &&
      !hasAny(rawText, ['dialog', 'Dialog', 'modal', 'Modal']);
    if (toastOnlyDelete && hasDeleteIntent(rawText)) {
      addGap(
        'UX_GAP_DELETE_RESULT_DIALOG',
        'warning',
        'design.actions[].outcomes.onSuccess',
        'Delete flow appears toast-only; UX rule requires acknowledge result dialog after delete API.',
        'Declare result dialog on success/error for delete — not toast-only (ux-common-patterns §11).',
        {
          scenario: 'Affordances UX chuẩn portal (UX — khi áp dụng)',
          step:
            'Sau API xóa, hộp thoại kết quả (thành công hoặc lỗi) bắt người dùng bấm Đóng/Xác nhận — không chỉ toast.',
          acceptance: '[ ] Sau delete, phản hồi qua result dialog, không toast-only.',
        },
      );
    } else if (!deleteResultDocumented(rawText) && has(rawText, 'outcomes:')) {
      addConfirm(
        'CONFIRM_UX_DELETE_RESULT',
        'design.actions[].outcomes',
        'After delete API, how should success/error be shown?',
        [
          '(Recommended) Blocking result dialog — user must acknowledge',
          'Inline alert under page title',
          'Toast only (requires explicit member override / tech debt)',
        ],
        0,
      );
    }
  }

  // --- Disabled affordance (§7) ---
  if (
    (has(rawText, 'preconditions:') || has(rawText, 'disabledWhen') || has(rawText, 'disabled:')) &&
    !has(rawText, 'disabledReason')
  ) {
    addGap(
      'UX_GAP_DISABLED_REASON',
      'warning',
      'design.actions[].preconditions.disabledReason',
      'Disabled or conditional actions lack disabledReason (non-obvious disable needs explanation).',
      'Add disabledReason and/or badge/tooltip affordance per ux-common-patterns §7.',
      {
        scenario: 'Affordances UX chuẩn portal (UX — khi áp dụng)',
        step:
          'Khi nút/hành động bị khóa, giao diện giải thích lý do (badge, chip hoặc tooltip).',
        acceptance: '[ ] Hành động disabled có lý do hiển thị cho người dùng.',
      },
    );
  }

  // --- List DSL mapping (§2–6) ---
  if (isListType(pageType) && has(rawText, 'columns:')) {
    if (!hasAny(rawText, ['#shell:', '#pattern:', 'DataListPage', 'CRUD'])) {
      addConfirm(
        'CONFIRM_UX_LIST_DSL',
        'design.shell / design.patterns',
        'List screen has columns but no DSL shell/pattern tags — map to registry?',
        [
          '(Recommended) #shell: DataListPage + #pattern: CRUD',
          'Partial DSL — specify tags in handoff',
          'Log as Tech Debt (Pending)',
        ],
        0,
      );
    }
  }

  // --- Status chip (§9) ---
  if ((isListType(pageType) || isDetailType(pageType)) && has(rawText, 'columns:')) {
    const hasStatusCol =
      /key:\s*status\b/i.test(rawText) ||
      /title:.*\bStatus\b/i.test(rawText) ||
      has(rawText, 'status:');
    const hasChipRender = hasAny(rawText, [
      'render: chip',
      '#render: chip',
      'status-chip',
      'StatusChip',
      'badge',
      'chip',
    ]);
    if (hasStatusCol && !hasChipRender) {
      addConfirm(
        'CONFIRM_UX_STATUS_CHIP',
        'spec.ui.list.columns[].render',
        'Should status be shown as a semantic chip/badge (not plain text)?',
        [
          '(Recommended) Yes — chip with label + semantic color',
          'Plain text only',
          'Log as Tech Debt (Pending)',
        ],
        0,
      );
    }
  }

  // --- Breadcrumb drill-down (§3) — detail without trail ---
  if (isDetailType(pageType) && !isAuthType(pageType) && !has(rawText, 'breadcrumb:')) {
    addConfirm(
      'CONFIRM_UX_BREADCRUMB_DETAIL',
      'design.nav.breadcrumb',
      'Detail screen without breadcrumb — add hierarchy trail or contextual back?',
      [
        '(Recommended) Breadcrumb trail (module > record)',
        'Back button + title only',
        'No hierarchy (log tech debt if deep links exist)',
      ],
      0,
    );
  }

  // --- Search/filter when pagination implies server list (§4) ---
  if (isListType(pageType) && has(rawText, 'pagination:') && !has(rawText, 'filters:')) {
    addConfirm(
      'CONFIRM_UX_FILTER_WITH_PAGINATION',
      'spec.ui.list.filters',
      'Paginated list without filters block — add search/filter?',
      [
        '(Recommended) Keyword search + key filters',
        'Search only',
        'No filters (document rationale)',
      ],
      0,
    );
  }

  // --- Import CSV feedback (§15) ---
  if (hasAny(rawText, ['Import CSV', 'importCsv', 'import-csv', 'CSV import', 'uploadCsv'])) {
    if (!hasAny(rawText, ['importResult', 'import:', 'onSuccess', 'onBusinessErrors'])) {
      addGap(
        'UX_GAP_IMPORT_FEEDBACK',
        'warning',
        'spec.ui.import.outcomes',
        'CSV import mentioned but no import result / outcome feedback path.',
        'Declare validate → confirm → result flow with error row handling (ux-common-patterns §15).',
        {
          scenario: 'Affordances UX chuẩn portal (UX — khi áp dụng)',
          step:
            'Import: chọn file → kiểm tra → xác nhận → màn hình kết quả; lỗi theo dòng có thể tải log.',
          acceptance: '[ ] Import CSV có báo kết quả rõ, không im lặng khi lỗi.',
        },
      );
    }
  }

  return { gaps, confirms };
}
