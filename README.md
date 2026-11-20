# Đảo Đèn Lồng (Lantern Island) — 3D Game & AI SDLC

> **Video Demo:** [Xem Video Demo (.mp4)](docs/demo/demo.mp4) *(hoặc đính kèm tại GitHub Release v1.0.0)*  
> **Học viên:** Đỗ Đắc Duy · **MSSV:** `2A202603604` · **Lớp:** `K5-L3A`  
> **Bài làm:** Cá nhân · Áp dụng SDLC và Harness AI xây dựng game 3D qua 4 Phase tuân thủ Test Contract.

---

## 1. Giới thiệu Game
**Đảo Đèn Lồng** là game 3D góc nhìn thứ ba ấm cúng, đậm chất cổ tích Việt Nam. Người chơi hóa thân thành **Mây** — người giữ đèn nhỏ tuổi đội nón lá có treo chiếc đèn lồng nhỏ. Trong đêm sương đen bao phủ Đảo Bến, Mây phải thu thập những đốm sáng (**đom đóm**) để thắp sáng lại **5 Đèn Lồng Lớn**, đồng thời né tránh và dùng ánh sáng tỏa ra (**Pulse**) để xua đuổi các sinh vật **Bóng Mực** trong màn đêm.

- **Thắng:** Thắp sáng toàn bộ 5 Đèn Lồng Lớn trước khi trời sáng.
- **Thua:** Hết lửa sinh mệnh (mất hết 3 flames) hoặc hết thời gian đêm (300 giây).

---

## 2. Cài đặt và Chạy Game (Tối đa 3 lệnh)

Game chạy được trên cả **macOS, Linux và Windows** mà không cần cấu hình phức tạp:

```bash
# 1. Cài đặt phụ thuộc
npm install

# 2. Chạy kiểm thử tự động & kiểm chứng tính tất định
npm test

# 3. Khởi động game 3D trên trình duyệt
npm start
```
Truy cập: `http://localhost:3000` trên trình duyệt để trải nghiệm game 3D.

---

## 3. Điều khiển Game
- **W / A / S / D** hoặc **Phím Mũi Tên:** Di chuyển nhân vật Mây theo hướng camera.
- **Kéo chuột trái:** Xoay camera 3D góc nhìn thứ ba quanh Mây.
- **Phím E:** Tương tác nạp đom đóm vào Đèn Lồng Lớn khi đứng gần.
- **Space** hoặc **Phím F:** Tỏa sáng (Pulse) tiêu tốn 1 đom đóm, đẩy lùi 4m và làm choáng Bóng Mực trong 3 giây.
- **Phím R:** Chơi lại màn chơi.

---

## 4. Cơ chế Tính Điểm (Scoring System)
- **Nhặt 1 đom đóm (Mote):** `+10 điểm`
- **Làm choáng 1 Bóng Mực (Pulse Stun):** `+20 điểm`
- **Thắp sáng 1 Đèn Lồng Lớn:** `+100 điểm`
- **Thưởng Thắng Màn (Win Bonus):**
  - `+2 điểm` cho mỗi giây còn lại trước bình minh (`Math.floor(time_left_s) * 2`)
  - `+50 điểm` cho mỗi ngọn lửa sinh mệnh còn giữ (`flames * 50`)

---

## 5. Chế độ Headless & Test Contract v1.0
Game được thiết kế theo kiến trúc **Headless-First**, logic mô phỏng tách biệt hoàn toàn khỏi đồ họa (`src/core/`), chạy ở tần số cố định **60 tick/giây**:

### Lệnh chạy Headless:
```bash
node src/headless/cli.js --seed 42 --night 1 --scenario tests/scenarios/s1_scenario.json --inputs tests/scenarios/s1_inputs.json --ticks 70 --out docs/proof/phase-1/s1-collect-light.jsonl
```

### Tự động kiểm chứng toàn bộ Phase:
```bash
node scripts/verify_phase.js --phase 1
```

Tệp cấu hình hợp đồng kiểm thử: [`game.contract.json`](game.contract.json)

---

## 6. Sáng tạo của tôi (Creative Features)
Tuân thủ quy định tại mục 3 của PRD-0 và mục F của RUBRIC (sáng tạo an toàn, **không làm đổi đầu ra Headless**):
1. **Tạo hình Nhân vật Mây Đậm Nét Văn Hóa:** Mây mặc áo lam truyền thống, đội **nón lá** hình chóp nón, trên đỉnh nón treo chiếc đèn lồng nhỏ phát ra ánh sáng vàng cam ấm áp soi đường trong đêm.
2. **Âm thanh Thủ tục Độc lập (Procedural WebAudio):** Tự tổng hợp âm thanh chuông gió nhẹ nhàng khi nhặt đom đóm, chuông chùa trầm ấm khi thắp đèn, và tiếng sóng âm khi dùng Pulse mà không dùng file audio ngoài, 100% an toàn bản quyền.
3. **Hiệu ứng Vòng Sóng Xung Kích (Pulse Shockwave):** Khi bấm Space/F, một vòng sóng ánh sáng vàng kim mở rộng quét sạch bóng đêm và đẩy lùi Bóng Mực.

*Cam kết: Tất cả các hiệu ứng trên chỉ nằm ở tầng hiển thị `src/client/`, chế độ headless `src/core/` vẫn đảm bảo tính tất định 100% theo đúng Test Contract.*

---

## 7. Liên kết Tài liệu & Bằng chứng
- [Kế hoạch Dự án (PLAN.md)](PLAN.md)
- [Hướng dẫn AI Agent (AGENTS.md)](AGENTS.md)
- [Bảng Truy vết Bằng chứng Phase 1 (docs/proof/phase-1/proof.md)](docs/proof/phase-1/proof.md)
- [Giả định & Thay đổi (docs/notes/assumptions-and-changes.md)](docs/notes/assumptions-and-changes.md)
- [Nhật ký Token & AI (docs/notes/ai-log-and-retro.md)](docs/notes/ai-log-and-retro.md)
- [Tài sản & Bản quyền (CREDITS.md)](CREDITS.md)
