import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid(
  defineConfig({
    title: "Forgekit Docs",
    description: "Unified Local MCP Toolkit (Graph, DNA, Docs, Test, Codegen)",
    themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/1-guide/getting-started'}
      ],
      sidebar: [
        {
          text: 'Guide & Khái niệm',
          items: [
            { text: 'Getting Started', link: '/1-guide/getting-started' },
            { text: 'Toolkits Overview', link: '/1-guide/toolkits' },
            { text: 'Cấu trúc Hệ thống Docs', link: '/1-guide/system-doc-structure' },
            { text: 'AI Workflow', link: '/1-guide/ai-workflow' }
          ]
        },
        {
          text: 'Lifecycle (Vòng Đời)',
          items: [
            { text: 'Tổng Quan Pipeline', link: '/2-lifecycle/overview' },
            { text: 'Luồng Phát Triển (Dev)', link: '/2-lifecycle/development-flows' },
            { text: 'Luồng Backend AI', link: '/2-lifecycle/backend-workflow' },
            { text: 'Bảo Trì & Tech Debt', link: '/2-lifecycle/quality-maintenance' }
          ]
        },
        {
          text: 'Artifacts',
          items: [
            { text: 'Cấu Trúc Layout', link: '/3-artifacts/layout' },
            { text: 'Bundle & IR', link: '/3-artifacts/bundle-and-ir' },
            { text: 'Quy trình Grill', link: '/3-artifacts/grill-process' },
            { text: 'Tags & Markers', link: '/3-artifacts/tags-and-markers' }
          ]
        },
        {
          text: 'Contracts & Tiêu Chuẩn',
          items: [
            { text: 'Portal ↔ FastAPI', link: '/4-contracts/portal-to-fastapi' },
            { text: 'Field Registry', link: '/4-contracts/field-registry' }
          ]
        },
        {
          text: 'Kiểm Thử (Testing)',
          items: [
            { text: 'Quy Ước E2E TestIDs', link: '/5-testing/e2e-testids' },
            { text: 'E2E Semantic Assertions', link: '/5-testing/e2e-assertions' }
          ]
        },
        {
          text: 'Tra Cứu Nhanh',
          items: [
            { text: 'CLI & Commands', link: '/6-reference/cli-and-commands' },
            { text: 'Prompt Templates', link: '/6-reference/prompt-templates' },
            { text: 'Repo Split Map', link: '/6-reference/repo-split-map' }
          ]
        },
        {
          text: 'AI Skills (Phase 1)',
          items: [
            { text: '/spec', link: '/6-reference/skills/spec' },
            { text: '/grill-bqa', link: '/6-reference/skills/grill-bqa' },
            { text: '/grill-dev', link: '/6-reference/skills/grill-dev' },
            { text: '/grill-docs', link: '/6-reference/skills/grill-docs' },
            { text: '/update-spec', link: '/6-reference/skills/update-spec' },
            { text: '/qa-resolve', link: '/6-reference/skills/qa-resolve' }
          ]
        },
        {
          text: 'AI Skills (Phase 2)',
          items: [
            { text: '/docskit & CLI', link: '/6-reference/skills/docskit' },
            { text: '/build-templates', link: '/6-reference/skills/build-templates' },
            { text: '/openapi', link: '/6-reference/skills/openapi' }
          ]
        },
        {
          text: 'AI Skills (Phase 2a - Scaffold FE)',
          items: [
            { text: '/prototype', link: '/6-reference/skills/prototype' }
          ]
        },
        {
          text: 'AI Skills (Phase 2b - Tests)',
          items: [
            { text: '/test', link: '/6-reference/skills/test' },
            { text: '/grill-test', link: '/6-reference/skills/grill-test' },
            { text: 'testcase:gen', link: '/6-reference/skills/testcase' }
          ]
        },
        {
          text: 'AI Skills (Phase 2c - Backend Unit)',
          items: [
            { text: '/unit', link: '/6-reference/skills/unit' }
          ]
        },
        {
          text: 'AI Skills (Phase 3 - API & Wire)',
          items: [
            { text: '/api', link: '/6-reference/skills/api' },
            { text: '/grill-api', link: '/6-reference/skills/grill-api' },
            { text: '/api-spec', link: '/6-reference/skills/api-spec' },
            { text: '/grill-api-spec', link: '/6-reference/skills/grill-api-spec' },
            { text: '/api-update', link: '/6-reference/skills/api-update' },
            { text: '/api-integration', link: '/6-reference/skills/api-integration' },
            { text: '/grill-integration-spec', link: '/6-reference/skills/grill-integration-spec' },
            { text: '/wire', link: '/6-reference/skills/wire' }
          ]
        },
        {
          text: 'AI Skills (Phase 4)',
          items: [
            { text: '/decision', link: '/6-reference/skills/decision' },
            { text: '/architecture', link: '/6-reference/skills/architecture' },
            { text: '/architecture-grill', link: '/6-reference/skills/architecture-grill' },
            { text: '/overview', link: '/6-reference/skills/overview' },
            { text: '/surfaces', link: '/6-reference/skills/surfaces' },
            { text: '/module', link: '/6-reference/skills/module' },
            { text: '/business-process', link: '/6-reference/skills/business-process' },
            { text: '/background-logic', link: '/6-reference/skills/background-logic' },
            { text: '/db-erd', link: '/6-reference/skills/db-erd' }
          ]
        },
        {
          text: 'AI Skills (Phase 5)',
          items: [
            { text: '/grill', link: '/6-reference/skills/grill' },
            { text: '/call-external', link: '/6-reference/skills/call-external' },
            { text: '/common', link: '/6-reference/skills/common' },
            { text: '/common-spec', link: '/6-reference/skills/common-spec' },
            { text: '/grill-common-spec', link: '/6-reference/skills/grill-common-spec' },
            { text: '/cross-service', link: '/6-reference/skills/cross-service' },
            { text: '/cross-entity-service', link: '/6-reference/skills/cross-entity-service' },
            { text: '/cross-cutting', link: '/6-reference/skills/cross-cutting' },
            { text: '/deployment', link: '/6-reference/skills/deployment' }
          ]
        },
        {
          text: 'AI Skills (Phase 6)',
          items: [
            { text: '/business-impact-review', link: '/6-reference/skills/business-impact-review' }
          ]
        },
        {
          text: 'Kiến Trúc (Architecture)',
          items: [
            { text: 'Portal Architecture', link: '/7-architecture/portal-architecture' },
            { text: 'Page Lifecycle', link: '/7-architecture/page-lifecycle' }
          ]
        }
      ]
    },
    mermaid: {
      // Mermaid configuration
    },
    vite: {
      optimizeDeps: {
        include: [
          'mermaid',
          'fastdom'
        ]
      }
    }
  })
);
