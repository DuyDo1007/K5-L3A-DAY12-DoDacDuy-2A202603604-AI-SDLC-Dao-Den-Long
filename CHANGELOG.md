# Lịch sử Thay đổi (CHANGELOG)

Tất cả thay đổi qua các Phase của dự án Đảo Đèn Lồng:

## [Phase 1: PRD-0 & Test Contract v1.0] - 2026-11-20
- **Khởi tạo kiến trúc Headless-First:** Tách biệt 100% `src/core/` (mô phỏng tất định) khỏi `src/client/` (Three.js 3D).
- **Test Contract v1.0:** Hoàn thiện `game.contract.json` và CLI headless `src/headless/cli.js` tuân thủ đầy đủ đặc tả tham số (`--seed`, `--night`, `--scenario`, `--inputs`, `--ticks`, `--out`, `--snapshot-every`).
- **Core Gameplay Loop:**
  - Nhân vật Mây di chuyển theo hướng camera XZ.
  - 25 đom đóm rải rác trên đảo, nhặt trong bán kính `pickup_radius = 1.5m`.
  - 5 Đèn Lồng Lớn (`L1` .. `L5`) thắp sáng khi nạp đủ 3 đom đóm.
  - Tỏa sáng (Pulse) tiêu tốn 1 đom đóm, đẩy lùi 4m và làm choáng Bóng Mực trong 3 giây.
  - Bóng Mực tuần tra và rượt đuổi; va chạm gây mất 1 flame và rơi 50% đom đóm đang giữ.
  - Thắng màn khi thắp đủ 5 ngọn đèn; thua khi hết flames hoặc hết thời gian đêm (300s).
- **Harness & Verification:**
  - Viết `AGENTS.md` v1.0, kịch bản tự động hóa `scripts/verify_phase.js`.
  - Kiểm tra tính tất định (Determinism Check) đạt 100% hash match.
  - Xuất toàn bộ bằng chứng vào `docs/proof/phase-1/`.
- **Giao diện 3D & Sáng tạo:**
  - Bản dựng Three.js góc nhìn thứ 3: hòn đảo rêu đá, sương đen ma mị, Mây đội nón lá treo đèn lồng nhỏ.
  - Âm thanh procedural WebAudio (tiếng chuông gió, chuông chùa, sóng xung kích pulse).
