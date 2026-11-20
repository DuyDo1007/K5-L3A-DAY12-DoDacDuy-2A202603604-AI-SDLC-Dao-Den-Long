# Giả định, Lịch sử Thay đổi & Acceptance Criteria

Tài liệu ghi lại toàn bộ giả định thiết kế, giải trình thay đổi và Tiêu chí Nghiệm thu (Acceptance Criteria - AC) cho các tính năng của dự án Đảo Đèn Lồng.

---

## Phase 1: PRD-0 & Test Contract v1.0
- Màn chơi Đêm 1 với 5 Đèn Lồng Lớn.
- Thử nghiệm ban đầu với các thông số tự chọn: player_speed 5.0 m/s, pickup_radius 1.5m, lantern_cost 3 đom đóm.

---

## Phase 2: Ticket-02 — "Ba hòn đảo" (Test Contract v1.1)

### 1. Đồng bộ Số liệu Chuẩn
- **Tốc độ di chuyển:** `6.0 m/s` (thay vì 5.0 m/s).
- **Nhảy:** Vận tốc Y `7.0 m/s`, trọng lực `-20 m/s²`, chỉ nhảy khi chạm đất (`grounded = true`).
- **Lướt (Dash):** Tốc độ `14 m/s`, thời gian `0.2 s` (12 ticks), hồi chiêu `1.5 s` (90 ticks).
- **Sức chứa Đom đóm:** `10`.
- **Nhặt đom đóm:** Tự động khi `XZ <= 1.0 m` và `|dY| <= 1.5 m`.
- **Chi phí thắp Đèn Lồng:** `10` đom đóm. Bán kính tương tác `2.0 m`.
- **Vùng an toàn:** `6.0 m`. Đẩy Bóng Mực ra mép trong 30 tick.
- **Tỏa Sáng (Pulse):** Chi phí `3` đom đóm, bán kính `5.0 m`, hồi chiêu `3.0 s`. Choáng 120 ticks, đẩy lùi 4m trong 15 ticks.
- **Bóng Mực (Shades):** Tốc độ `4.0 m/s` (Đêm 3: `4.5 m/s`). Phát hiện 12m, bỏ đuổi 18m.
- **Rơi khỏi đảo (Y < -10):** -1 Flame, mất toàn bộ đom đóm, chờ 60 ticks rồi hồi sinh tại (0,0,0) kèm bất tử 90 ticks.
- **Thời gian các Đêm:** Đêm 1: 300s, Đêm 2: 330s, Đêm 3: 360s.

---

### 2. Tiêu chí Nghiệm thu Chi tiết cho Phần 3 (Acceptance Criteria - AC)

#### AC-01: Gió Lạc (Drifters) — Đêm 2 và Đêm 3
- [x] **AC-01.1:** Gió Lạc di chuyển với tốc độ lướt nhanh 7 m/s khi chase/flee và 2 m/s khi idle; tối đa 2 con đồng thời; xuất hiện tại tick 1200, 2400, ... với id `D1`, `D2`, ...
- [x] **AC-01.2:** Chuyển từ `idle` sang `chase` khi Mây mang >= 5 đom đóm và khoảng cách <= 15 m. Nếu Mây mang < 5 đom đóm hoặc ra xa > 15 m thì quay lại `idle`.
- [x] **AC-01.3:** Khi chạm Mây (XZ <= 1.2 m): cướp `min(3, đang mang)` đom đóm, phát sự kiện `drifter_steal`, chuyển trạng thái `flee` bay ra xa Mây trong 240 tick rồi biến mất cùng số đom đóm đã cướp. Mỗi con chỉ cướp 1 lần.
- [x] **AC-01.4:** Tỏa Sáng trúng Gió Lạc đang `chase` thì nó chuyển `flee` không cướp; nếu trúng lúc `flee` đang mang đồ thì thả lại toàn bộ đom đóm đã cướp tại chỗ qua sự kiện `drifter_drop` (thành đom đóm rơi tồn tại 480 tick), Gió Lạc biến mất sau 120 tick.
- [x] **AC-01.5:** Gió Lạc không làm mất Ngọn Lửa của Mây; vùng an toàn của đèn lồng không chặn Gió Lạc; trạng thái bất tử của Mây không ngăn bị cướp đom đóm.

#### AC-02: Bùa Gió (Wind Charm)
- [x] **AC-02.1:** Lá bùa mang id `C1`, `C2`, nhặt tự động khi XZ <= 1.0 m và |dY| <= 1.5 m. Phát sự kiện `charm_picked` với `charm_ticks: 600`.
- [x] **AC-02.2:** Trong 600 tick hiệu lực: tốc độ chạy của Mây tăng lên 7.2 m/s và kỹ năng Lướt (Dash) không có thời gian hồi chiêu (nhấn khi đang lướt bị bỏ qua; lướt 14 m/s trong 12 tick).
- [x] **AC-02.3:** Bùa xuất hiện lại tại vị trí cũ sau 2700 tick (45 giây).
- [x] **AC-02.4:** Vị trí đặt bùa: Đêm 2 tại `(35, 0, 0)`; Đêm 3 tại `(30, 0, 25)` và `(-30, 0, 25)`.

#### AC-03: Chuỗi 3 Đêm & Vòng chơi
- [x] **AC-03.1:** Hỗ trợ đủ 3 Đêm với màn chơi và địa hình riêng biệt: Đêm 1 (Đảo Bến - 5 đèn), Đêm 2 (Đảo Cau - 6 đèn, cầu tre, 2 bục nhảy), Đêm 3 (Đảo Chuông - 7 đèn, 3 tầng, 2 dốc, tháp chuông, bục nhảy lên tầng 2, gió mạnh).
- [x] **AC-03.2:** Thắng màn khi thắp sáng toàn bộ đèn lồng của đêm đó. Thua khi hết Ngọn Lửa (`no_flames`) hoặc hết thời gian đêm (`dawn`).
- [x] **AC-03.3:** Tổng điểm game tích lũy qua các đêm đã thắng.

#### AC-04: Tạm dừng (Pause / Resume)
- [x] **AC-04.1:** Nhận input `pause: true` (kích hoạt khi false -> true); phát sự kiện `paused`.
- [x] **AC-04.2:** Khi tạm dừng: `state` ghi nhận `"paused"`, `tick` vẫn tăng nhưng `sim_tick`, thời gian, hồi chiêu, spawn, TTL đom đóm đều đóng băng hoàn toàn.
- [x] **AC-04.3:** Nhận input `pause` tiếp theo: phát sự kiện `resumed`, `state` trở về `"playing"`.

#### AC-05: Cài đặt (Settings)
- [x] **AC-05.1:** Giao diện hỗ trợ tùy chỉnh âm lượng và độ nhạy chuột, lưu trữ qua `localStorage` giữa các lần mở game.

#### AC-06: Âm thanh (Audio)
- [x] **AC-06.1:** Tạo bằng WebAudio API độc lập, có hiệu ứng âm thanh cho: nhặt đom đóm, thắp đèn, tỏa sáng (Pulse), bị đánh (hit), nhảy, lướt (dash), thắng màn, thua cuộc, và cảnh báo gió mạnh.

#### AC-07: HUD Đầy đủ & Bảng màu Chuẩn
- [x] **AC-07.1:** Hiển thị 3 Ngọn Lửa, đồng hồ đếm ngược `mm:ss`, tiến độ đèn `k/n`, điểm số, thanh đom đóm 10 ô, biểu tượng hồi chiêu Lướt và Tỏa Sáng, nhắc tương tác `E — Nạp ánh sáng`.
- [x] **AC-07.2:** Áp dụng bảng màu chuẩn: Trời đêm `#0E1430`, Đèn sáng `#FFB347`, Đom đóm `#FFF6C2`, Bóng Mực `#120A1A`, Áo Mây `#E8E2D0`, Bùa Gió `#C8102E`, Gió Lạc `#8FA3B8`.
- [x] **AC-07.3:** Cường độ ánh sáng môi trường tăng tuyến tính: `0.15 + 0.55 * (đèn sáng / tổng đèn)`.

---

## Phase 3: Ticket-03 — "Đèn cạn dầu" (Test Contract v1.2)

### 1. Thay đổi cốt lõi & Giả định (ADR 003)
- **Nhiên liệu đèn:** Max 100. Tự hao 1.0 fuel/s (`1/60` mỗi tick). Hết dầu đèn tắt (`lantern_out`), `ever_lit = true`.
- **Châm dầu:** `used = min(carried, ceil((100 - fuel) / 10))`, `fuel = min(100, fuel + 10 * used)`. Đèn đầy dầu (100) không được chọn khi tương tác.
- **Thắp lại:** Đèn `ever_lit` chỉ cần 5 đom đóm, thưởng +40 điểm (lần đầu +100 điểm).
- **Bóng Mực hút dầu:** Đèn `fuel < 30` mất vùng an toàn. Shade `wander` ưu tiên đi tới đèn sáng yếu gần nhất, đến cách <= 2.0m chuyển sang `drain`, hút 5 fuel/s, phát `fuel_drain` mỗi 60 tick.
- **Giải cứu đèn:** Châm dầu đèn lên >= 30 kích hoạt lại vùng an toàn 6m, đẩy Shade ra ngoài trong 30 tick. Pulse trúng Shade đang `drain` thưởng **+15 điểm**.
- **Luật thắng mới (Bình minh):** Bỏ thắng sớm (`all_lit`). Thời gian Đêm 1/2/3: 240 / 270 / 300 s. Thắng `dawn_survived` khi hết giờ mà Mây còn sống và số đèn đang sáng >= ceil(0.6 * tổng đèn) (Đêm 1: 3/5, Đêm 2: 4/6, Đêm 3: 5/7). Thua khi hết ngọn lửa (`no_flames`) hoặc hết giờ thiếu đèn (`dawn`).
- **Sức chứa tăng dần:** `capacity = min(20, 10 + 2 * successful_lights)` (tối đa 20 đom đóm).
- **Hệ số điểm mới:** +5 mỗi đom đóm nạp; +100 thắp đầu; +40 thắp lại; +15 diệt Shade drain; Bình minh: mỗi đèn sáng `+50 + floor(fuel)`, mỗi flame `+50`.

---

## Phase 4: Ticket-04
*(Chờ phát hành)*
