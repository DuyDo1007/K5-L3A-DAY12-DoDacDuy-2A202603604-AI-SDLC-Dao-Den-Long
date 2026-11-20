# Lịch sử Thay đổi (CHANGELOG)

Tất cả các thay đổi đáng chú ý của dự án **Đảo Đèn Lồng (Lantern Island)** được ghi nhận tại đây theo định dạng [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) và tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - Phase 4: Ticket-04 — Bình minh: phát hành v1.0.0 - 2026-11-20

### Thêm mới (Added)
- **Chế độ Benchmark tự động (`bench_cmd`):**
  - Thực thi qua lệnh: `node scripts/benchmark.js --seed 42 --duration 30 --out bench.json` (hoặc `npm run bench`).
  - Cảnh chuẩn 1280x720 nạp Đêm 1 với 200 Bóng Mực wander, 100 đom đóm, 3 đèn sáng 100 fuel. Camera bay quỹ đạo R=30m, Y=15m quay quanh (0,0,0) chu kỳ 15s.
  - Tự động xuất kết quả `bench.json` đạt: `avg_fps >= 60`, `p1_low_fps >= 30`, `load_ms <= 10000`.
- **Chế độ Soak Test kiểm tra rò rỉ bộ nhớ (`soak_cmd`):**
  - Thực thi qua lệnh: `node scripts/soak_test.js --seed 7 --nights 10 --out soak.json` (hoặc `npm run soak`).
  - Chạy headless liên tục 10 Đêm xoay vòng (Đêm 1 -> 2 -> 3) với seed `7 + i`, giả lập input ngẫu nhiên tất định.
  - Tự động xuất kết quả `soak.json` đạt: `crashes == 0` và `mem_end_mb <= 1.2 * mem_start_mb`.
- **Bảng Xếp Hạng Cục Bộ (Local Leaderboard):**
  - Quản lý Top 10 điểm cao nhất trong `data/leaderboard.json`, kiểm tra tên hợp lệ regex `^[A-Za-z0-9_]{3,12}$`.
  - Xuất bảng xếp hạng qua CLI: `node src/headless/cli.js --export-leaderboard out.json` hoặc `npm run leaderboard -- --export out.json`.
  - Tích hợp Modal xem Top 10 và form lưu điểm tại màn hình Victory / Game Over kết nối REST API `GET /api/leaderboard` & `POST /api/leaderboard`.
- **Bộ Tính Năng Dễ Tiếp Cận (Accessibility Suite):**
  - **Đổi phím (Key Rebinding):** Tùy chỉnh các phím di chuyển, nhảy, lướt, tương tác, tỏa sáng, pause; tự động phát hiện trùng phím và nút khôi phục mặc định.
  - **Phụ đề & Chỉ báo Hình ảnh (Visual Indicators & Subtitles):** Cảnh báo Bóng Mực tiếp cận kèm mũi tên chỉ hướng mép màn hình, cảnh báo gió mạnh sắp quét qua, cảnh báo 10s cuối, cảnh báo đèn sắp cạn dầu (< 30 fuel).
  - **Giảm chuyển động (Reduce Motion):** Tùy chọn tắt hoàn toàn hiệu ứng rung camera và chớp màn hình.
  - **Kích thước chữ & Mù màu:** Cỡ chữ UI mặc định >= 18px (ở 1280x720), chế độ chữ lớn x1.25, và bộ lọc màu sắc cho người khiếm thị màu.
- **Tài liệu & Đóng gói Phát hành:**
  - `README.md` chuẩn hóa với tối đa 3 lệnh cài đặt và chạy.
  - Báo cáo Retrospective `docs/notes/retro-v1.0.0.md`.
  - Giấy phép MIT `LICENSE` và danh mục bản quyền `CREDITS.md`.
  - Hợp đồng kiểm thử `game.contract.json` v1.3.

---

## [0.3.0] - Phase 3: Ticket-03 — Change Request "Đèn cạn dầu" - 2026-11-20

### Thay đổi (Changed)
- **Nhiên liệu đèn lồng:**
  - Nhiên liệu tối đa: 100, hao hụt tự nhiên 1.0 fuel/giây (1/60 fuel mỗi tick).
  - Khi fuel <= 0: đèn tắt, chuyển về `deposited = 0`, phát sự kiện `lantern_out`, ghi nhớ `ever_lit = true`.
  - Châm dầu: tương tác ở đèn đang sáng nạp `used = min(carried, ceil((100 - fuel) / 10))`, cộng +10 điểm. Đèn đầy dầu (100) không nhận thêm.
  - Thắp lại đèn cũ: chỉ tốn 5 đom đóm (`relight_cost: 5`), phát sự kiện `relight: true`, cộng +40 điểm.
- **Kẻ địch Bóng Mực hút dầu:**
  - Khi đèn có `fuel < 30`, vùng an toàn bị mất tạm thời, Bóng Mực đổi trạng thái sang `drain`, tiếp cận hút 5 fuel/giây và phát sự kiện `fuel_drain` mỗi 60 tick.
  - Khi đèn hồi phục `fuel >= 30`, vùng an toàn 6m được kích hoạt lại đẩy lùi Bóng Mực trong 30 tick.
  - Thưởng Pulse: làm choáng Bóng Mực đang hút dầu được +15 điểm (thay vì +5).
- **Luật Thắng Mới (Dawn Survived):**
  - Mục tiêu chuyển từ "thắp hết đèn" sang "giữ đèn sáng tới bình minh". Thắng khi hết thời gian đêm (240s/270s/300s) mà số đèn sáng >= 60% tổng số đèn.
- **Sức chứa tăng dần:**
  - Dung lượng đom đóm tối đa tăng theo công thức: `capacity = min(20, 10 + 2 * successful_lights)`.
- **Nâng cấp Test Contract v1.2:**
  - Snapshot headless bổ sung: `fuel`, `ever_lit`, `relit_count`, `capacity`, và trường `drain` trong mảng `shades`.

---

## [0.2.0] - Phase 2: Ticket-02 — Ba hòn đảo - 2026-11-20

### Thêm mới (Added)
- **Chuẩn hóa Thông số Di chuyển:**
  - Tốc độ chạy 6.0 m/s; Nhảy 7.0 m/s; Trọng lực -20 m/s².
  - Kỹ năng Lướt (Dash): 14.0 m/s trong 0.2s, thời gian hồi chiêu 1.5s.
- **Mở rộng 3 Đêm & Địa hình Độc đáo:**
  - Đêm 1: Đảo Bến (bán kính 40m, 5 đèn L1..L5).
  - Đêm 2: Đảo Cau (2 hòn đảo nối bằng cầu tre, 2 bục nhảy phóng 24m/s, 6 đèn L1..L6).
  - Đêm 3: Đảo Chuông (3 tầng địa hình giật cấp Y=0, Y=3, Y=6, dốc trượt 30° và 150°, bục nhảy, gió thổi 30s/lần, 7 đèn L1..L7).
- **Thực thể Mới:**
  - Gió Lạc (Drifter): bay 7 m/s, cướp 3 đom đóm khi Mây mang >= 5 đom đóm; Pulse làm rơi lại đom đóm (`drifter_drop`).
  - Bùa Gió (Wind Charm C1, C2): tăng tốc 7.2 m/s và xóa hồi chiêu Lướt trong 600 ticks.
- **Cơ chế Tạm dừng (Pause / Resume):**
  - Đóng băng toàn bộ mô phỏng khi nhận sự kiện `pause`, phát sự kiện `paused` và `resumed`.
- **Nâng cấp Test Contract v1.1:**
  - Snapshot headless bổ sung mảng `drifters` và `charms`.

---

## [0.1.0] - Phase 1: PRD-0 — Khởi đầu Đảo Đèn Lồng - 2026-11-20

### Thêm mới (Added)
- Kiến trúc mô phỏng **Headless-First** độc lập hoàn toàn với Three.js và DOM.
- Hệ thống tạo số ngẫu nhiên tất định `SeededRNG` (thuật toán Mulberry32).
- Bộ công cụ dòng lệnh Headless CLI `src/headless/cli.js`.
- Mô phỏng Đêm 1 (Đảo Bến) với nhân vật Mây, đom đóm, 5 đèn lồng và kẻ địch Bóng Mực.
- Client 3D WebGL (Three.js) với góc nhìn thứ ba, hiệu ứng ánh sáng đèn lồng và âm thanh thủ tục WebAudio.
- Bộ kịch bản kiểm thử S1 (Collect & Light) và Test Contract v1.0.
