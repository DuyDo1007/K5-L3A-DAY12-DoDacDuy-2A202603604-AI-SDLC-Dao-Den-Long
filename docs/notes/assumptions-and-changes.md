# Giả định & Lịch sử Thay đổi Yêu cầu

Tài liệu ghi lại toàn bộ giả định thiết kế cho những chỗ mơ hồ trong PRD/Ticket và giải trình thay đổi khi luật game được cập nhật qua các Phase.

---

## Phase 1: PRD-0 & Test Contract

### 1. Giả định cho các điểm chưa quy định rõ
- **Tốc độ di chuyển của Mây:** `5.0` units/giây (hoặc theo input action tương ứng).
- **Bán kính thu thập đom đóm (Collection Radius):** `1.5` units.
- **Bán kính thắp sáng Đèn Lồng Lớn:** `2.5` units.
- **Số đom đóm cần để thắp sáng 1 Đèn Lồng Lớn:** `3` đom đóm (hoặc thông số khai báo trong config).
- **Bóng Mực (Ink Shadow):** Tốc độ tuần tra `2.0` units/giây, bán kính phát hiện `4.0` units. Khi chạm Mây: trừ 1 đom đóm đang giữ (hoặc hồi sinh về điểm xuất phát).
- **Kích thước Đảo:** Bản đồ hình tròn bán kính `30` units, bao quanh bởi biển sương đen.

### 2. Các thông số khai báo theo Test Contract
*(Sẽ cập nhật chính xác theo file config khi nhận PRD-0 & Test Contract)*

---

## Phase 2: Ticket-02
*(Sẽ cập nhật khi bước sang Phase 2)*

---

## Phase 3: Ticket-03 (Thay đổi luật cũ)
*(Sẽ cập nhật giải trình lý do thay đổi thiết kế và danh sách test cũ bị sửa/loại bỏ)*

---

## Phase 4: Ticket-04 & Đo hiệu năng
*(Sẽ cập nhật)*
