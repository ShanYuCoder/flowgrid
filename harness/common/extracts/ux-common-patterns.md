# UX gap checklists (extract only — policy in `flowgrid-ux-common.mdc`)

## 1. Flat design (shadcn admin)

**Recognize:** Flat portal chrome — borders, muted surfaces, clear typography.

**Propose when missing or off-pattern:**

- [ ] No heavy gradients/shadows on buttons, cards, table chrome.
- [ ] One clear primary per section; destructive only for dangerous actions.
- [ ] No stacked modals — prefer page, step, or inline over dialog stacks.
- [ ] Semantic colors; inline state near context instead of alert dialogs for read-only hints.

---

## 2. List page & toolbar

**Recognize:** Title + primary (create) + secondary; bulk/export on list.

**Propose when missing:**

- [ ] List shell: title + main action; bulk actions on toolbar, not scattered per row.
- [ ] One primary intent; outline/ghost for secondary.

---

## 3. Breadcrumb

**Recognize:** `A > B > C`, or list → detail/edit hierarchy even if not labeled “breadcrumb”.

**Propose when missing:**

- [ ] Trail or back + title reflecting module/record.
- [ ] Multiple entry paths (deep links) — vague Back alone is insufficient.
- [ ] Breadcrumb shell slot unwired → `#needs-ui:breadcrumb` or registry update.

---

## 4. Search & filter

**Recognize:** Search box, filter dropdowns, active filter chips, reset.

**Propose when missing or unmapped:**

- [ ] Large lists or server pagination → search and/or filters (name fields).
- [ ] State: URL query **or** store — state choice in proposal.
- [ ] “No results” empty state distinct from empty list.
- [ ] If `#split-hook: filters` exists in design → use DSL; no duplicate filter YAML.

---

## 5. Pagination

**Recognize:** Prev/next, page numbers, server total count.

**Propose when missing:**

- [ ] Standard paginator (no infinite scroll unless member explicitly chose it).
- [ ] Stay in sync with search/filter when present.

---

## 6. Data table

**Recognize:** Column grid, sort, selection, action column — often covered by list shell DSL.

**Propose when under-specified:**

- [ ] Horizontal scroll; compact density; muted header.
- [ ] Status column → chip; action column → fixed width, nowrap; numbers → right-align.
- [ ] Long text: truncate + tooltip (default).

---

## 7. Table action column & disabled affordance

**Recognize:** Per-row icons/buttons; disabled by status, RBAC, or business rules.

**Propose when missing (common gap):**

- [ ] Row actions **icon-only** in table; outside table use icon + text when discoverability matters.
- [ ] Non-obvious disabled → **badge/chip/tooltip** with reason (“Locked”, “No permission”, …).
- [ ] Document `disabledReason` / preconditions in handoff.

---

## 8. Buttons

**Recognize:** Primary/destructive/outline on forms, dialogs, toolbars.

**Propose when missing:**

- [ ] Submit/delete: `disabledReason` when blocked — not bare `disabled`.
- [ ] Confirm dialogs: correct primary/secondary/destructive roles.

---

## 9. Status chip (lifecycle)

**Recognize:** Status column, detail tags, post-job badges.

**Propose when missing:**

- [ ] Text label + semantic color; consistent tone map (pending/warning, failed/danger, …).
- [ ] No plain text for states that need quick scanning.

---

## 10. Confirm dialog (non-delete)

**Recognize:** Destructive actions, overwrite, cancel with side effects.

**Propose when missing:**

- [ ] Centered modal; never use confirm for form validation (use inline field errors).

---

## 11. Delete flow

**Recognize:** Row delete, bulk delete, soft-delete with confirm.

**Propose when DSL/handler missing or under-specified:**

- [ ] Blocking **confirm** (AlertDialog) before delete — clear cancel/confirm.
- [ ] After API: **result dialog** for success/error — user must acknowledge; **no** toast-only delete.
- [ ] Bulk: copy includes **count**; batch/endpoint explicit.
- [ ] API not ready → `#wire-only` / handoff — no fake success UI.

---

## 12. Feedback (inline / toast / dialog)

**Recognize:** After save, delete, import, async jobs.

**Propose when missing:**

- [ ] Inline alert under title when still visible on light scroll.
- [ ] Toast ~5s for non-blocking notices — **does not** replace delete result dialog.
- [ ] One primary channel per action (inline OR dialog OR toast).

---

## 13. Form validation

**Recognize:** Create/edit, wizards, modal forms.

**Propose when missing:**

- [ ] Field-level inline errors; block submit while invalid.
- [ ] Submit/delete preconditions in handoff.

---

## 14. Navigation (menu / sidebar)

**Recognize:** Module menu, active route, nested nav.

**Propose when missing:**

- [ ] Clear active state; no duplicate entries without routes.

---

## 15. Import CSV

**Recognize:** Upload, column mapping, preview, import result.

**Propose when missing:**

- [ ] Flow: pick file → validate → confirm → result (row errors downloadable).
- [ ] No silent failure; feedback per section 12.
