import { renderTable, MD_NONE } from './markdown-table.mjs'

function hasTreeContent(nodes = []) {
  if (!Array.isArray(nodes) || !nodes.length) return false
  return nodes.some(
    (n) =>
      (Array.isArray(n.items) && n.items.length) ||
      (Array.isArray(n.sections) && n.sections.length) ||
      n.kind ||
      n.visual
  )
}

function formatRecord(obj) {
  if (obj == null || obj === '') return ''
  if (typeof obj !== 'object') return String(obj)
  if (Array.isArray(obj)) return obj.map((v) => formatRecord(v)).filter(Boolean).join(', ')
  return Object.entries(obj)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}: ${formatRecord(v)}`)
    .join('; ')
}

function formatVisual(visual) {
  return formatRecord(visual)
}

function formatTags(node) {
  const tags = Array.isArray(node.tags) ? [...node.tags] : []
  if (node.extract) tags.push(`extract:${node.extract}`)
  return tags.filter(Boolean).join(', ')
}

function formatCopy(copy, item = {}) {
  if (copy && typeof copy === 'string') return copy
  if (!copy || typeof copy !== 'object') {
    const bits = [item.placeholder, item.helpText].filter(Boolean)
    return bits.length ? bits.join('; ') : ''
  }
  const bits = []
  if (copy.placeholder) bits.push(`placeholder: ${copy.placeholder}`)
  if (copy.helper) bits.push(`helper: ${copy.helper}`)
  if (copy.empty) bits.push(`empty: ${copy.empty}`)
  if (copy.toast) bits.push(`toast: ${copy.toast}`)
  if (copy.label) bits.push(`label: ${copy.label}`)
  return bits.length ? bits.join('; ') : ''
}

function formatStates(states) {
  if (!states || typeof states !== 'object') return ''
  const bits = []
  if (states.visibleWhen) bits.push(`hiện khi: ${states.visibleWhen}`)
  if (states.disabledWhen) bits.push(`khóa khi: ${states.disabledWhen}`)
  if (states.hiddenWhen) bits.push(`ẩn khi: ${states.hiddenWhen}`)
  if (states.loadingWhen) bits.push(`loading khi: ${states.loadingWhen}`)
  return bits.length ? bits.join('; ') : ''
}

function formatBind(bind) {
  if (!bind || typeof bind !== 'object') return ''
  return formatRecord(bind)
}

function formatValidation(validation, messages) {
  if (!validation) return []
  if (typeof validation !== 'object' || Array.isArray(validation)) {
    return [formatRecord(validation)]
  }
  const lines = []
  if (validation.prototype) lines.push(`Kiểu mẫu: \`${validation.prototype}\``)
  if (validation.required) lines.push(`Bắt buộc: Có${messages?.required ? ` ("${messages.required}")` : ''}`)
  if (Array.isArray(validation.rules)) {
    validation.rules.forEach(r => {
      let desc = r.type
      if (r.type === 'length') desc = `Độ dài ${r.min ?? 0}–${r.max ?? '∞'} ký tự`
      else if (r.type === 'regex') desc = `Định dạng: \`${r.pattern}\``
      else if (r.type === 'numeric_range') desc = `Giá trị trong khoảng ${r.min ?? '-∞'} đến ${r.max ?? '+∞'}`
      if (r.message) desc += ` ➔ Báo lỗi: "${r.message}"`
      lines.push(desc)
    })
  }
  if (Array.isArray(validation.conditionalRules)) {
    validation.conditionalRules.forEach(cr => {
      lines.push(`Điều kiện (${cr.when}): Bắt buộc khi thỏa điều kiện${cr.apply?.message ? ` ➔ Báo lỗi: "${cr.apply.message}"` : ''}`)
    })
  }
  if (validation.remoteCheck) {
    const rc = validation.remoteCheck
    lines.push(`Kiểm tra DB (${rc.endpoint}, trigger: ${rc.trigger || 'onBlur'})${rc.message ? ` ➔ Báo lỗi: "${rc.message}"` : ''}`)
  }
  for (const [key, val] of Object.entries(validation)) {
    if (['prototype', 'required', 'rules', 'conditionalRules', 'remoteCheck'].includes(key)) continue
    let msg = ''
    if (messages && messages[key]) {
      msg = ` ➔ Báo lỗi: "${messages[key]}"`
    }
    lines.push(`${key}: ${formatRecord(val)}${msg}`)
  }
  return lines
}

/**
 * Trích xuất tất cả các trường form từ cây sections để tạo Data Dictionary Table
 */
export function collectFormFields(nodes = []) {
  const fields = []
  function traverse(list) {
    for (const node of list || []) {
      if (node.bind?.field || node.validation || (node.kind && ['input', 'select', 'textarea', 'checkbox', 'radio', 'datepicker', 'switch'].includes(node.kind))) {
        fields.push(node)
      }
      if (Array.isArray(node.items)) traverse(node.items)
      if (Array.isArray(node.sections)) traverse(node.sections)
    }
  }
  traverse(nodes)
  return fields
}

/**
 * Bảng Từ Điển Dữ Liệu & Quy Tắc Kiểm Tra Hợp Lệ (Data Dictionary Table 6 cột)
 */
export function renderValidationDictionaryTable(sections = []) {
  const fields = collectFormFields(sections)
  if (!fields.length) return ''

  const rows = fields.map(f => {
    const label = f.label || f.name || f.id || 'Trường'
    const key = f.bind?.field || f.id || 'N/A'
    const type = f.kind || f.widget || 'string'
    const isRequired = f.validation?.required ? 'Bắt buộc' : 'Tùy chọn'
    
    const ruleParts = []
    if (f.validation?.prototype) ruleParts.push(`Kiểu: \`${f.validation.prototype}\``)
    if (Array.isArray(f.validation?.rules)) {
      f.validation.rules.forEach(r => {
        if (r.type === 'length') ruleParts.push(`Độ dài [${r.min ?? 0}, ${r.max ?? '∞'}]`)
        else if (r.type === 'regex') ruleParts.push(`Regex: \`${r.pattern}\``)
        else if (r.type === 'numeric_range') ruleParts.push(`Khoảng số: [${r.min}, ${r.max}]`)
      })
    }
    if (Array.isArray(f.validation?.conditionalRules)) {
      f.validation.conditionalRules.forEach(cr => {
        ruleParts.push(`Phụ thuộc: \`${cr.when}\``)
      })
    }
    if (f.validation?.remoteCheck) {
      ruleParts.push(`Unique DB: \`${f.validation.remoteCheck.endpoint}\``)
    }
    const rulesText = ruleParts.length ? ruleParts.join('<br>') : 'Không áp dụng'

    const msgParts = []
    if (f.messages?.required) msgParts.push(`Required: "${f.messages.required}"`)
    if (Array.isArray(f.validation?.rules)) {
      f.validation.rules.filter(r => r.message).forEach(r => msgParts.push(`"${r.message}"`))
    }
    if (f.validation?.remoteCheck?.message) {
      msgParts.push(`DB: "${f.validation.remoteCheck.message}"`)
    }
    const msgText = msgParts.length ? msgParts.join('<br>') : (f.validation?.required ? 'Thông báo mặc định của hệ thống' : 'N/A')

    return [label, `\`${key}\``, type, isRequired, rulesText, msgText]
  })

  return renderTable(
    ['Tên Trường (Label)', 'Mã Kỹ Thuật (Key)', 'Kiểu (Type)', 'Bắt Buộc?', 'Ràng Buộc & Quy Tắc Hợp Lệ (Rules)', 'Thông Báo Lỗi Inline (Messages)'],
    rows
  )
}

/**
 * Bảng Ma Trận Trạng Thái Giao Diện & Phân Quyền (State & Permission Matrix Table)
 */
export function renderStateMatrixTable(stateMatrix) {
  if (!stateMatrix || !Array.isArray(stateMatrix.behaviors) || !stateMatrix.behaviors.length) return ''

  const rows = stateMatrix.behaviors.map(b => {
    const status = `\`${b.status}\``
    const fieldsState = b.fieldsState === 'readonly' ? '🔒 Chỉ đọc (Readonly)' : (b.fieldsState === 'editable' ? '✏️ Cho phép sửa (Editable)' : b.fieldsState || 'Mặc định')
    const buttons = Array.isArray(b.visibleButtons) ? b.visibleButtons.map(btn => `\`${btn}\``).join(', ') : 'Không có'
    
    let rbacNotes = ''
    if (b.rbacOverrides && typeof b.rbacOverrides === 'object') {
      const overrides = Object.entries(b.rbacOverrides).map(([role, conf]) => {
        const btns = Array.isArray(conf.visibleButtons) ? conf.visibleButtons.map(x => `\`${x}\``).join(', ') : ''
        return `**${role}**: Nút khả dụng [${btns}]`
      })
      rbacNotes = overrides.join('<br>')
    } else {
      rbacNotes = 'Áp dụng cho mọi vai trò'
    }

    return [status, fieldsState, buttons, rbacNotes]
  })

  return renderTable(
    ['Trạng Thái Bản Ghi (Record Status)', 'Trạng Thái Trường Form (Fields State)', 'Nút Hành Động Khả Dụng (Visible Buttons)', 'Ghi Chú Phân Quyền RBAC (Role Overrides)'],
    rows
  )
}

/**
 * Đặc tả chi tiết Hành động theo chuẩn 6 Khối Kỹ Thuật & Bảng Outcomes 4 Tầng
 */
export function renderActionFlowsDetailed(actions = []) {
  if (!Array.isArray(actions) || !actions.length) return ''

  const parts = []
  for (const act of actions) {
    const title = act.label || act.name || act.id || 'Hành động'
    const idBadge = act.id ? ` (\`${act.id}\`)` : ''
    parts.push(`### ${title}${idBadge}`)
    if (act.meaning) parts.push(`> **Ý nghĩa nghiệp vụ:** ${act.meaning}`)
    if (act.purpose) parts.push(`- **Mục đích thao tác:** ${act.purpose}`)
    if (act.position) parts.push(`- **Vị trí hiển thị:** \`${act.position}\` | **Trigger:** \`${act.trigger || 'click'}\` | **Variant:** \`${act.variant || 'default'}\``)

    const preParts = []
    if (act.preconditions) {
      if (act.preconditions.uiState) preParts.push(`- Điều kiện Form UI: \`${act.preconditions.uiState}\``)
      if (act.preconditions.recordState) preParts.push(`- Trạng thái bản ghi hợp lệ: \`${act.preconditions.recordState}\``)
      if (act.preconditions.requiredPermissions?.length) preParts.push(`- Quyền hạn yêu cầu (RBAC): ${act.preconditions.requiredPermissions.map(p => `\`${p}\``).join(', ')}`)
      if (act.preconditions.disabledReason) preParts.push(`- Lý do vô hiệu hóa (disabled tooltip): "${act.preconditions.disabledReason}"`)
    }
    if (act.interactionControl) {
      if (act.interactionControl.preventDoubleSubmit) preParts.push(`- **Bảo vệ nhấn đúp (Double-submit):** BẬT (Khóa nút tức thì khi click, debounce: ${act.interactionControl.debounceMs || 0}ms)`)
      if (act.interactionControl.loadingIndicator) preParts.push(`- Hiệu ứng loading: "${act.interactionControl.loadingIndicator}"`)
      if (act.interactionControl.confirmDialog?.required) {
        preParts.push(`- Cửa sổ xác nhận (Confirm Dialog): BẮT BUỘC (${act.interactionControl.confirmDialog.title || 'Xác nhận'} — "${act.interactionControl.confirmDialog.message || ''}")`)
      }
    }
    if (preParts.length) {
      parts.push('', '#### 1. Điều Kiện Tiên Quyết & Kiểm Soát Tương Tác (Pre-conditions & UI Lock)', ...preParts)
    }

    const execParts = []
    if (act.payloadTransformation) {
      const pt = act.payloadTransformation
      execParts.push(`- Xử lý dữ liệu: Trim chuỗi: ${pt.trimStrings ? 'Có' : 'Không'} | Lọc XSS: ${pt.sanitizeHtml ? 'Có' : 'Không'}`)
      if (pt.typeCasting && typeof pt.typeCasting === 'object') {
        const casts = Object.entries(pt.typeCasting).map(([k, v]) => `\`${k}\` ➔ ${v}`).join(', ')
        execParts.push(`- Ép kiểu dữ liệu (Type casting): ${casts}`)
      }
    }
    if (act.executionContract) {
      const ec = act.executionContract
      execParts.push(`- Endpoint API: \`${ec.method || 'POST'} ${ec.apiRef || ''}\``)
      if (ec.idempotencyKey) execParts.push(`- Khóa Idempotency: \`${ec.idempotencyKey}\``)
      if (ec.timeoutMs) execParts.push(`- Thời gian Timeout SLA: ${ec.timeoutMs}ms`)
      if (ec.concurrencyHandling) {
        execParts.push(`- Xử lý đồng quy (Concurrency): Chiến lược \`${ec.concurrencyHandling.strategy || 'optimistic_locking'}\` (Status: ${ec.concurrencyHandling.onConflictStatus || 409}) ➔ ${ec.concurrencyHandling.conflictResolution || ''}`)
      }
    }
    if (execParts.length) {
      parts.push('', '#### 2. Xử Lý Dữ Liệu & Hợp Đồng Thực Thi API (Transformation & Concurrency)', ...execParts)
    }

    if (act.outcomes) {
      parts.push('', '#### 3. Ma Trận Phản Hồi Kết Quả & Ngoại Lệ (Outcomes & Edge Cases Matrix)')
      const outcomeRows = []

      if (act.outcomes.onSuccess) {
        const s = act.outcomes.onSuccess
        const toast = s.toast ? `Toast ${s.toast.type || 'success'}: "${s.toast.message || ''}"` : 'Thành công'
        const nav = s.navigation ? `Chuyển màn hình \`${s.navigation.target}\`` : 'Ở lại màn hình'
        const bg = s.backgroundTrigger ? `Kích hoạt Event: \`${s.backgroundTrigger.event}\` (${s.backgroundTrigger.note || ''})` : ''
        outcomeRows.push(['Thành công (200 / 201)', 'Dữ liệu hợp lệ, lưu DB thành công', [toast, nav, bg].filter(Boolean).join('<br>')])
      }

      if (Array.isArray(act.outcomes.onBusinessErrors)) {
        act.outcomes.onBusinessErrors.forEach(be => {
          outcomeRows.push([`Lỗi nghiệp vụ (${be.statusCode})`, be.type || 'Nghiệp vụ không thỏa', be.action || 'Báo lỗi trên UI'])
        })
      }

      if (Array.isArray(act.outcomes.onSecurityErrors)) {
        act.outcomes.onSecurityErrors.forEach(se => {
          outcomeRows.push([`Lỗi phân quyền (${se.statusCode})`, se.type || 'Không đủ thẩm quyền', se.action || 'Điều hướng bảo mật'])
        })
      }

      if (Array.isArray(act.outcomes.onSystemErrors)) {
        act.outcomes.onSystemErrors.forEach(sy => {
          outcomeRows.push([`Lỗi hệ thống (${sy.statusCode})`, sy.type || 'Sự cố máy chủ hoặc mạng', sy.action || 'Hiển thị banner khôi phục'])
        })
      }

      if (outcomeRows.length) {
        parts.push(renderTable(['Phân Loại Kết Quả (Outcome)', 'Nguyên Nhân Nghiệp Vụ / Kỹ Thuật', 'Hành Động Hệ Thống & Phản Hồi Người Dùng'], outcomeRows))
      }
    } else if (act.onSuccess || act.onCommonError || act.onSpecificError) {
      parts.push('', '#### 3. Phản Hồi Kết Quả')
      if (act.onSuccess) parts.push(`- Thành công: ${formatRecord(act.onSuccess)}`)
      if (act.onCommonError) parts.push(`- Lỗi chung: ${formatRecord(act.onCommonError)}`)
      if (act.onSpecificError) parts.push(`- Lỗi cụ thể: ${formatRecord(act.onSpecificError)}`)
    }

    if (act.navigation && !act.outcomes?.onSuccess?.navigation) {
      parts.push(`- **Điều hướng:** Chuyển đến màn hình \`${act.navigation.target}\``)
    }

    parts.push('')
  }
  return parts.join('\n')
}

/**
 * Trình bày chi tiết Khối Giao Diện Tùy Biến Ngoài Base Kit (Custom Novel Widgets)
 */
export function renderCustomWidgetSpecs(sections = []) {
  const customSections = []
  function findCustom(list) {
    for (const s of list || []) {
      if (s.kind === 'custom' || s.customWidgetType || s.dimensions || s.palette) {
        customSections.push(s)
      }
      if (Array.isArray(s.sections)) findCustom(s.sections)
    }
  }
  findCustom(sections)

  if (!customSections.length) return ''

  const parts = ['## Đặc Tả Khối Giao Diện Tùy Biến (Custom UI Blocks)', '']
  for (const c of customSections) {
    parts.push(`### ${c.name || c.id || 'Khối Tùy Biến'} (\`${c.customWidgetType || c.kind}\`)`)
    if (c.meaning) parts.push(`> **Ý nghĩa nghiệp vụ:** ${c.meaning}`)
    if (c.purpose) parts.push(`- **Mục đích thao tác:** ${c.purpose}`)
    
    if (c.dimensions) {
      const d = c.dimensions
      parts.push('', '**Kích thước & Hình học (Dimensions & Responsive):**')
      parts.push(`- Chiều rộng: \`${d.width || '100%'}\` | Chiều cao: Min \`${d.minHeight || 'auto'}\` / Max \`${d.maxHeight || 'auto'}\``)
      if (d.responsiveLayout) {
        parts.push(`- Bố cục theo thiết bị: Desktop (\`${d.responsiveLayout.desktop}\`) · Mobile (\`${d.responsiveLayout.mobile}\`) · Breakpoint: \`${d.responsiveLayout.breakpoint || '768px'}\``)
      }
    }

    if (c.palette) {
      const p = c.palette
      parts.push('', '**Bảng màu & Bề mặt (Palette Tokens):**')
      const tokens = Object.entries(p).map(([k, v]) => `- \`${k}\`: \`${v}\``)
      parts.push(...tokens)
    }

    if (c.typography) {
      parts.push('', '**Kiểu chữ & Typography:**')
      const typos = Object.entries(c.typography).map(([k, v]) => `- \`${k}\`: \`${v}\``)
      parts.push(...typos)
    }

    if (c.interactions) {
      parts.push('', '**Phản hồi vi tương tác & Trạng thái:**')
      const ints = Object.entries(c.interactions).map(([k, v]) => `- \`${k}\`: ${formatRecord(v)}`)
      parts.push(...ints)
    }
    parts.push('')
  }
  return parts.join('\n')
}

function renderItemBusiness(item, indent) {
  const pad = '  '.repeat(indent)
  const kind = item.kind || ''
  const title = item.name || item.label || item.value || item.id || 'item'
  const idStr = item.id ? ` \`${item.id}\`` : ''
  const lines = [`${pad}- **${title}**${idStr}${kind ? ` (\`${kind}\`)` : ''}`]
  
  if (item.meaning || item.businessMeaning) {
    lines.push(`${pad}  - Ý nghĩa nghiệp vụ: ${item.meaning || item.businessMeaning}`)
  }
  lines.push(`${pad}  - Mục đích thao tác: ${item.purpose || '#missing_info'}`)
  
  const copyStr = formatCopy(item.copy, item)
  if (copyStr) lines.push(`${pad}  - Copy trên UI: ${copyStr}`)
  
  if (item.position) lines.push(`${pad}  - Vị trí: ${typeof item.position === 'string' ? item.position : formatRecord(item.position)}`)
  if (item.color || item.variant) {
    lines.push(`${pad}  - Màu / variant: ${[item.variant, item.color].filter(Boolean).join(' · ')}`)
  }
  const visual = formatVisual(item.visual)
  if (visual) lines.push(`${pad}  - Kích thước / CSS: ${visual}`)
  const interaction = formatRecord(item.interaction)
  if (interaction) lines.push(`${pad}  - Hover / blur / focus: ${interaction}`)
  
  const valLines = formatValidation(item.validation, item.messages)
  if (valLines.length === 1) {
    lines.push(`${pad}  - Validate (mặt UI): ${valLines[0]}`)
  } else if (valLines.length > 1) {
    lines.push(`${pad}  - Validate (mặt UI):`)
    valLines.forEach(l => lines.push(`${pad}    - ${l}`))
  }
  
  const statesStr = formatStates(item.states)
  if (statesStr) lines.push(`${pad}  - Hiện / ẩn / khóa: ${statesStr}`)
  
  if (item.actions) {
    const actionsStr = formatRecord(item.actions)
    if (actionsStr) lines.push(`${pad}  - Actions: ${actionsStr}`)
  }
  
  if (item.hidden === true) lines.push(`${pad}  - Ẩn trên UI (hidden)`)
  
  if (item.db) {
    const db = item.db;
    const dbParts = [];
    if (db.schema && db.field) {
      dbParts.push(`Bảng \`${db.schema}\`, trường \`${db.field}\``);
    } else if (db.schema) {
      dbParts.push(`Bảng \`${db.schema}\``);
    } else if (db.field) {
      dbParts.push(`Trường \`${db.field}\``);
    }
    
    if (dbParts.length > 0) {
      lines.push(`${pad}  - Nơi lưu trữ dữ liệu: ${dbParts.join(' · ')}`);
    }

    if (db.enumMapping && typeof db.enumMapping === 'object') {
      const enumStr = Object.entries(db.enumMapping)
        .map(([k, v]) => `\`${k}\` = ${v}`)
        .join(', ');
      lines.push(`${pad}  - Ý nghĩa dữ liệu: ${enumStr}`);
    }
  }

  return lines
}

function renderItemTech(item, indent) {
  const pad = '  '.repeat(indent)
  const meta = [item.kind, item.widget].filter(Boolean).join(' / ')
  const lines = [`${pad}- **${item.id || item.name || item.label || item.value || 'item'}**${meta ? ` (\`${meta}\`)` : ''}`]
  const tags = formatTags(item)
  if (tags) lines.push(`${pad}  - tags: ${tags}`)
  if (item.extract) lines.push(`${pad}  - extract: ${item.extract}`)
  const bind = formatBind(item.bind)
  if (bind) lines.push(`${pad}  - bind / hidden field: ${bind}`)
  const apis = Array.isArray(item.apiRefs) ? item.apiRefs.join(', ') : item.bind?.apiRef
  if (apis) lines.push(`${pad}  - API: ${apis}`)
  if (item.hidden === true || item.bind?.hidden === true) lines.push(`${pad}  - hidden: true`)
  
  const valLines = formatValidation(item.validation, item.messages)
  if (valLines.length === 1) {
    lines.push(`${pad}  - validation: ${valLines[0]}`)
  } else if (valLines.length > 1) {
    lines.push(`${pad}  - validation:`)
    valLines.forEach(l => lines.push(`${pad}    - ${l}`))
  }
  
  if (item.testId) lines.push(`${pad}  - testId: ${item.testId}`)
  const st = formatStates(item.states)
  if (st) lines.push(`${pad}  - states: ${st}`)
  
  if (item.actions) {
    const actionsStr = formatRecord(item.actions)
    if (actionsStr) lines.push(`${pad}  - actions: ${actionsStr}`)
  }
  
  return lines
}

function renderSectionBusiness(section, depth) {
  const pad = '  '.repeat(depth)
  const kind = section.kind || 'section'
  const lines = [`${pad}- **${section.name || section.label || section.value || section.id || 'section'}** (\`${kind}\`)`]
  if (section.meaning || section.businessMeaning) {
    lines.push(`${pad}  - Ý nghĩa nghiệp vụ: ${section.meaning || section.businessMeaning}`)
  }
  if (section.purpose) lines.push(`${pad}  - Mục đích thao tác: ${section.purpose}`)
  if (section.position) {
    lines.push(`${pad}  - Vị trí: ${typeof section.position === 'string' ? section.position : formatRecord(section.position)}`)
  }
  const visual = formatVisual(section.visual)
  if (visual) lines.push(`${pad}  - Kích thước / CSS: ${visual}`)
  const interaction = formatRecord(section.interaction)
  if (interaction) lines.push(`${pad}  - Hover / blur / focus: ${interaction}`)
  const val = formatValidation(section.validation)
  if (val) lines.push(`${pad}  - Validate (mặt UI): ${val}`)
  if (section.hidden === true) lines.push(`${pad}  - Ẩn trên UI`)
  for (const item of section.items || []) lines.push(...renderItemBusiness(item, depth + 1))
  for (const child of section.sections || []) lines.push(...renderSectionBusiness(child, depth + 1))
  return lines
}

function renderSectionTech(section, depth) {
  const pad = '  '.repeat(depth)
  const kind = section.kind || 'section'
  const lines = [`${pad}- **${section.id || section.name || section.label || section.value || 'section'}** (\`${kind}\`)`]
  const tags = formatTags(section)
  if (tags) lines.push(`${pad}  - tags: ${tags}`)
  if (section.extract) lines.push(`${pad}  - extract: ${section.extract}`)
  const apis = Array.isArray(section.apiRefs) ? section.apiRefs.join(', ') : ''
  if (apis) lines.push(`${pad}  - API: ${apis}`)
  if (section.hidden === true) lines.push(`${pad}  - hidden: true`)
  const visual = formatVisual(section.visual)
  if (visual) lines.push(`${pad}  - css: ${visual}`)
  const interaction = formatRecord(section.interaction)
  if (interaction) lines.push(`${pad}  - interaction: ${interaction}`)
  for (const item of section.items || []) lines.push(...renderItemTech(item, depth + 1))
  for (const child of section.sections || []) lines.push(...renderSectionTech(child, depth + 1))
  return lines
}

function renderNavTree(nodes, indent = 0) {
  const lines = []
  for (const node of nodes || []) {
    const pad = '  '.repeat(indent)
    const mark = node.active ? ' ← đang mở' : ''
    lines.push(`${pad}- ${node.name || node.label || node.value || node.id || 'node'}${mark}`)
    if (node.children?.length) lines.push(...renderNavTree(node.children, indent + 1))
  }
  return lines
}

export function renderNavMarkdown(nav = {}) {
  if (!nav || typeof nav !== 'object') return ''
  const parts = []
  const sidebar = nav.sidebar
  if (sidebar && sidebar.enabled !== false && (sidebar.levels?.length || sidebar.purpose)) {
    parts.push('### Menu trái (sidebar)', '')
    if (sidebar.purpose) parts.push(sidebar.purpose, '')
    parts.push(...renderNavTree(sidebar.levels || []), '')
  }
  const crumbs = nav.breadcrumb
  if (Array.isArray(crumbs) && crumbs.length) {
    const trail = crumbs.map((c) => (typeof c === 'string' ? c : c.name || c.label || c.value || c.href || '')).join(' > ')
    parts.push('### Breadcrumb', '', trail, '')
  }
  return parts.join('\n')
}

/**
 * Split-facing MD. `businessOnly` = ir/spec.yaml (no codegen/id/tag dump).
 * @param {Record<string, unknown>} design
 * @param {{ businessOnly?: boolean }} [opts]
 */
export function renderPageComposition(design = {}, opts = {}) {
  const tree =
    Array.isArray(design.sections) && design.sections.length
      ? design.sections
      : design.zones || []
  const navMd = renderNavMarkdown(design.nav)
  if (!navMd && !hasTreeContent(tree) && !(design.actions || []).length && !design.behavior) {
    return ''
  }

  const parts = [
    '## Bề mặt UI (BA / QA / stakeholder)',
    '',
    'Mô tả nghiệp vụ: nhãn, ý nghĩa, validate, hành động. Không gồm id kỹ thuật / hashtag component.',
    ''
  ]
  if (navMd) parts.push(navMd.trim(), '')
  if (hasTreeContent(tree)) {
    for (const node of tree) parts.push(...renderSectionBusiness(node, 0), '')
  }
  if (design.behavior && Object.keys(design.behavior).length) {
    parts.push('### Hành vi trang', '', renderBehaviorTable(design.behavior), '')
  }
  if (Array.isArray(design.actions) && design.actions.length) {
    parts.push('### Hành động', '', renderActionsBusiness(design.actions), '')
  }

  if (!opts.businessOnly) {
    parts.push(
      '## Kỹ thuật (FlowGrid / FE)',
      '',
      'Chỉ nằm trên `ir/design.yaml`. VitePress đọc `ir/spec.yaml`.',
      ''
    )
    if (hasTreeContent(tree)) {
      for (const node of tree) parts.push(...renderSectionTech(node, 0), '')
    }
  }
  return `${parts.join('\n').trim()}\n`
}

function renderActionsBusiness(actions = []) {
  const lines = []
  for (const action of actions) {
    const title = action.name || action.label || action.value || action.purpose || action.id || 'Hành động'
    lines.push(`- **${title}**`)
    if (action.purpose) lines.push(`  - Ý nghĩa: ${action.purpose}`)
    if (action.position) lines.push(`  - Vị trí: ${action.position}`)
    if (action.onSuccess) lines.push(`  - Khi thành công: ${formatRecord(action.onSuccess)}`)
    if (action.onCommonError) lines.push(`  - Lỗi chung: ${formatRecord(action.onCommonError)}`)
    if (action.onSpecificError) lines.push(`  - Lỗi cụ thể: ${formatRecord(action.onSpecificError)}`)
  }
  return lines.join('\n') || MD_NONE
}

export function renderZoneItemsBusiness(zones = []) {
  return renderPageComposition({ zones }, { businessOnly: true })
}

export function renderZonesTable(zones = []) {
  if (!zones.length) return MD_NONE

  return renderTable(
    ['ID', 'Nhãn', 'Kind', 'Visual', 'Tags'],
    zones.map((zone) => [
      zone.id ?? '',
      zone.label ?? zone.title ?? '',
      zone.kind ?? '',
      formatVisual(zone.visual),
      formatTags(zone)
    ])
  )
}

function collectItemRows(nodes, parentId, rows) {
  for (const node of nodes || []) {
    const sid = node.id ?? parentId
    for (const item of node.items || []) {
      const apis = Array.isArray(item.apiRefs)
        ? item.apiRefs.join(', ')
        : item.bind?.apiRef || ''
      rows.push([
        sid ?? '',
        item.id ?? '',
        item.kind ?? '',
        item.widget ?? '',
        formatBind(item.bind),
        apis,
        item.hidden === true || item.bind?.hidden === true ? 'yes' : '',
        formatValidation(item.validation, item.messages),
        formatTags(item)
      ])
    }
    collectItemRows(node.sections, sid, rows)
  }
}

export function renderZoneItemsTechTable(zones = []) {
  const rows = []
  collectItemRows(zones, '', rows)
  if (!rows.length) return MD_NONE
  return renderTable(
    ['Zone', 'ID', 'Kind', 'Widget', 'Bind / hidden field', 'API', 'Hidden', 'Validation', 'Tags'],
    rows
  )
}

export function renderBehaviorTable(behavior = {}) {
  const verbs = ['create', 'update', 'delete', 'duplicate', 'export', 'import']
  const rows = []

  for (const verb of verbs) {
    const block = behavior[verb]
    if (!block || typeof block !== 'object') continue
    rows.push([
      verb,
      block.enabled === false ? 'không' : 'có',
      block.surface ?? block.mode ?? block.target ?? '',
      block.confirm ?? (block.mode && block.surface ? block.mode : '') ?? '',
      block.notes ?? ''
    ])
  }

  if (!rows.length) return MD_NONE

  return renderTable(['Hành động', 'Bật', 'Surface / mode', 'Confirm', 'Ghi chú'], rows)
}

export function renderActionsTable(actions = []) {
  if (!actions.length) return MD_NONE

  return renderTable(
    ['ID', 'Label', 'Variant', 'Position', 'Trigger', 'API'],
    actions.map((action) => [
      action.id ?? '',
      action.label ?? action.text ?? '',
      action.variant ?? action.type ?? '',
      action.position ?? '',
      action.trigger ?? '',
      formatApi(action)
    ])
  )
}

function formatApi(action) {
  const tags = Array.isArray(action.tags) ? action.tags.map(String) : []
  const reuse = action.reuseFrom || tags.find((t) => t.startsWith('#reuse-api'))
  if (reuse) return String(action.reuseFrom || reuse)
  if (action.api) return String(action.api)
  if (Array.isArray(action.apiRefs)) return action.apiRefs.join(', ')
  return ''
}

export {
  renderValidationDictionaryTable,
  renderStateMatrixTable,
  renderActionFlowsDetailed,
  renderCustomWidgetSpecs
}