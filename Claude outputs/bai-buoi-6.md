# Buổi 6 — Đường mua thẳng, không cần bạn ngồi trực

**Lọc lead chung cư** — chấm điểm và phát hiện lead ảo cho sale căn hộ.
Sản phẩm: https://loc-lead-chung-cu.vercel.app · Mã nguồn: https://github.com/AromAI-Lab/loc-lead-chung-cu

## Bài 1 — Sản phẩm và mô hình giá

**Hình thức: định kỳ theo tháng (subscription).** Đây là công cụ dùng hằng ngày, sale ngừng chạy ads thì ngừng trả.

| Gói | Giá | Trạng thái |
| --- | --- | --- |
| Apartment Lead Filter — Monthly | 243.000đ/tháng (đã gồm thuế 22.091đ) | Đang bán |

Giá quy từ 9$ theo tỷ giá 27.000đ. Gói 3 tháng 599.000đ và 30 lead đầu miễn phí **chưa dựng trên Polar**, mới là kế hoạch.

Polar đóng vai merchant of record, phí gói Starter là 5% + 50¢, cộng 1,5% cho thẻ quốc tế (thẻ Việt Nam tính là thẻ quốc tế):

| Khoản | Số tiền |
| --- | --- |
| Khách trả | 243.000đ |
| Thuế Polar thu hộ | −22.091đ |
| Phí Polar (ước tính) | ~−28.000đ |
| **Về tay, trước phí rút** | **~193.000đ · ~79%** |

Phí cố định 50¢ chiếm 5,6% trên sản phẩm 9$, nên gói 3 tháng lãi hơn gói tháng: chỉ tính phí 1 lần thay vì 3 lần.

**Chưa có doanh thu.** Mục Finance đang trống vì chưa có đơn hàng thật. Các con số phí ở trên là ước tính từ biểu phí công bố, chưa phải số đối soát.

## Bài 2 — Workflow và các bước đang làm thủ công

| # | Bước | Thủ công? |
| --- | --- | --- |
| 1 | Sale biết tới sản phẩm và nhận link | **THỦ CÔNG** — tự nhắn từng người trên Zalo |
| 2 | Sale mở link checkout Polar | Tự động |
| 3 | Nhập email, chọn Thẻ hoặc Apple Pay, trả 243.000đ | Tự động |
| 4 | Polar thu tiền, xuất hoá đơn, thu và nộp thuế | Tự động |
| 5 | Polar gọi webhook, máy chủ xác thực chữ ký | Tự động — **làm xong trong buổi này** |
| 6 | Mở quyền dùng cho khách | **THỦ CÔNG** — chưa có tài khoản đăng nhập |
| 7 | Gửi hướng dẫn dùng | **THỦ CÔNG** |
| 8 | Sale dán hội thoại vào công cụ để chấm | **THỦ CÔNG** — phía khách |
| 9 | Khách gia hạn hoặc huỷ, Polar bắn sự kiện về webhook | Tự động |
| 10 | Đóng quyền khi hết hạn | **THỦ CÔNG** |

**5 bước còn thủ công: 1, 6, 7, 8, 10.**

Trước buổi này bước 5 cũng thủ công — phải tự vào Polar xem ai đã trả tiền.

Bước 6, 7, 10 là một cụm, đều do chưa có tài khoản người dùng; dựng đăng nhập bằng email gỡ được cả 3, và webhook đã để sẵn chỗ cắm. Đây là việc tiếp theo. Bước 8 giữ thủ công có chủ ý: Zalo và Meta chỉ mở API cho tài khoản doanh nghiệp, không mở cho tài khoản cá nhân, và tôi không dùng API không chính thức.

## Bài 3 — Một link thanh toán dùng được

**Link checkout chạy thật, không phải sandbox** — tài khoản Polar đã qua xác minh danh tính và nối tài khoản nhận tiền qua Stripe Express. Người lạ mở link là thấy ô nhập thẻ và nút Apple Pay.

| Mục | Giá trị |
| --- | --- |
| Endpoint | `https://loc-lead-chung-cu.vercel.app/api/webhook` |
| API version | 2026-10 |
| Trạng thái | Enabled |
| Sự kiện | `order.paid`, `subscription.active`, `subscription.canceled`, `subscription.revoked` |

Địa chỉ webhook là công khai, nên nếu tin bừa thì ai cũng giả được thông báo "đã thanh toán" để mở khoá miễn phí. Máy chủ xác thực chữ ký theo chuẩn Standard Webhooks, từ chối gói tin quá 5 phút, luôn trả 200 cho sự kiện không xử lý (Polar coi mã khác 200 là thất bại, 10 lần liên tiếp là tự tắt endpoint), và không ghi dữ liệu cá nhân vào log. Secret nằm trong biến môi trường trên Vercel.

**Kiểm thử:** 8 ca tự động cho phần chữ ký, chạy cùng bộ test cũ — 30/30 đạt. Thử tấn công endpoint đang chạy: gửi không chữ ký → 400; chữ ký bịa → 401; mốc thời gian lệch 2 tiếng → 400. **Gói tin thật từ Polar: 200.**

Lần đầu nối báo 401 vì đã cập nhật biến môi trường nhưng chưa deploy lại — Vercel nạp biến môi trường lúc build. Deploy lại là ra 200.

**Ảnh kèm:** trang checkout · cấu hình webhook · danh sách sự kiện · Deliveries có lần gửi 200.

## Bài 4 — Chi phí phần mềm hằng tháng

**Đang chi:**

| Công cụ | Chi phí/tháng |
| --- | --- |
| Claude Code | 20$ |
| ChatGPT | 19,5$ |
| Zalo | 12.000đ |
| Google One | 22.000đ |
| Vercel Hobby, GitHub, Polar | 0đ |
| **Tổng** | **≈ 42$** |

Con số này thấp vì tôi trả bằng thời gian nhiều hơn bằng tiền: một ngày làm việc của tôi có 2 tiếng 10 phút thao tác thủ công.

**Muốn chi nhưng chưa chi: CRM.**

| Công cụ | Giá |
| --- | --- |
| HubSpot Free | 0đ |
| HubSpot Starter | từ 20$/tháng |
| GoHighLevel Starter | 97$/tháng |
| GoHighLevel Unlimited | 297$/tháng |

Lý do chưa mua không phải vì đắt. Tôi trực tin nhắn trên **Zalo cá nhân**, mà không CRM nào nối được với Zalo cá nhân vì Zalo không mở API cho tài khoản cá nhân. Trả 97$/tháng thì lead vẫn nằm trong Zalo và vẫn phải chép tay sang.

"Đắt quá nên chưa mua" khác với "mua rồi cũng không giải quyết được việc". Cái sau là một khoảng trống thị trường, và nó nằm ngay cạnh thứ tôi đang build.

**Quyết định: không mua gì.** CRM là công cụ quản lý số lượng, mà tôi chưa có khách trả tiền nào. Cần chỗ ghi lead thì dùng Google Sheet. Xem lại khi có 20 khách trả tiền thật.
