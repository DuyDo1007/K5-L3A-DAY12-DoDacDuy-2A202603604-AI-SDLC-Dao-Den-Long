# Changelog Phase 3: Breaking Changes & Test Suite Updates (Contract v1.2)

## 1. Tóm tắt Thay đổi Lớn (Breaking Changes)

| Hạng mục | Luật cũ (Phase 1 & 2 - Contract v1.1) | Luật mới (Phase 3 - Ticket-03 - Contract v1.2) | Lý do thay đổi / Tác động |
|---|---|---|---|
| **Trạng thái Đèn sáng** | Đèn sáng vĩnh viễn, không bao giờ tắt | Đèn tự hao 1.0 fuel/s. Khi fuel <= 0 đèn tắt (`lantern_out`), nhớ `ever_lit = true` | Tăng áp lực quản lý tài nguyên |
| **Tương tác Đèn sáng** | Đèn đã sáng từ chối nhận thêm đom đóm | Nhận châm dầu (`refuel`) bù đắp lượng dầu hao hụt: `used = min(carried, ceil((100-fuel)/10))` | Cho phép duy trì ngọn đèn yêu thích |
| **Chi phí Thắp lại** | Đèn không bao giờ phải thắp lại | Đèn đã từng sáng (`ever_lit: true`) chỉ tốn 5 đom đóm để thắp lại (thay vì 10) | Giảm độ trừng phạt khi đèn lỡ tắt |
| **Vùng an toàn** | Bán kính 6m luôn chặn Bóng Mực | Đèn `fuel < 30` mất hoàn toàn vùng an toàn; Bóng Mực vào đứng hút 5 fuel/s | Tạo kịch bản giải cứu ngọn đèn nguy cấp |
| **Điều kiện Thắng** | Thắng ngay khi thắp đủ 100% đèn (`all_lit`) | Chạy hết toàn bộ thời gian Đêm (240/270/300s); thắng `dawn_survived` nếu giữ được >= 60% đèn sáng | Chấm dứt hiện tượng kết thúc sớm nhàm chán |
| **Sức chứa Đom đóm** | Cố định 10 đom đóm | Tăng dần: `capacity = min(20, 10 + 2 * successful_lights)` (tối đa 20) | Thưởng cho người chơi tích cực thắp đèn |
| **Hệ thống Điểm** | Điểm cũ theo phase trước | +5 mỗi đom đóm nạp; +100 thắp đầu; +40 thắp lại; +15 Pulse diệt Shade đang drain; điểm bình minh: mỗi đèn `+50 + floor(fuel)`, mỗi flame `+50` | Cân đối thang điểm công bằng |

## 2. Cập nhật và Bảo lưu Test Suite (`tests/run_tests.js`)

Theo nguyên tắc bất khả xâm phạm tại `AGENTS.md`: *"Không âm thầm xóa test cũ bị sai; sửa hoặc deprecate test kèm chú thích lý do"*.

1. **Test 10 (Tính tất định):**
   - Đã nâng cấp kiểm tra SHA-256 byte-for-byte với snapshot Contract v1.2 chứa các trường `fuel`, `ever_lit`, `capacity`, và `drain`.
2. **Thêm Test 11 (Hao hụt & Tắt đèn):**
   - Kiểm tra cơ chế hao dầu 1.0 fuel/s, sự kiện `lantern_out` và cờ `ever_lit = true`.
3. **Thêm Test 12 (Châm dầu):**
   - Kiểm tra tính toán `ceil((100-fuel)/10)`, sự kiện `refuel` và loại trừ đèn đầy dầu.
4. **Thêm Test 13 (Thắp lại đèn cũ):**
   - Kiểm tra chi phí thắp lại chỉ 5 đom đóm và điểm thưởng +40.
5. **Thêm Test 14 (Bóng Mực hút dầu):**
   - Kiểm tra Shade chuyển trạng thái `drain` khi fuel < 30 và phát sự kiện `fuel_drain` chu kỳ 60 tick.
6. **Thêm Test 15 (Thưởng Pulse khi Shade đang drain):**
   - Kiểm tra cộng đúng +15 điểm khi giải cứu đèn bị hút dầu.
7. **Thêm Test 16 (Sức chứa tăng dần):**
   - Kiểm tra công thức `capacity = min(20, 10 + 2 * successful_lights)`.
8. **Thêm Test 17 (Luật thắng bình minh):**
   - Kiểm tra hết giờ sống sót `dawn_survived` với >= 60% đèn sáng.
