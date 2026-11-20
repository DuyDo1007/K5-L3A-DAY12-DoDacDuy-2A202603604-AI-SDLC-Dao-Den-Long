# Bằng chứng Kiểm chứng — Phase 3: Ticket-03 (Test Contract v1.2 "Đèn cạn dầu")

- **Ngày giờ kiểm chứng:** `2026-11-20T09:38:22.804Z`
- **Lệnh tái lập nhanh:** `node scripts/verify_phase.js --phase 3`
- **Môi trường:** Node.js `v24.11.0` on `win32 x64`

## 1. Bảng Truy vết Yêu cầu đến Bằng chứng

| Mã YC | Yêu cầu chính (Ticket-03 & Test Contract v1.2) | Cách kiểm chứng | File Bằng chứng Thực tế | Kết quả |
|---|---|---|---|:---:|
| **P3-R1** | Nhiên liệu đèn: max 100, tự hao 1.0/s, tắt khi hết dầu (`lantern_out`, `ever_lit = true`) | Unit test kiểm tra hao hụt và sự kiện `lantern_out` | [`unit-tests.log`](unit-tests.log) test 11 | **ĐẠT** |
| **P3-R2** | Châm dầu đèn đang sáng (`refuel`), nạp `ceil((100-fuel)/10)`, đèn đầy dầu không nhận | Unit test châm dầu, kiểm tra sự kiện `refuel` và điểm thưởng | [`unit-tests.log`](unit-tests.log) test 12 | **ĐẠT** |
| **P3-R3** | Thắp lại đèn cũ chỉ tốn 5 đom đóm (`relight_cost: 5`), phát `relight: true`, cộng +40đ | Unit test thắp lại đèn, kiểm tra đom đóm bị trừ và điểm số | [`unit-tests.log`](unit-tests.log) test 13 | **ĐẠT** |
| **P3-R4** | Bóng Mực hút dầu (`drain`) khi fuel < 30, hút 5/s, phát `fuel_drain` mỗi 60 tick | Unit test Shade chuyển sang drain và phát `fuel_drain` | [`unit-tests.log`](unit-tests.log) test 14 | **ĐẠT** |
| **P3-R5** | Đèn fuel >= 30 khôi phục vùng an toàn, đẩy Bóng Mực ra mép 6m trong 30 tick | Kiểm tra logic vùng an toàn động và đẩy lùi Shade | [`unit-tests.log`](unit-tests.log) test 5 & 14 | **ĐẠT** |
| **P3-R6** | Tỏa Sáng (Pulse) trúng Shade đang drain thưởng +15 điểm (thay vì +5) | Unit test pulse khi Shade đang drain, kiểm tra điểm số | [`unit-tests.log`](unit-tests.log) test 15 | **ĐẠT** |
| **P3-R7** | Sức chứa tăng dần: `capacity = min(20, 10 + 2 * successful_lights)` | Unit test kiểm tra tăng dung lượng theo số lần thắp đèn | [`unit-tests.log`](unit-tests.log) test 16 | **ĐẠT** |
| **P3-R8** | Luật thắng mới: Sống sót tới bình minh (`dawn_survived`) khi đủ >= 60% đèn sáng | Unit test kiểm tra kết thúc Đêm và lý do `dawn_survived` | [`unit-tests.log`](unit-tests.log) test 17 | **ĐẠT** |
| **P3-R9** | Test Contract v1.2: Snapshot bổ sung `fuel`, `ever_lit`, `relit_count`, `capacity`, `drain` | Chạy headless cả 3 Đêm, snapshot đầy đủ schema v1.2 | [`night1-daoben-v12.jsonl`](night1-daoben-v12.jsonl), [`night2-daocau-v12.jsonl`](night2-daocau-v12.jsonl), [`night3-daochuong-v12.jsonl`](night3-daochuong-v12.jsonl) | **ĐẠT** |
| **P3-R10** | Tính tất định 100% Contract v1.2 giữa 2 lần chạy | So khớp mã băm SHA-256 byte-for-byte | [`determinism.txt`](determinism.txt) | **ĐẠT** |
| **P3-R11** | Hiệu năng Headless: 1 Đêm đầy đủ (14.400 ticks / 240s) chạy trong ≤ 30s | Chạy 14.400 ticks trong ~0.06s (ngưỡng ≤ 30s) | [`perf-run.txt`](perf-run.txt) | **ĐẠT** |

## 2. Ghi nhận Hồi quy & Trung thực
- Toàn bộ 10 bài test hồi quy từ Phase 1 và Phase 2 vẫn giữ nguyên tính đúng đắn khi chuyển đổi luật sang Test Contract v1.2.
- 100% yêu cầu đổi luật cốt lõi trong Ticket-03 "Đèn cạn dầu" đã được kiểm chứng thực tế bằng máy tính, không có số liệu giả lập hay bỏ qua kiểm thử.
