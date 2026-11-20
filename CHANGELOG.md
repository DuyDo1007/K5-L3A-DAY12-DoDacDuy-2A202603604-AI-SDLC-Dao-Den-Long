# Lịch sử Thay đổi (CHANGELOG)

Tất cả thay đổi qua các Phase của dự án Đảo Đèn Lồng:

## [Phase 2: Ticket-02 — Ba hòn đảo (Test Contract v1.1)] - 2026-11-20
- **Chuẩn hóa Số liệu Thực nghiệm:**
  - Tốc độ chạy 6.0 m/s; Nhảy vận tốc 7.0 m/s, trọng lực -20 m/s².
  - Lướt (Dash): tốc độ 14.0 m/s trong 0.2s, hồi chiêu 1.5s.
  - Sức chứa đom đóm 10, nhặt XZ <= 1.0m và |dY| <= 1.5m.
  - Đèn Lồng chi phí 10 đom đóm, tương tác 2.0m, vùng an toàn 6.0m.
  - Pulse: chi phí 3 đom đóm, bán kính 5m, choáng 120 ticks, đẩy lùi 4m trong 15 ticks.
  - Bóng Mực: tốc độ 4.0 m/s (Đêm 3: 4.5 m/s), trạng thái chuẩn hóa (`spawning`, `wander`, `chase`, `recoil`, `stunned`).
  - Rơi khỏi đảo (Y < -10): mất 1 flame, mất toàn bộ đom đóm mang theo, chờ 60 ticks rồi hồi sinh tại (0,0,0) kèm bất tử 90 ticks.
- **Mở rộng 3 Đêm & Địa hình Mới:**
  - Đêm 1: Đảo Bến (R = 40m, 5 đèn L1..L5).
  - Đêm 2: Đảo Cau (2 đảo R=28m tâm (0,0) và (70,0), cầu tre, 2 bục nhảy phóng 24m/s, 6 đèn L1..L6).
  - Đêm 3: Đảo Chuông (3 tầng Y=0, Y=3, Y=6, dốc 30° và 150°, bục nhảy phóng lên tầng 2, gió mạnh 30s/lần, 7 đèn L1..L7).
- **Thực thể Mới & Cơ chế:**
  - Gió Lạc (Drifter): bay 7 m/s, cướp tối đa 3 đom đóm khi Mây mang >= 5 đom đóm; Pulse buộc Gió Lạc thả lại đom đóm.
  - Bùa Gió (Wind Charm C1, C2): tăng tốc 7.2 m/s và xóa hồi chiêu Lướt trong 600 ticks.
  - Tạm dừng (Pause / Resume): đóng băng mô phỏng khi nhận cờ `pause`.
- **Hiệu năng & Bằng chứng:**
  - Chạy 1 Đêm đầy đủ 18.000 ticks trong 0.06s (vượt xa yêu cầu <= 30s).
  - Xuất toàn bộ bằng chứng vào `docs/proof/phase-2/`.

## [Phase 1: PRD-0 & Test Contract v1.0] - 2026-11-20
- Khởi tạo kiến trúc Headless-First, Test Contract v1.0, 3D WebGL client, unit test suite và xuất bằng chứng vào `docs/proof/phase-1/`.
