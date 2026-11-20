# ADR 003: Quản lý Nhiên liệu Đèn Lồng và Luật Thắng Bình Minh (Phase 3 - Ticket-03)

- **Trạng thái:** ĐÃ PHÊ DUYỆT (ACCEPTED)
- **Ngày:** 2026-11-20
- **Tác giả:** AI SDLC Autonomous Agent
- **Phiên bản Contract:** v1.2

## 1. Bối cảnh (Context)
Trong Phase 1 và Phase 2, đèn lồng một khi đã thắp sáng bằng 10 đom đóm thì sẽ sáng vĩnh viễn và tạo vùng an toàn 6m bất khả xâm phạm. Kết quả playtest cho thấy người chơi giỏi có thể thắp hết đèn chỉ trong 2 phút rồi game kết thúc ngay (`all_lit`), làm mất đi sự căng thẳng, kịch tính ở nửa sau của Đêm.
Để giải quyết vấn đề này, Nhà thiết kế trò chơi phát hành Ticket-03 với Change Request chuyển đổi trải nghiệm từ *"thắp hết đèn để thắng sớm"* sang *"quản lý tài nguyên và giữ đảo sáng tới bình minh"*.

## 2. Quyết định Thiết kế (Decisions)

### 2.1. Cơ chế Nhiên liệu Đèn (Lamp Fuel Decay & Refueling)
- **Quy chuẩn:** Nhiên liệu đèn tối đa là 100 đơn vị. Khi vừa thắp (lần đầu hoặc thắp lại), `fuel = 100`.
- **Hao hụt tự nhiên:** 1.0 đơn vị/giây (tương ứng `1/60` mỗi simulation tick).
- **Tránh sai số số thực:** Trong engine lõi (`src/core/simulation.js`), nhiên liệu được lưu trữ và tính toán bằng đơn vị nguyên số ticks `fuelTicks` (tối đa `6000 ticks = 100 fuel`). Mỗi tick tự trừ 1 tick nguyên. Điều này đảm bảo tính tất định 100% trên mọi nền tảng phần cứng mà không gặp lỗi làm tròn IEEE 754.
- **Châm dầu (Refueling):**
  - Công thức: `used = min(carried, ceil((100 - fuel) / 10))`
  - Cập nhật: `fuel = min(100, fuel + 10 * used)`
  - Đèn đầy dầu (`fuel == 100`, tức `used == 0`) bị loại khỏi danh sách chọn khi tương tác, không nhận đom đóm, không phát sự kiện và không cộng điểm.
- **Hết dầu (`fuel <= 0`):**
  - Đèn tắt, `deposited = 0`, phát sự kiện `lantern_out`, ghi nhớ cờ `ever_lit = true`.
  - Đèn `ever_lit` khi thắp lại chỉ cần 5 đom đóm (`relight_cost = 5`), thưởng +40 điểm (thay vì +100 điểm khi thắp lần đầu).

### 2.2. Bóng Mực Hút Dầu (Shade Oil Draining)
- **Vùng an toàn động:** Đèn có `fuel < 30` lập tức mất vùng an toàn 6m (đúng 30 vẫn còn).
- **Hành vi Bóng Mực:** Bóng Mực ở trạng thái `wander` ưu tiên tìm đến ngọn đèn sáng có `fuel < 30` gần nhất. Khi đến cách mép đèn `dXZ <= 2.0m`, chuyển sang trạng thái mới `drain`, đứng yên hút dầu với tốc độ 5.0 đơn vị/s (`5 ticks / tick`). Phát sự kiện `fuel_drain` mỗi 60 tick (chu kỳ 1 giây).
- **Phản ứng khẩn cấp:**
  - Nếu người chơi châm dầu ngọn đèn lên `>= 30`, vùng an toàn được kích hoạt lại và đẩy toàn bộ Bóng Mực trong 6m ra ngoài mép trong vòng 30 ticks.
  - Tỏa Sáng (Pulse) trúng Bóng Mực đang `drain` được thưởng đặc biệt **+15 điểm** (thay vì +5 điểm thông thường).

### 2.3. Luật Thắng/Thua Bình Minh (Dawn Survival Win Condition)
- **Bãi bỏ luật thắng sớm:** Không còn kết thúc sớm khi toàn bộ đèn sáng.
- **Thời lượng Đêm mới:** Đêm 1: 240s; Đêm 2: 270s; Đêm 3: 300s.
- **Điều kiện thắng:** Khi hết giờ (`time_left_s <= 0`), nếu Mây còn sống (`flames > 0`) và số đèn đang sáng tại tick cuối `>= ceil(0.6 * tổng đèn)` (Đêm 1: 3/5, Đêm 2: 4/6, Đêm 3: 5/7) thì đạt chiến thắng với lý do `dawn_survived`.
- **Thưởng bình minh:** Mỗi đèn đang sáng được cộng `+50 + floor(fuel)` điểm; mỗi Ngọn Lửa còn lại cộng `+50` điểm.

### 2.4. Sức Chứa Tăng Dần (Scaling Carry Capacity)
- Sức chứa đom đóm của Mây mở rộng theo công thức:
  `capacity = min(20, 10 + 2 * successful_lights)`
  (Khởi đầu 10, tăng +2 sau mỗi lần thắp sáng thành công một ngọn đèn, tối đa 20 đom đóm).

## 3. Hệ quả (Consequences)
- **Tích cực:** Trò chơi có nhịp độ dồn dập, đòi hỏi chiến thuật di chuyển liên tục giữa các cụm đèn, không còn hiện tượng "AFK chờ hết giờ".
- **Tương thích ngược:** Test Contract nâng cấp lên v1.2, bổ sung trường `fuel`, `ever_lit`, `relit_count` vào snapshot đèn và `capacity` vào snapshot người chơi mà không làm gãy các luồng điều khiển trước đó.
