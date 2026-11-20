# Danh mục Nguồn & Bản quyền (CREDITS)

Dự án: **Đảo Đèn Lồng (Lantern Island)** — Phiên bản v1.0.0 (Bình minh)  
Tác giả: **Đỗ Đắc Duy** (MSSV: `2A202603604`) · Lớp: `K5-L3A` — Khóa học AI Thực chiến  

---

## 1. Ý tưởng & Kịch bản Gốc
- **Đề bài & Hệ thống Yêu cầu (PRD-0, Ticket-02, Ticket-03, Ticket-04):**
  Ban Giảng huấn và Thiết kế Khóa học AI Thực chiến (AI SDLC Lab - Day 12).
- **Thiết kế Thế giới & Nhân vật:**
  Ý tưởng nhân vật Mây đội nón lá treo đèn nhỏ phong cách hoạt hình chibi, thế giới 3 hòn đảo (Đảo Bến, Đảo Cau, Đảo Chuông) mang đậm màu sắc cổ tích dân gian Việt Nam.

---

## 2. Thư viện & Công nghệ Nền tảng
- **Engine Đồ họa 3D WebGL:**
  [Three.js (r160)](https://threejs.org/) — Tác giả Ricardo Cabello và cộng đồng mã nguồn mở. Bản quyền MIT License.
- **Môi trường Thực thi & Kiểm thử:**
  [Node.js (v20+)](https://nodejs.org/) — Nền tảng JavaScript đa nền tảng.
- **Thuật toán Tạo số Ngẫu nhiên Tất định:**
  Thuật toán Mulberry32 sinh số giả ngẫu nhiên 32-bit nhanh và tất định.

---

## 3. Tài sản Đồ họa & Âm thanh (Assets & Audio)
- **Mô hình 3D & Hình học (Procedural 3D Meshes):**
  100% được sinh bằng thuật toán tham số trong mã nguồn Three.js (`src/client/`):
  - Nhân vật Mây (phong cách hoạt hình chibi): Ghép từ các khối cơ bản Three.js (`SphereGeometry`, `CylinderGeometry`, `ConeGeometry`).
  - Đèn Lồng Lớn: Mái ngói cong, khung gỗ, thân đèn phát sáng và dải lụa đỏ.
  - Cầu Tre & Bục Nhảy: Ghép từ các thanh tre trụ tròn và vòng năng lượng phát sáng.
  - Cảnh quan: Đảo nổi, thảm cỏ, rặng tre và mặt nước phản chiếu sương mù.
  - *Hoàn toàn không sử dụng file mô hình 3D độc quyền bên ngoài.*
- **Âm thanh & Nhạc nền (Procedural Audio):**
  100% âm thanh được tổng hợp thời gian thực qua **WebAudio API**:
  - Tiếng chuông gió ngân vang khi nhặt đom đóm.
  - Tiếng chuông chùa trầm ấm khi thắp sáng đèn lồng.
  - Tiếng xung kích sóng âm khi sử dụng kỹ năng Tỏa Sáng (Pulse).
  - Âm thanh hồi sinh, cạn dầu và cảnh báo Bóng Mực.
  - *Không sử dụng file âm thanh ngoài, 100% an toàn bản quyền.*

---

## 4. Đóng góp của AI Assistant (AI Contribution)
- **Hệ thống AI:** Antigravity (Google DeepMind).
- **Vai trò trong Dự án:**
  - Lập trình viên thi công logic Headless-First (`src/core/`), hệ thống Test Contract, và bộ Unit Test tự động.
  - Chuyển đổi và chuẩn hóa các thông số di chuyển, gia tốc, trọng lực theo đúng yêu cầu Ticket-02.
  - Xử lý Change Request phức tạp ở Phase 3 (Đèn cạn dầu, Shade drain, luật thắng bình minh).
  - Triển khai bộ công cụ Benchmark, Soak Test 10 Đêm, Bảng xếp hạng cục bộ và bộ tính năng Dễ tiếp cận ở Phase 4.
  - Thực hiện kiểm thử độc lập qua Browser Subagent để hoàn thiện trải nghiệm người dùng.

---

## 5. Giấy phép Mã nguồn
Dự án được phát hành công khai theo giấy phép mã nguồn mở **MIT License**. Chi tiết xem tại [LICENSE](LICENSE).
