# SSOT Agent Protocol — Physical Interlocks (Docskit)

> [!CRITICAL]
> Đây là **KHÓA VẬT LÝ**, không phải lời nhắc.
> Vi phạm bất kỳ đạo luật nào → run **FAILED**. Chat-only "done" = **KHÔNG ĐƯỢC CHẤP NHẬN**.
>
> Path SSOT: `surfaces/<surface>/CMP-*/<slug>/` (không có segment `modules/`).

---

## ĐẠO LUẬT 1 — CRITICAL RULE FOR PRE-FLIGHT CHECK

**Mục tiêu:** Trị bệnh lười đọc file gốc.

Dù Thread mới hay cũ, ngay khi User yêu cầu chạy một skill/tính năng, hành động **ĐẦU TIÊN BẮT BUỘC** là dùng tool `{{DOC_SKIT_READ_TOOL}}` (hoặc read-file tương đương) nhắm thẳng vào `SKILL.md` của skill đó để nạp lại quy chuẩn.

**TUYỆT ĐỐI KHÔNG** dựa vào trí nhớ mường tượng từ context/thread trước.

Chưa `{{DOC_SKIT_READ_TOOL}}` / read `SKILL.md` → **CẤM** tạo plan, hay bất kỳ file product nào.

---

## ĐẠO LUẬT 2 — CRITICAL RULE FOR TASK TRACKING (Anti Flat-Check)

**Mục tiêu:** Trị "viết 10 làm 7" / flat-check.

Ngay sau Pre-flight, Agent **BẮT BUỘC** derive checklist từ **Workflow + Accelerators** của `SKILL.md`:

- **Task nhỏ (≤5 items):** Liệt kê checklist (`- [ ]`) trực tiếp trong **chat thread**. Làm xong bước nào → đánh `[x]` + evidence.
- **Task lớn (>5 items hoặc multi-phase):** Tạo `implementation_plan.md` trong **brain dir**. Mỗi Phase đi từng file một — **TUYỆT ĐỐI KHÔNG** dùng script Python/JS để chạy tắt hàng loạt.

**Quy tắc Question (bắt buộc cả trong chat thread lẫn implementation_plan):**

- Mọi question **BẮT BUỘC** đánh số rõ ràng (`Question 1`, `Question 2`...).
- Mọi question **BẮT BUỘC** có **≥3 lựa chọn** bao gồm: (1) Option cụ thể + dán nhãn `(Recommended)`, (2) Option `Other` (nhập text tự do), và (3) Option `Log as Tech Debt (Pending)`. (Lưu ý: ask_question tool tự thêm Other, nhưng trong Markdown plan phải viết đủ).
- **Task đơn (1 màn hình, nhiều gaps):** Hiển thị wizard form trong chat thread — từng question một, chờ Member trả lời xong mới chuyển question tiếp.
- **Task lớn (multi-screen/module):** Gom questions vào `implementation_plan.md` đánh số đầy đủ.

**QUAN TRỌNG — KHÔNG tạo file vật lý:**

- **TUYỆT ĐỐI KHÔNG** tạo file `TODO.md` vật lý trong repo đích.
- **TUYỆT ĐỐI KHÔNG** chỉ copy mục "Verification Checklist" ở cuối `SKILL.md`.
- Mỗi bước Workflow = một dòng checklist. Mỗi nhánh Accelerator = một dòng `if available / else fallback`.
- **TUYỆT ĐỐI KHÔNG** gộp bước. **TUYỆT ĐỐI KHÔNG** tick hàng loạt. **TUYỆT ĐỐI KHÔNG** in checklist tĩnh từ `AGENTS.md` thay cho Workflow bóc từ skill.

Verification Checklist ở cuối skill chỉ dùng **sau** để map evidence lên các dòng checklist đã derive từ Workflow — không phải nguồn sinh checklist.

---

## ĐẠO LUẬT 3 — CRITICAL RULE FOR EXECUTION (Plan trước khi write)

**Mục tiêu:** Không cho sinh YAML/code ngay trên RAM.

**TUYỆT ĐỐI KHÔNG** làm gộp. **TUYỆT ĐỐI KHÔNG** tạo thêm file plan rời (`*-plan.md`).

---

## ĐẠO LUẬT 4 — CRITICAL RULE — PHYSICAL OUTPUT IMMEDIATELY (No RAM Caching)

**Mục tiêu:** Triệt thiếu hụt do tràn context.

Bất cứ khi nào Agent sinh ra một kết quả bền (plan, proposal, bundle, summary bước), Agent **KHÔNG ĐƯỢC PHÉP** giữ nó dưới dạng ngữ cảnh lơ lửng trong RAM/chat.

**BẮT BUỘC** dùng tool ghi thẳng thành file vật lý **NGAY LẬP TỨC**.

Output vật lý của bước trước = Input vật lý của bước sau (đọc lại file, không nhớ).



---

## ĐẠO LUẬT 5 — CRITICAL RULE FOR DATA ORIGIN (Zero Business Hallucination)

**Mục tiêu:** Cấm bịa nghiệp vụ khi prompt thiếu.

Agent **chỉ** được phép lấy dữ liệu để điền Spec từ đúng **2 nguồn**:

1. Prompt của User
2. Evidence từ ArtifactGraph Registry (khi MCP available)

**TUYỆT ĐỐI KHÔNG** "tự suy nghĩ" hay tự bịa trường dữ liệu, validation, cột DB, flow, hoặc tag nghiệp vụ mới.

Cái gì thiếu → **BẮT BUỘC** để trống hoặc gắn `#missing_info` và nhường `/grill`.

**CẤM** thông minh đột xuất.

(Ngoại lệ cấu trúc: pattern tags **rõ ràng** suy từ prompt như list+delete → `#pattern: CRUD` — vẫn **CẤM** bịa field/business rule.)

---

## ĐẠO LUẬT 6 — CRITICAL RULE FOR GRILL PROCESS (Hard Confirmation Gate)

**Mục tiêu:** Grill = trợ lý phân tích cục bộ, không tự sửa lan man.

Khi rà `#missing_info` / lỗ hổng, Grill **BẮT BUỘC** 4 bước:

1. **Check lại ArtifactGraph** (nếu available) — Member khác có thể vừa cập nhật.
2. **Micro-scoping:** Chỉ suy luận đúng Block/Field thiếu. **TUYỆT ĐỐI** sửa lan man phần đã chốt.
3. **Đề xuất:** Dạng **wizard form** trong **Chat Thread** — hiển thị **từng question một**, chờ Member trả lời xong mới chuyển question tiếp. Mỗi question **BẮT BUỘC** có **≥3 lựa chọn** (Recommended, Other, Tech Debt).
4. **Hard Confirmation Gate:** Agent **BẮT BUỘC** chờ Member trả lời trên chat. Chỉ sau khi Member **chốt / Confirm**, Agent mới được phép cập nhật thẳng vào product SSOT (`.bundle.yaml`) và **Artifact Registry**.

---

## ĐẠO LUẬT 7 — CRITICAL RULE FOR DSL REGISTRY (Human-Dictated)

**Mục tiêu:** Cấm ảo tưởng quyền lực với kho Common/DSL.

Con người là thực thể **duy nhất** có quyền quyết định và cập nhật kho chuẩn mực DSL/Common.

Agent **KHÔNG CÓ QUYỀN** tự động phân tích và tự quyết định cái gì là "Common".

Agent chỉ là Thư ký — được đăng ký/cập nhật DSL/Common chỉ trong **3** trường hợp bị động:

1. User chủ động gọi `/common` hoặc `/common-spec`.
2. User chủ động gọi `/docs-mark` (ArtifactGraph) để đánh tag/rule cần nhớ.
3. Sau đề xuất `/grill` và User **BẤM DUYỆT (Confirm)**.

Ở `/spec` thông thường: nhiệm vụ duy nhất là **lôi DSL/common có sẵn ra dùng**.

**TUYỆT ĐỐI KHÔNG** tự ý ghi đè hay sáng tác thêm common/DSL.

---

## Thứ tự khóa bắt buộc mỗi skill run

```text
1) {{DOC_SKIT_READ_TOOL}} SKILL.md          → Đạo luật 1
4) mỗi kết quả bền → write file ngay (No RAM) → Đạo luật 4
5) data chỉ từ User | ArtifactGraph; gap → #missing_info → Đạo luật 5
6) grill → 4 bước + STOP chờ Confirm → Đạo luật 6
7) common/DSL chỉ khi /common|/common-spec|/docs-mark|Confirm → Đạo luật 7
```

Host overlay Antigravity: xem `AGENTS.md` (cùng 7 đạo luật).
