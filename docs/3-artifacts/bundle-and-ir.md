# Bundle ↔ IR split

> Một diagram · [Toolchain index](..)

```mermaid
flowchart LR
  B["*.bundle.yaml\nspec · gen · design"]
  S["pnpm spec:split"]
  M["pnpm spec:merge"]
  IR_D["ir/design.yaml\ntech + FE/Test"]
  IR_S["ir/spec.yaml\nbusiness prose"]
  MD["ir/generated/<slug>.md\nData Dictionary & State Matrix"]
  B --> S --> IR_D
  B --> S --> IR_S
  IR_S -->|docs:render| MD
  IR_D --> M --> B
  IR_S --> M
```

Không còn `ir/legacy.yaml`. Stub `legacy:` rỗng trên bundle bị bỏ lúc split. Không author `bundle.spec.api` — API SSOT là `api/<seq>/01-backend-spec.yaml`.

## spec vs gen vs design (authoring)

| Section | Chứa | Ai sửa |
|---------|------|--------|
| `bundle.spec` | Actors, requirements, `ui.list\|form\|detail`, acceptance — **không** `spec.api` | `/spec`, `/legacy /spec`, `/grill-bqa` |
| `bundle.gen` | `codegen.profile/entity/module`, `#gen:*`, `ui.filters/columns` | `/grill-dev` |
| `bundle.design` | nav, sections/items (label, meaning, purpose, 5-tier validation, custom widget specs), stateMatrix, actions (6 blocks + 4-tier outcomes) | `/spec` + `/grill-dev` |
| `bundle.review` | Prose BA — **không** split sang ir | `/grill-bqa` |
| `qa/open/QA-<bundle.id>-NNNN.yaml` | Câu hỏi treo (AskQuestion Other chưa chốt) | `/qa-resolve` đóng |

## Split output (đọc theo toolkit)

| File | Độc giả |
|------|---------|
| `ir/design.yaml` | **Bộ Code FE** (`/prototype`, `--spec ir/design.yaml`), **Bộ Test** E2E; `api` chiếu slim từ 01 local |
| `ir/spec.yaml` | Business SSOT (VitePress / GitHub spec MD) — không id/hashtag component |
| `ir/generated/<slug>.md` | Site + `forgekit publish` — chứa bảng Data Dictionary Table, State & Permission Matrix, Action Flows (không raw YAML dump) |
| `api/<seq>/01-backend-spec.yaml` | **Bộ Code BE** (`/api`) — không đọc `ir/*` |

## Quy tắc edit

**Sửa tay → `*.bundle.yaml` (và/hoặc 01), rồi `pnpm spec:split`.** Không sửa tay `ir/*`.

- Split **ghi đè** `ir/design.yaml` + `ir/spec.yaml`.
- Grill ghi bundle / 01 rồi split. Merge đẩy `gen`/layout về bundle khi cần.

## Forgekit Docs aliases

| Lệnh | Mục đích |
|------|----------|
| `pnpm spec:split -- <bundle.yaml>` · `forgekit split` | bundle → `ir/design.yaml` + `ir/spec.yaml` (+ MD `ir/generated`) |
| `pnpm spec:merge -- <bundle.yaml>` · `forgekit merge` | `ir/*` → bundle |
| `pnpm spec:split:check` · `forgekit check` | CI: ir sync bundle; common yaml **bắt buộc** có `ir/design.yaml` |
| `pnpm forge:render` · `forgekit render` | `ir/spec.yaml` → `ir/generated/*.md`; luôn ghi `qa/index.md` |
| `pnpm forge:publish` · `forgekit publish` | `CATALOG.md` + link đầu README (không render lại spec) |
