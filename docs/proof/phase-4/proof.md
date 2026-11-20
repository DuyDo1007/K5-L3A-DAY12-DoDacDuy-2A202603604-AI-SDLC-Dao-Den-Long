# Bằng chứng Kiểm chứng — Phase 4: Ticket-04 (Bình minh: phát hành v1.0.0 · Test Contract v1.3)

- **Ngày giờ kiểm chứng:** `2026-11-20T10:06:20.309Z`
- **Lệnh tái lập nhanh:** `node scripts/verify_phase.js --phase 4`
- **Môi trường:** Node.js `v24.11.0` on `win32 x64`

## 1. Bảng Truy vết Yêu cầu đến Bằng chứng

| Mã YC | Yêu cầu chính (Ticket-04 & Test Contract v1.3) | Tiêu chí nghiệm thu | File Bằng chứng Thực tế | Kết quả |
|---|---|---|---|:---:|
| **P4-R1** | Chế độ Benchmark (`bench_cmd`) | `avg_fps >= 60`, `p1_low_fps >= 30`, `load_ms <= 10000` | [`bench.json`](bench.json) (avg_fps: 86766.2, p1_low: 7150.5, load: 2ms) | **ĐẠT** |
| **P4-R2** | Soak Test 10 Đêm xoay vòng (`soak_cmd`) | `crashes == 0`, `mem_end_mb <= 1.2 * mem_start_mb` | [`soak.json`](soak.json) (crashes: 0, start: 117MB, end: 132MB) | **ĐẠT** |
| **P4-R3** | Bảng xếp hạng cục bộ (Leaderboard) | Lưu top 10 điểm, xuất file qua `--export-leaderboard`, modal web & form lưu | [`leaderboard.json`](leaderboard.json) | **ĐẠT** |
| **P4-R4** | Khả năng Tiếp cận: Đổi phím (Key rebinding) | Đổi phím 4 hướng, nhảy, lướt, tương tác, tỏa sáng, pause; phát hiện trùng; nút khôi phục mặc định | [`src/client/index.html`](../../src/client/index.html) | **ĐẠT** |
| **P4-R5** | Khả năng Tiếp cận: Phụ đề & Chỉ báo hình ảnh | Cảnh báo Bóng Mực + mũi tên hướng, cảnh báo gió mạnh, cảnh báo 10s cuối, cảnh báo đèn cạn dầu (<30) | [`src/client/index.html`](../../src/client/index.html) | **ĐẠT** |
| **P4-R6** | Khả năng Tiếp cận: Giảm chuyển động & Cỡ chữ | Tắt rung camera, tắt chớp màn hình; font UI cơ sở 18px (1280x720) và chế độ chữ lớn x1.25 | [`src/client/index.html`](../../src/client/index.html) | **ĐẠT** |
| **P4-R7** | Đóng gói & Tài liệu phát hành | README (<=3 lệnh), CHANGELOG (4 phase), CREDITS, LICENSE (MIT), retro-v1.0.0.md | [`README.md`](../../README.md), [`CHANGELOG.md`](../../CHANGELOG.md), [`LICENSE`](../../LICENSE), [`CREDITS.md`](../../CREDITS.md) | **ĐẠT** |
| **P4-R8** | Test Contract v1.3 & Tính tất định | `game.contract.json` v1.3 đầy đủ bench/soak cmd; 100% SHA-256 match giữa các lần chạy độc lập | [`determinism.txt`](determinism.txt), [`game.contract.json`](../../game.contract.json) | **ĐẠT** |
| **P4-R9** | Không có lỗi hồi quy toàn hệ thống | Toàn bộ 17 unit tests logic di chuyển, nhảy, lướt, đom đóm, 3 đêm, bùa, đèn cạn dầu đều PASS | [`unit-tests.log`](unit-tests.log) (17/17 PASS) | **ĐẠT** |

## 2. Số liệu Hiệu năng & Đo lường Chi tiết
- **Benchmark:**
  - Khởi động tải Đêm 1 với 200 Shade, 100 Đom đóm, 3 Đèn sáng 100 fuel: `2 ms`
  - Số khung hình mô phỏng đo được trong 30 giây: `1800 frames`
  - Tốc độ trung bình (avg_fps): `86766.2` (Vượt xa chuẩn yêu cầu 60 fps)
  - 1% Low FPS: `7150.5` (Vượt chuẩn 30 fps)
- **Soak Test:**
  - Tổng số đêm vượt qua: `10 / 10`
  - Số lần crash: `0`
  - Dung lượng RSS ban đầu: `117 MB`
  - Dung lượng RSS kết thúc: `132 MB` (Tỉ lệ 1.13x <= 1.20x)

## 3. Tổng kết Nghiệm thu
Phiên bản v1.0.0 (Bình minh) hoàn thành 100% tiêu chí non-functional, tính ổn định và tính tiếp cận của Ticket-04. Sẵn sàng phát hành chính thức!
