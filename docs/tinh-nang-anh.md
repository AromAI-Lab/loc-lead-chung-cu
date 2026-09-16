# Nhận ảnh chụp hội thoại — ghi chú thiết kế

*Ghi 16/09/2026. Chưa làm. Làm sau khi nộp bài Buổi 7.*

## Vì sao cần

Hai nguồn độc lập cùng chỉ ra: Mai Hương nêu từ đầu, và một sale phản hồi ngày 15/09 nói lại.

Lý do thật: **sale không copy được hội thoại Zalo một cách gọn gàng.** Bôi đen trên điện thoại rất khó, copy xong dính rác. Còn chụp màn hình thì họ làm hằng ngày, bằng phản xạ. Đây là chênh lệch giữa 30 giây và 3 giây — và ở mức 3 giây thì người ta mới dùng tới lead thứ mười.

## Ảnh chụp Zalo thật sự chứa gì — đã đính chính 16/09

Giả định ban đầu sai: *"ảnh chụp mang theo số điện thoại như văn bản dán"*. **Không đúng.** Mai Hương làm nghề này và đính chính: số điện thoại nằm ở hồ sơ liên hệ, **không nằm trong bong bóng chat**. Rất hiếm khi xuất hiện trong nội dung trao đổi. Tên hiển thị thì không đáng ngại.

Còn lại đúng hai chỗ, và **cả hai đều nằm ở dải trên cùng của ảnh**, không nằm trong nội dung:

1. **Khách chưa lưu danh bạ thì Zalo lấy số điện thoại làm tên hiển thị.** Đây đúng là tệp lead mới từ data sàn phát — tức nhóm sale chụp nhiều nhất.
2. **Ảnh đại diện là ảnh mặt người.** Khác loại với tên.

→ Cách xử lý không phải bỏ tính năng, mà là **bỏ dải trên cùng**.

## Luật đã chốt — hiện ngay cạnh ô tải ảnh

> **Chụp thế nào cho an toàn**
> Chỉ chụp **phần nội dung trao đổi**. Không lấy thanh trên cùng — tức là **không ảnh đại diện, không tên, không số điện thoại**.
> Phần nội dung là thứ máy cần để chấm. Thanh trên cùng không giúp gì cho việc chấm cả.

Đặt câu này **trước** nút tải ảnh, không phải sau. Và nói bằng lời "chụp cái gì", không phải "đừng chụp cái gì" — người ta làm theo lời khẳng định dễ hơn lời cấm.

## Luồng kỹ thuật

```
sale dán ảnh (⌘V) hoặc kéo thả
   → máy chủ nhận ảnh, đọc chữ bằng AI vision
   → ĐỔ CHỮ NGƯỢC VÀO Ô DÁN cho sale xem và sửa      ← bắt buộc
   → sale bấm chấm → luồng che trong trình duyệt chạy như thường
```

**Bước đổ chữ ngược lại là bắt buộc, không được bỏ qua để cho nhanh.** Hai lý do:

1. AI đọc ảnh có thể sai. Sale nhìn thấy chữ trước khi chấm thì sửa được. Bỏ bước này thì máy đọc nhầm rồi chấm sai mà không ai biết.
2. Nó giữ nguyên toàn bộ luồng che hiện có, không phải viết lại.

## Chỗ phải nói thật trên giao diện

Với ảnh thì **phần che chạy ở máy chủ, không chạy trên máy người dùng** — vì máy chủ phải nhận ảnh mới đọc được chữ. Đây là khác biệt thật so với đường dán văn bản.

Một dòng, đặt ngay chỗ tải ảnh:

> Với ảnh, bước che chạy ở máy chủ chứ không trên máy bạn — vì máy phải đọc được chữ trong ảnh trước đã. Ảnh không được lưu lại sau khi đọc xong.

Không giấu chuyện này. Câu minh bạch ở cuối trang cũng phải cập nhật theo.

## Việc phải làm khi bắt tay

- [ ] Endpoint mới `api/doc-anh.js` — nhận ảnh, gọi vision, trả về chữ. Không dùng chung `api/score.js`.
- [ ] Xoá ảnh ngay sau khi đọc xong, không ghi ra đĩa, không đưa vào nhật ký.
- [ ] Giới hạn dung lượng và số ảnh mỗi lượt, để không vỡ chi phí token.
- [ ] Cập nhật khối minh bạch ở `public/index.html`.
- [ ] Kiểm thử: ảnh mờ, ảnh xoay ngang, ảnh nhiều bong bóng chat, ảnh không phải hội thoại.
