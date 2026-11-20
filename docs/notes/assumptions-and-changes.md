# Giả định & Lịch sử Thay đổi Yêu cầu

Tài liệu ghi lại toàn bộ giả định thiết kế cho những chỗ mơ hồ trong PRD/Ticket và giải trình thay đổi khi luật game được cập nhật qua các Phase.

---

## Phase 1: PRD-0 & Test Contract v1.0
- Màn chơi Đêm 1 với 5 Đèn Lồng Lớn.
- Thử nghiệm ban đầu với các thông số tự chọn: player_speed 5.0 m/s, pickup_radius 1.5m, lantern_cost 3 đom đóm.

---

## Phase 2: Ticket-02 — "Ba hòn đảo" (Test Contract v1.1)

### 1. Đồng bộ Số liệu Chuẩn (Thay thế hoàn toàn các giá trị tự chọn ở Phase 1)
- **Tốc độ di chuyển:** `6.0 m/s` (thay vì 5.0 m/s).
- **Nhảy:** Vận tốc Y `7.0 m/s`, trọng lực `-20 m/s²`, chỉ nhảy khi chạm đất (`grounded = true`).
- **Lướt (Dash - Mới):** Tốc độ `14 m/s`, thời gian `0.2 s` (12 ticks), hồi chiêu `1.5 s` (90 ticks tính từ lúc bắt đầu lướt). Giữ nguyên độ cao trên không. Không bất tử khi lướt.
- **Sức chứa Đom đóm:** `10` (thay vì 5).
- **Nhặt đom đóm:** Tự động khi khoảng cách `XZ <= 1.0 m` và chênh cao `|dY| <= 1.5 m` (thay vì 1.5 m XZ).
- **Số lượng đom đóm:** 20 lúc bắt đầu, trần 30. Sinh thêm 1 tại các tick 240, 480, ...
- **Chi phí thắp Đèn Lồng:** `10` đom đóm (thay vì 3). Bán kính tương tác `2.0 m`.
- **Vùng an toàn của Đèn:** Bán kính `6.0 m`. Đẩy Bóng Mực ra mép trong tối đa 30 tick.
- **Tỏa Sáng (Pulse):** Chi phí `3` đom đóm, bán kính `5.0 m`, hồi chiêu `3.0 s` (180 ticks). Choáng 120 ticks, đẩy lùi 4m trong 15 tick đầu.
- **Bóng Mực (Shades):** Tốc độ `4.0 m/s` (Đêm 3: `4.5 m/s`). Phát hiện 12m, bỏ đuổi 18m. Va chạm `XZ <= 1.0 m` và `|dY| <= 1.5 m`. Recoil 2m trong 60 ticks.
- **Trạng thái Bóng Mực chuẩn hóa:** `spawning`, `wander`, `chase`, `recoil`, `stunned`.
- **Rơi khỏi đảo (Y < -10):** -1 Ngọn Lửa, mất toàn bộ đom đóm, chờ 60 ticks rồi hồi sinh tại (0,0,0) với vận tốc 0, bất tử 90 ticks.
- **Thời gian các Đêm:** Đêm 1: 300s, Đêm 2: 330s, Đêm 3: 360s.
- **Điểm chuẩn hóa:** +10 nạp đom đóm, +100 thắp đèn, +5 Pulse trúng Bóng Mực, thưởng thắng: floor(giây còn lại) * 2 + 50 * Ngọn Lửa còn lại.

### 2. Tính năng & Cơ chế Mới
- **Gió Lạc (Drifters):** Dải lụa xám xanh (7 m/s), tối đa 2 con, sinh lúc tick 1200, 2400, ... Cướp min(3, carried) đom đóm khi XZ <= 1.2m và Mây mang >= 5 đom đóm. Tỏa Sáng trúng lúc flee thì thả lại toàn bộ đom đóm.
- **Bùa Gió (Wind Charm):** Nhặt tăng tốc chạy lên 7.2 m/s và Lướt không hồi chiêu trong 600 ticks. Hồi lại sau 2700 ticks.
- **Bục Nhảy (Jump Pads - Đêm 2 & 3):** Phóng Mây với vận tốc xác định hướng về đảo đích / tầng cao.
- **Gió Mạnh (Đêm 3):** Mỗi 30s có gió kéo dài 5s đẩy 2 m/s.
- **Tạm dừng (Pause):** Hỗ trợ cờ pause từ input, tick tăng nhưng sim_tick và thế giới đứng yên, snapshot ghi `state: "paused"`.

---

## Phase 3: Ticket-03
*(Chờ phát hành)*

---

## Phase 4: Ticket-04
*(Chờ phát hành)*
