# Bằng chứng Kiểm chứng — Phase 2: Ticket-02 (Test Contract v1.1)

- **Ngày giờ kiểm chứng:** `2026-11-20T09:21:58.403Z`
- **Lệnh tái lập nhanh:** `node scripts/verify_phase.js --phase 2`
- **Môi trường:** Node.js `v24.11.0` on `win32 x64`

## 1. Bảng Truy vết Yêu cầu đến Bằng chứng

| Mã YC | Yêu cầu chính (Ticket-02 & Test Contract v1.1) | Cách kiểm chứng | File Bằng chứng Thực tế | Kết quả |
|---|---|---|---|:---:|
| **P2-R1** | Đồng bộ số liệu chuẩn (Tốc độ 6m/s, Nhảy 7m/s, Trọng lực -20, v.v.) | Unit test di chuyển, nhảy và trọng lực | [`unit-tests.log`](unit-tests.log) test 2 & 3 | **ĐẠT** |
| **P2-R2** | Kỹ năng Lướt (Dash: 14m/s trong 0.2s, hồi chiêu 1.5s) | Unit test dash, kiểm tra vận tốc & sự kiện `dash` | [`unit-tests.log`](unit-tests.log) test 2 | **ĐẠT** |
| **P2-R3** | Chuẩn hóa sức chứa đom đóm 10, nhặt XZ <= 1.0m, dY <= 1.5m | Unit test nhặt đom đóm | [`unit-tests.log`](unit-tests.log) test 4 | **ĐẠT** |
| **P2-R4** | Thắp đèn lồng chi phí 10 đom đóm, bán kính an toàn 6m | Unit test thắp đèn, sự kiện `deposit` & `lantern_lit` | [`unit-tests.log`](unit-tests.log) test 5 | **ĐẠT** |
| **P2-R5** | Kẻ địch mới Gió Lạc (Drifter) cướp đom đóm & Pulse làm rơi lại | Unit test cướp 3 đom đóm và Pulse thả lại `drifter_drop` | [`unit-tests.log`](unit-tests.log) test 6 | **ĐẠT** |
| **P2-R6** | Bùa Gió (Wind Charm) tăng tốc 7.2m/s, xóa hồi chiêu Lướt | Unit test nhặt bùa C1, sự kiện `charm_picked` | [`unit-tests.log`](unit-tests.log) test 7 | **ĐẠT** |
| **P2-R7** | Cơ chế Tạm dừng (Pause / Resume) logic đóng băng | Unit test pause, sự kiện `paused` & `resumed`, sim_tick không đổi | [`unit-tests.log`](unit-tests.log) test 8 | **ĐẠT** |
| **P2-R8** | Rơi khỏi đảo (Y < -10) mất 1 flame, mất đom đóm và hồi sinh | Unit test rơi đảo, sự kiện `player_hit` (by: fall, lost: 5) | [`unit-tests.log`](unit-tests.log) test 9 | **ĐẠT** |
| **P2-R9** | Mở rộng 3 Đêm: Đêm 1 (Đảo Bến), Đêm 2 (Đảo Cau), Đêm 3 (Đảo Chuông) | Chạy headless cả 3 Đêm, snapshot đầy đủ mảng mới theo v1.1 | [`night1-regression.jsonl`](night1-regression.jsonl), [`night2-daocau.jsonl`](night2-daocau.jsonl), [`night3-daochuong.jsonl`](night3-daochuong.jsonl) | **ĐẠT** |
| **P2-R10** | Tính tất định 100% Contract v1.1 giữa 2 lần chạy | So khớp mã băm SHA-256 byte-for-byte | [`determinism.txt`](determinism.txt) | **ĐẠT** |
| **P2-R11** | Hiệu năng Headless: 1 Đêm đầy đủ (18.000 ticks) chạy trong ≤ 30s | Chạy 18.000 ticks trong ~0.11s (nhanh hơn yêu cầu 30x) | [`perf-run.txt`](perf-run.txt) | **ĐẠT** |

## 2. Ghi nhận Hồi quy & Trung thực
- Toàn bộ các kiểm thử hồi quy của Phase 1 vẫn ĐẠT sau khi chuyển sang hệ số chuẩn hóa.
- 100% yêu cầu của Ticket-02 và Test Contract v1.1 được kiểm chứng thực nghiệm.
