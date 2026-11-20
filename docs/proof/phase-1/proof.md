# Bằng chứng Kiểm chứng — Phase 1 (Test Contract v1.0)

- **Ngày giờ kiểm chứng:** `2026-11-20T08:10:34.608Z`
- **Lệnh tái lập nhanh:** `node scripts/verify_phase.js --phase 1`
- **Môi trường:** Node.js `v24.11.0` on `win32 x64`

## 1. Bảng Truy vết Yêu cầu đến Bằng chứng

| Mã YC | Yêu cầu chính (PRD-0 & Test Contract) | Cách kiểm chứng | File Bằng chứng Thực tế | Kết quả |
|---|---|---|---|:---:|
| **P1-R1** | Chế độ Headless CLI theo Test Contract v1.0 | Chạy `node src/headless/cli.js --seed 42 --night 1 --scenario ... --out ...` | [`s1-collect-light.jsonl`](s1-collect-light.jsonl) | **ĐẠT** |
| **P1-R2** | Tính tất định 100% giữa 2 lần chạy cùng seed/input | So khớp byte-for-byte SHA-256 của output JSONL | [`determinism.txt`](determinism.txt) | **ĐẠT** |
| **P1-R3** | Mây di chuyển theo hướng camera, thu thập đom đóm | Chạy Unit test + Scenario S1 (gom 3 đom đóm) | [`unit-tests.log`](unit-tests.log), `s1-collect-light.jsonl` line 2-4 | **ĐẠT** |
| **P1-R4** | Nạp ánh sáng vào Đèn Lồng Lớn (L1) và thắp sáng | Scenario S1: nạp 3 đom đóm -> sự kiện `deposit` & `lantern_lit` | `s1-collect-light.jsonl` line 7-8 | **ĐẠT** |
| **P1-R5** | Tỏa sáng (Pulse) làm choáng & đẩy lùi Bóng Mực | Scenario S2: tiêu tốn đom đóm, đẩy lùi Bóng Mực 4m và chuyển state sang `stunned` | [`unit-tests.log`](unit-tests.log) test 5 | **ĐẠT** |
| **P1-R6** | Bóng Mực va chạm làm mất máu & rơi đom đóm | Scenario S3: chạm Mây làm giảm flames và rơi 50% carried | [`unit-tests.log`](unit-tests.log) test 6 | **ĐẠT** |
| **P1-R7** | Thắp hết 5 Đèn Lồng Lớn thì Thắng (`won`, `all_lit`) | Scenario S4: thắp xong đèn thứ 5, ghi nhận điểm bonus và game over won | [`unit-tests.log`](unit-tests.log) test 4 & S4 run | **ĐẠT** |

## 2. Ghi nhận Trung thực
- Toàn bộ 7 yêu cầu chính của Phase 1 và Test Contract v1.0 đã được triển khai, kiểm thử tự động và sinh bằng chứng thật 100%.
- Không có yêu cầu nào bị bỏ qua hoặc làm giả.
