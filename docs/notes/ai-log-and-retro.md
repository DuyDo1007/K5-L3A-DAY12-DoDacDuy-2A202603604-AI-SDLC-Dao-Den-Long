# Nhật ký AI, Quản lý Token & Đánh giá Dự án

## 1. Nhật ký Ước tính Token & Chi phí

| Phase | Model / Công cụ | Số lượt tương tác | Token Ước tính (In / Out) | Chi phí ước tính ($) | Biện pháp tiết kiệm token đã áp dụng |
|---|---|---:|---:|---:|---|
| CP0: Chuẩn bị | Gemini Flash | 4 | ~15k / ~4k | ~$0.005 | Khung mẫu gọn, AGENTS.md < 50 dòng, tách riêng core |
| Phase 1: PRD-0 | Gemini Flash | 12 | ~35k / ~9k | ~$0.012 | Lấy trực tiếp Test Contract từ Lab Board, viết unit test trước khi build 3D |
| Phase 2: Ticket-02 | Chờ phát hành | - | - | - | |
| Phase 3: Ticket-03 | Chờ phát hành | - | - | - | |
| Phase 4: Ticket-04 | Chờ phát hành | - | - | - | |
| **Tổng cộng** | | **16** | **~50k / ~13k** | **~$0.017** | |

---

## 2. Nhật ký Phân tích Lỗi của AI & Cập nhật Harness

| Phase | Lỗi gặp phải (AI Failure Mode) | Cách phát hiện | Hành động sửa Harness / Code |
|---|---|---|---|
| Phase 1 | Khi load scenario có `time_left_s` tùy chỉnh, hàm step ban đầu lại reset về `config.night1_duration_s` mặc định | Chạy kịch bản S4 phát hiện `time_left_s` nhảy về 299.8 thay vì 199.8 | Đã cập nhật `initial_duration_s` trong `loadScenario` và kiểm tra lại toàn bộ kịch bản |

---

## 3. Đánh giá Từng Phase (Phase Evaluations)

### Đánh giá Phase 1 (PRD-0 & Test Contract v1.0):
- **Yêu cầu đạt:** Đạt 100% (7/7 tiêu chí): Headless CLI theo Test Contract v1.0, tính tất định 100% SHA-256 match, Mây nhặt đom đóm, nạp ánh sáng vào 5 Đèn Lồng Lớn, Pulse xua đuổi Bóng Mực, Bóng Mực gây sát thương, thắng khi thắp 5 đèn.
- **Kiểm tra hồi quy:** N/A (Phase 1 là nền móng ban đầu).
- **Điểm cần cải thiện:** Giữ nguyên tính tất định khi bổ sung tính năng ở Phase 2 và 3; cập nhật test cũ minh bạch nếu có thay đổi luật.

---

## 4. Retrospective Cuối Dự Án (Sau Phase 4)
*(Sẽ hoàn thiện sau khi hoàn thành Phase 4)*
