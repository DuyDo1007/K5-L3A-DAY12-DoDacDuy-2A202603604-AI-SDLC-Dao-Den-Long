# Đảo Đèn Lồng (Lantern Island) — Phiên bản v1.0.0 (Bình minh)

> **Dự án:** Game 3D phong cách Á Đông ấm cúng · AI SDLC Lab Day 12  
> **Tác giả:** Đỗ Đắc Duy · **MSSV:** `2A202603604` · **Lớp:** `K5-L3A`  
> **Phiên bản:** `v1.0.0` (Contract v1.3) · **Trạng thái:** Sẵn sàng phát hành (Release Ready)  
> **Video Demo:** `docs/demo/demo.mp4` (hoặc xem trực tiếp trên GitHub Release v1.0.0)

---

## 1. Giới thiệu Game
**Đảo Đèn Lồng** đưa người chơi vào vai **Mây** — người giữ đèn nhỏ tuổi trong hành trình thắp sáng quần đảo trước khi bình minh ló rạng. Trải qua 3 Đêm đầy thử thách:
- **Đêm 1 (Đảo Bến):** Làm quen với việc thu thập đom đóm, thắp 5 đèn lồng và né tránh sinh vật Bóng Mực.
- **Đêm 2 (Đảo Cau):** Vượt qua 2 hòn đảo nối bằng cầu tre và bục nhảy phóng cao tốc, đối phó với Gió Lạc cướp đom đóm.
- **Đêm 3 (Đảo Chuông):** Chinh phục địa hình 3 tầng giật cấp, gió lốc quét định kỳ và giữ cho các ngọn đèn không bị cạn dầu.

Mục tiêu cốt lõi: **Giữ cho ít nhất 60% số đèn lồng trên đảo sáng rực cho tới khi bình minh xuất hiện!**

---

## 2. Cài đặt & Khởi động Nhanh (Tối đa 3 Lệnh)

Hệ thống hỗ trợ Windows, macOS và Linux:

```bash
# Lệnh 1: Cài đặt thư viện phụ thuộc
npm install

# Lệnh 2: Chạy bộ kiểm thử tự động toàn diện
npm test

# Lệnh 3: Khởi động giao diện 3D trên trình duyệt
npm start
```
Mở trình duyệt tại địa chỉ: `http://localhost:3000` để trải nghiệm trực tiếp.

---

## 3. Cấu hình Tối thiểu & Đề nghị
- **Hệ điều hành:** Windows 10/11, macOS 12+, hoặc Linux (Ubuntu 20.04+).
- **Môi trường thực thi:** Node.js v18.0.0 trở lên.
- **Phần cứng:** CPU 2 nhân 2.0 GHz, RAM 4 GB, card đồ họa hỗ trợ WebGL 1.0/2.0.
- **Màn hình đề nghị:** Độ phân giải 1280×720 trở lên.

---

## 4. Các Lệnh Kỹ thuật & Kiểm chứng Chuẩn

Toàn bộ quy trình kiểm chứng đều được tự động hóa tuân thủ **Test Contract v1.3**:

```bash
# Chạy mô phỏng Headless một Đêm bất kỳ
npm run headless -- --night 1 --seed 42 --ticks 600

# Chạy bài đo hiệu năng Benchmark (chuẩn 30s)
npm run bench

# Chạy bài kiểm tra độ bền Soak Test (10 Đêm liên tiếp)
npm run soak

# Xuất dữ liệu Bảng Xếp Hạng cục bộ ra tệp JSON
npm run leaderboard -- --export data/export_leaderboard.json

# Chạy toàn bộ quy trình kiểm chứng & xuất bằng chứng Phase 4
npm run verify -- --phase 4
```

---

## 5. Bảng Điều khiển & Tính năng Dễ Tiếp Cận (Accessibility)

### Phím Điều khiển Mặc định:
- **W / A / S / D:** Di chuyển nhân vật Mây theo hướng camera.
- **Chuột trái (Kéo):** Xoay camera 3D xung quanh nhân vật.
- **Space:** Nhảy lên (vận tốc 7.0 m/s).
- **Shift (hoặc Q):** Lướt nhanh (Dash 14.0 m/s trong 0.2s, hồi chiêu 1.5s).
- **E:** Tương tác thắp đèn / châm thêm dầu khi đứng gần đèn.
- **F:** Tỏa Sáng (Pulse) tiêu hao 3 đom đóm làm choáng Bóng Mực và buộc Gió Lạc nhả đom đóm.
- **P:** Tạm dừng (Pause) / Tiếp tục (Resume).
- **R:** Chơi lại màn chơi.

### Tính năng Hỗ trợ Tiếp cận Cao cấp:
- **Đổi phím tự do (Key Rebinding):** Tùy biến mọi phím bấm trong mục Cài đặt, tự phát hiện trùng phím và có nút khôi phục mặc định.
- **Phụ đề & Chỉ báo Hình ảnh:** Hiển thị mũi tên chỉ hướng mép màn hình khi có Bóng Mực tiếp cận, cảnh báo gió lốc Đêm 3, cảnh báo 10 giây cuối và cảnh báo đèn cạn dầu (< 30 fuel).
- **Giảm chuyển động (Reduce Motion):** Tắt hoàn toàn rung lắc camera và chớp màn hình.
- **Tùy chỉnh cỡ chữ & Chế độ màu:** Hỗ trợ cỡ chữ lớn x1.25 và chế độ tương phản/mù màu.

---

## 6. Bảng Xếp Hạng Cục Bộ (Leaderboard)
- Hệ thống tự động ghi nhận Top 10 điểm số cao nhất của người chơi tại `data/leaderboard.json`.
- Kiểm tra tính hợp lệ của tên người chơi (3–12 ký tự chữ, số hoặc gạch dưới).
- Hỗ trợ xem trực tiếp qua nút **🏆 Bảng Xếp Hạng** tại màn hình chính và tự động hiện form lưu điểm khi kết thúc đêm chơi.

---

## 7. Liên kết Bằng chứng & Tài liệu Đóng gói
- [Báo cáo Retrospective (docs/notes/retro-v1.0.0.md)](docs/notes/retro-v1.0.0.md)
- [Bằng chứng Nghiệm thu Phase 4 (docs/proof/phase-4/proof.md)](docs/proof/phase-4/proof.md)
- [Hợp đồng Kiểm thử v1.3 (game.contract.json)](game.contract.json)
- [Lịch sử Thay đổi (CHANGELOG.md)](CHANGELOG.md)
- [Nguồn & Bản quyền (CREDITS.md)](CREDITS.md)
- [Giấy phép Mã nguồn (LICENSE)](LICENSE)
