# Skill: Phase Verifier

Skill tự động hóa chạy kiểm chứng cho dự án Đảo Đèn Lồng qua từng phase.

## Khi nào dùng
Dùng skill này khi hoàn thành một phase hoặc trước khi gắn tag git (`phase-1` .. `phase-4`).

## Lệnh thực thi
- Chạy toàn bộ kiểm thử đơn vị & scenarios: `npm test`
- Chạy kiểm chứng và xuất báo cáo bằng chứng: `node scripts/verify_phase.js --phase <N>`
- Kiểm tra tính tất định 100%: Lệnh sẽ tự động so sánh mã hash SHA-256 giữa 2 lần chạy độc lập.

## Quy tắc
- Nếu phát hiện test thất bại hoặc mã hash không khớp, không được gắn tag; phải sửa mã nguồn trước.
