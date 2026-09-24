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

  // 1. Check Section 1: Context & Authorization Role Matrix
  if (!rawText.includes('Role Matrix') && !rawText.includes('Authorization Matrix') && !rawText.includes('Bối cảnh')) {
    addGap(
      'FLOW_MISSING_ROLE_MATRIX',
      'critical',
      'Section_1_Role_Matrix',
      'Missing Context & Business Authorization Matrix (Role Matrix).',
      'Add table defining Personas/Roles, permissions, and trigger screens [W-*].'
    );
  } else if (!rawText.includes('[W-') && !rawText.includes('W-')) {
    addGap(
      'FLOW_MISSING_SCREEN_REFS',
      'warning',
      'Section_1_Screen_Refs',
      'Role matrix does not specify target screen codes [W-*].',
      'List specific screen codes [W-*] associated with each persona role.'
    );
  }

  // 2. Check Section 2: Multi-tiered User Story Chain
  const hasUserStories = rawText.includes('User Stories') || rawText.includes('User Story');
  if (!hasUserStories) {
    addGap(
      'FLOW_MISSING_USER_STORIES',
      'critical',
      'Section_2_User_Stories',
      'Missing Multi-tiered User Story Chain block.',
      'Add Setup Story, Primary Story, System Story (if background triggers exist), and Tracking Story.'
    );
  } else {
    // Check if background logic exists in the prompt/doc but System Story is missing
    const mentionsBackground = /background|async|worker|cron|job|event|kafka|queue/i.test(rawText);
    const hasSystemStory = /System Story/i.test(rawText);
    if (mentionsBackground && !hasSystemStory) {
      addGap(
        'FLOW_MISSING_SYSTEM_STORY',
        'critical',
        'Section_2_System_Story',
        'Process mentions background processing (worker/queue/job) but lacks a System Story.',
        'Add System Story detailing autonomous system execution upon receiving background events.'
      );
    }
  }

  // 3. Check Section 3: Business Rules & State Lifecycle
  if (!rawText.includes('Business Rules') && !rawText.includes('BR-')) {
    addGap(
      'FLOW_MISSING_BUSINESS_RULES',
      'critical',
      'Section_3_Business_Rules',
      'Missing Business Rules table (BR-*) or State Transition Matrix.',
      'Declare BR-* rules (validation, limits, security, retry policies).'
    );
  }

  // 4. Check Section 4: Step-by-step Stage Journey Specification
  if (!rawText.includes('Step-by-step') && !rawText.includes('Journey') && !rawText.includes('Stage')) {
    addGap(
      'FLOW_MISSING_JOURNEY',
      'critical',
      'Section_4_Journey',
      'Missing Step-by-step Stage Journey Specification section.',
      'Declare detailed stages: screen [W-*], input data, Handoffs, and background processing.'
    );
  }

  // 5. Check Section 5: Traceability Matrix
  if (!rawText.includes('Traceability') && !rawText.includes('Traceability Matrix')) {
    addGap(
      'FLOW_MISSING_TRACEABILITY',
      'warning',
      'Section_5_Traceability',
      'Missing 1-to-1 Traceability Matrix between User Story, Screen, and Message.',
      'Declare 1-to-1 traceability table mapping Story Step <-> Screen [W-*] <-> Diagram Message.'
    );
  }

  // 6. Check Section 6: Sequence Diagram
  if (!rawText.includes('sequenceDiagram') && !rawText.includes('```mermaid')) {
    addGap(
      'FLOW_MISSING_SEQUENCE_DIAGRAM',
      'critical',
      'Section_6_Sequence_Diagram',
      'Missing Mermaid Sequence Diagram.',
      'Draw sequenceDiagram modeling interactions between Screens [W-*], Backend Services, and Async Workers.'
    );
  } else {
    // If background logic mentioned, check if rect rgb(...) background box is present in diagram
    const mentionsBackground = /background|async|worker|cron|job|event|kafka|queue/i.test(rawText);
    const hasRectRgb = rawText.includes('rect rgb(');
    if (mentionsBackground && !hasRectRgb) {
      addGap(
        'FLOW_MISSING_DIAGRAM_BACKGROUND_BOX',
        'warning',
        'Section_6_Diagram_Background_Box',
        'Sequence diagram does not highlight background processing with a `rect rgb(...)` block.',
        'Wrap Async Worker steps inside a `rect rgb(240, 248, 255)` block in the Mermaid diagram.'
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
