# Nhật ký AI, Quản lý Token & Đánh giá Dự án

## 1. Nhật ký Ước tính Token & Chi phí

| Phase | Model / Công cụ | Số lượt tương tác | Token Ước tính (In / Out) | Chi phí ước tính ($) | Biện pháp tiết kiệm token đã áp dụng |
|---|---|---:|---:|---:|---|
| CP0: Chuẩn bị | Gemini Flash | 4 | ~15k / ~4k | ~$0.005 | Khung mẫu gọn, AGENTS.md < 50 dòng, tách riêng core |
| Phase 1: PRD-0 | Gemini Flash | 12 | ~35k / ~9k | ~$0.012 | Lấy trực tiếp Test Contract từ Lab Board, viết test trước khi code |
| Phase 2: Ticket-02 | Gemini Flash | 8 | ~28k / ~7k | ~$0.009 | Bám sát spec Ticket-02, cập nhật trực tiếp core engine, tái sử dụng verification runner |
| Phase 3: Ticket-03 | Chờ phát hành | - | - | - | |
| Phase 4: Ticket-04 | Chờ phát hành | - | - | - | |
| **Tổng cộng** | | **24** | **~78k / ~20k** | **~$0.026** | |

---

## 2. Nhật ký Phân tích Lỗi của AI & Cập nhật Harness

| Phase | Lỗi gặp phải (AI Failure Mode) | Cách phát hiện | Hành động sửa Harness / Code |
|---|---|---|---|
| Phase 1 | Khi load scenario có `time_left_s` tùy chỉnh, hàm step ban đầu lại reset về `config.night1_duration_s` mặc định | Chạy kịch bản S4 phát hiện `time_left_s` nhảy về 299.8 thay vì 199.8 | Đã cập nhật `initial_duration_s` trong `loadScenario` và kiểm tra lại toàn bộ kịch bản |
| Phase 2 | Test nhảy ban đầu so sánh `vel[1] === 7.0` nhưng trên thực tế ngay sau tick 1 trọng lực `-20 m/s²` đã tác động làm giảm vận tốc xuống 6.67 m/s | Chạy `npm test` báo lỗi assertion vận tốc | Đã cập nhật test để kiểm tra vận tốc sau 1 tick và độ cao `pos[1] > 0`, đồng thời kiểm tra tiếp đất sau 45 ticks |

---

## 3. Đánh giá Từng Phase (Phase Evaluations)

### Đánh giá Phase 1 (PRD-0 & Test Contract v1.0):
- **Yêu cầu đạt:** Đạt 100% (7/7 tiêu chí): Headless CLI theo Test Contract v1.0, tính tất định 100% SHA-256 match, Mây nhặt đom đóm, nạp ánh sáng vào 5 Đèn Lồng Lớn, Pulse xua đuổi Bóng Mực, Bóng Mực gây sát thương, thắng khi thắp 5 đèn.

### Đánh giá Phase 2 (Ticket-02 & Test Contract v1.1):
- **Yêu cầu đạt:** Đạt 100% (11/11 tiêu chí): Số liệu chuẩn hóa, Lướt (Dash), Nhảy & Trọng lực, Sức chứa đom đóm 10, Đèn lồng 10 đom đóm & vùng an toàn 6m, Gió Lạc (Drifter) cướp & thả đom đóm, Bùa Gió (Wind Charm), Tạm dừng (Pause), Rơi khỏi đảo & hồi sinh, 3 Đêm (Đảo Bến, Đảo Cau, Đảo Chuông), Tính tất định 100%, Hiệu năng 18.000 ticks chỉ mất 0.06s (ngưỡng ≤ 30s).
- **Kiểm tra hồi quy:** Mọi kịch bản của Phase 1 vẫn chạy mượt mà trên hệ số chuẩn hóa.
- **Điểm cần cải thiện:** Giữ vững tốc độ và tính tất định khi chuyển tiếp sang Phase 3.

---

## 4. Retrospective Cuối Dự Án (Sau Phase 4)
*(Sẽ hoàn thiện sau khi hoàn thành Phase 4)*
