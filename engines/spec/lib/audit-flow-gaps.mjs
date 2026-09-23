#!/usr/bin/env node

/**
 * audit-flow-gaps.mjs
 * Zero-dependency static audit script for Forgekit Business Process markdown files (FLOW-*.md).
 * Ensures 100% adherence to the 6-section business process standard and background logic rules.
 */

import fs from 'fs';
import path from 'path';

function auditFlowContent(rawText, filePath) {
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

  // 1. Check Section 1: Bối cảnh & Ma trận Phân quyền (Role Matrix)
  if (!rawText.includes('Ma trận Phân quyền') && !rawText.includes('Role Matrix')) {
    addGap(
      'FLOW_MISSING_ROLE_MATRIX',
      'critical',
      'Section_1_Role_Matrix',
      'Thiếu Bối cảnh & Ma trận Phân quyền Nghiệp vụ (Role Matrix).',
      'Bổ sung bảng vai trò (Persona/Role), quyền truy cập và màn hình kích hoạt [W-*].'
    );
  } else if (!rawText.includes('[W-') && !rawText.includes('W-')) {
    addGap(
      'FLOW_MISSING_SCREEN_REFS',
      'warning',
      'Section_1_Screen_Refs',
      'Ma trận vai trò chưa chỉ định mã màn hình [W-*].',
      'Liệt kê rõ các mã màn hình [W-*] liên quan đến từng vai trò.'
    );
  }

  // 2. Check Section 2: Chuỗi User Stories Đa Tầng (Multi-tiered User Stories)
  const hasUserStories = rawText.includes('User Stories') || rawText.includes('Kịch bản Người dùng');
  if (!hasUserStories) {
    addGap(
      'FLOW_MISSING_USER_STORIES',
      'critical',
      'Section_2_User_Stories',
      'Thiếu khối Chuỗi User Stories Đa Tầng.',
      'Bổ sung Setup Story, Primary Story, System Story (nếu có ngầm), và Tracking Story.'
    );
  } else {
    // Check if background logic exists in the prompt/doc but System Story is missing
    const mentionsBackground = /ngầm|async|worker|cron|job|event|kafka|queue/i.test(rawText);
    const hasSystemStory = /System Story|Hệ thống ngầm|Thao tác hệ thống/i.test(rawText);
    if (mentionsBackground && !hasSystemStory) {
      addGap(
        'FLOW_MISSING_SYSTEM_STORY',
        'critical',
        'Section_2_System_Story',
        'Quy trình có mô tả xử lý ngầm (worker/queue/job) nhưng thiếu System Story.',
        'Bổ sung System Story mô tả chi tiết hệ thống tự động làm gì khi nhận sự kiện ngầm.'
      );
    }
  }

  // 3. Check Section 3: Quy tắc Nghiệp vụ & Vòng đời Trạng thái
  if (!rawText.includes('Quy tắc Nghiệp vụ') && !rawText.includes('BR-')) {
    addGap(
      'FLOW_MISSING_BUSINESS_RULES',
      'critical',
      'Section_3_Business_Rules',
      'Thiếu bảng Quy tắc Nghiệp vụ (BR-*) hoặc Ma trận chuyển đổi trạng thái.',
      'Khai báo các quy tắc BR-* (validation, hạn mức, bảo mật, chính sách retry).'
    );
  }

  // 4. Check Section 4: Đặc tả Chi tiết Hành trình Từng Chặng (Step-by-step Journey)
  if (!rawText.includes('Hành trình') && !rawText.includes('Step-by-step')) {
    addGap(
      'FLOW_MISSING_JOURNEY',
      'critical',
      'Section_4_Journey',
      'Thiếu phần Đặc tả Chi tiết Hành trình Từng Chặng (Step-by-step Journey).',
      'Khai báo chi tiết các chặng: màn hình [W-*], dữ liệu nhập, Handoff, và xử lý ngầm.'
    );
  }

  // 5. Check Section 5: Ma trận Đối chiếu (Traceability Matrix)
  if (!rawText.includes('Ma trận Đối chiếu') && !rawText.includes('Traceability')) {
    addGap(
      'FLOW_MISSING_TRACEABILITY',
      'warning',
      'Section_5_Traceability',
      'Thiếu Ma trận Đối chiếu (Traceability Matrix) 1-1 giữa User Story, Màn hình, và Message.',
      'Khai báo bảng đối chiếu 1-1 giữa Bước Story <-> Màn hình [W-*] <-> Diagram Message.'
    );
  }

  // 6. Check Section 6: Sơ đồ Tuần tự Nghiệp vụ (Sequence Diagram)
  if (!rawText.includes('sequenceDiagram') && !rawText.includes('```mermaid')) {
    addGap(
      'FLOW_MISSING_SEQUENCE_DIAGRAM',
      'critical',
      'Section_6_Sequence_Diagram',
      'Thiếu Sơ đồ Tuần tự Nghiệp vụ (Sequence Diagram) Mermaid.',
      'Vẽ sơ đồ sequenceDiagram thể hiện sự tương tác giữa Màn hình [W-*], Backend Service, và Async Worker.'
    );
  } else {
    // If background logic mentioned, check if rect rgb(...) background box is present in diagram
    const mentionsBackground = /ngầm|async|worker|cron|job|event|kafka|queue/i.test(rawText);
    const hasRectRgb = rawText.includes('rect rgb(');
    if (mentionsBackground && !hasRectRgb) {
      addGap(
        'FLOW_MISSING_DIAGRAM_BACKGROUND_BOX',
        'warning',
        'Section_6_Diagram_Background_Box',
        'Sơ đồ sequenceDiagram chưa nổi bật vùng xử lý ngầm bằng phân đoạn `rect rgb(...)`.',
        'Bọc các bước xử lý ngầm (Async Worker) trong khối `rect rgb(240, 248, 255)` trên sơ đồ Mermaid.'
      );
    }
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
  console.log('Usage: node engines/spec/lib/audit-flow-gaps.mjs <path-to-FLOW.md>');
  process.exit(0);
}

const targetFile = path.resolve(process.cwd(), args[0]);
if (!fs.existsSync(targetFile)) {
  console.error(JSON.stringify({ error: `File not found: ${targetFile}` }));
  process.exit(1);
}

const rawText = fs.readFileSync(targetFile, 'utf8');
const report = auditFlowContent(rawText, targetFile);
console.log(JSON.stringify(report, null, 2));
