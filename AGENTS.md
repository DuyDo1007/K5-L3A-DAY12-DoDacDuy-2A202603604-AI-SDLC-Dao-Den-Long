# Hướng dẫn AI Agent: Đảo Đèn Lồng (AI SDLC)

## 1. Lệnh chuẩn
- Test logic & scenarios: `npm test`
- Chạy headless contract: `npm run headless -- <args>`
- Kiểm chứng & xuất bằng chứng: `npm run verify -- --phase <1|2|3|4>`
- Khởi động bản 3D: `npm start`

## 2. Quy tắc Bất Khả Xâm Phạm
- **Tách biệt Core và UI:** Thư mục `src/core/` tuyệt đối KHÔNG import thư viện đồ họa (`three`), DOM (`window`, `document`) hay I/O hệ thống.
- **Tính tất định 100%:** Trong `src/core/`, KHÔNG dùng `Math.random()`, `Date.now()`, `performance.now()`. Mọi ngẫu nhiên phải đi qua `SeededRNG(seed)`.
- **Không giả mạo bằng chứng:** Chỉ báo cáo ĐẠT khi `npm run verify` chạy thành công thật và tạo file output trong `docs/proof/phase-N/`.
- **Xử lý đổi luật (Phase 2/3/4):** Không âm thầm xóa test cũ bị sai; sửa hoặc deprecate test kèm chú thích lý do trong `docs/notes/assumptions-and-changes.md`.

## 3. Nhật ký Tiến hóa Harness (Harness Evolution Log)
- **Phase 1 (v1.0):** Khởi tạo bộ khung headless-first, seeded RNG, kiểm chứng tính tất định và pre-commit hook.
