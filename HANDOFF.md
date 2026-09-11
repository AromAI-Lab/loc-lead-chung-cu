# Bàn giao dự án — Lọc lead chung cư

*Cập nhật 11/09/2026 · Đọc file này khi mở phiên Claude mới, đừng hỏi lại từ đầu*

> Quy trình làm bài tập Campus nằm ở skill `build-to-own-campus`, không nhắc lại ở đây.
> File này chỉ giữ **trạng thái, quyết định và việc còn lại**.

## 1. Một phút bối cảnh

Sản phẩm: **tool AI chấm điểm và lọc lead ảo** cho **sale căn hộ chung cư** HN/HCM, bán trực tiếp cho sale cá nhân (không qua sàn). Làm trong khuôn khổ cohort **Build to Own**, Demo Day **20/09/2026**.

| | |
|---|---|
| Chạy thật | https://loc-lead-chung-cu.vercel.app |
| Mã nguồn | https://github.com/AromAI-Lab/loc-lead-chung-cu (công khai) |
| Trên máy | `~/Downloads/loc-lead-chung-cu` |
| Hosting | Vercel, team AROMAI, gói Hobby |
| Thanh toán | Polar — tổ chức "AromAI Lab", **đã được duyệt** 10/09 |
| Tên miền | `huongai.com` — đã mua, **chưa trỏ được**, đang 401, chờ nhà cung cấp |

## 2. Trạng thái Campus

**40/105 điểm (38%)** tính tới 10/09.

| Bài | Điểm |
|---|---|
| Buổi 2 · Máy đã sẵn sàng | 10/10 |
| Buổi 3 · Hồ sơ thị trường | 10/10 |
| Buổi 4 · Lõi sản phẩm chạy được | 10/10 |
| Buổi 5 · Sản phẩm có địa chỉ thật | 10/10 |
| Giới thiệu bản thân | 0/5 |
| Cài agent và gói AI | 0/5 |
| Ba bài: ngày làm việc, tiền công cụ, ba chỗ đau | 0/5 |
| Buổi 1 · Đào sâu ba chỗ đau | 0/10 |

**25 điểm đang bỏ trống** từ Tuần 0 và Buổi 1. Nội dung đã nộp trên Discord hồi đó, chỉ chưa chép sang Campus. **Bài quá hạn vẫn được chấm đủ điểm** — đã kiểm chứng với Buổi 4 (nộp muộn 4 ngày, vẫn 10/10).

## 3. Sản phẩm — quyết định thiết kế cốt lõi

### Hai trục, không phải một thang điểm

"Ảo" **không phải** là "điểm thấp". Môi giới đối thủ giả làm khách có thể trả lời trơn tru và đạt điểm cao; khách thật mới tìm hiểu thì điểm thấp nhưng đáng nuôi 3–6 tháng. Gộp hai thứ vào một thang là ném đi lead thật và giữ lại lead ảo.

- **Trục 1** — tiềm năng, 0–12 điểm, 4 tiêu chí (tài chính, quyền quyết định, nhu cầu thực, thời điểm)
- **Trục 2** — cờ Ảo, đếm độc lập

Cờ **A1** (môi giới dò giá) và **A7** (lừa đảo) là *cờ quyết định*: một cờ đủ kết luận Ảo bất kể điểm. A2–A6 là tình huống, cần hai cờ.

Bộ tiêu chí đầy đủ: `docs/scoring-criteria.md`

### Hai lớp chấm, lớp dưới không phụ thuộc lớp trên

- **Lớp luật cứng** chạy trong trình duyệt, không mạng, không khoá. Lưới an toàn khi mất mạng hoặc hết hạn mức.
- **Lớp AI** chấm lại độc lập, gợi ý tin nhắn gửi tiếp.
- Lệch từ 3 điểm trở lên thì sản phẩm **nói thẳng là nên tự đọc lại**.

### Ba nguyên tắc đã cài vào sản phẩm

1. **Tách lời khách khỏi lời sale** trước khi chấm (tiền tố `K:` / `S:`). Không tách được thì tự hạ độ tin cậy và nói rõ.
2. **Hội thoại dưới 25 từ → từ chối chấm**, trả về 3 câu nên hỏi trước. Thà nói "chưa đủ dữ liệu" còn hơn chấm bừa.
3. **Ẩn danh hoá hai lần** — lần một trong trình duyệt (người dùng xem được), lần hai ở máy chủ. Không lưu hội thoại gốc.

### Kiểm thử

`npm test` — 22 phép, 6 ca thật (Nóng, Ấm, mới tìm hiểu, môi giới dò giá, lừa đảo, quá ngắn). Chạy trước mỗi lần push.

## 4. Định vị và giá — đã chốt, đừng research lại

**ICP:** sale chung cư ≥1 năm nghề, tự chạy ads 10–20 triệu/tháng, nhận 30–80 lead/tháng, không có Zalo OA, không có CRM. Đây là ràng buộc thiết kế: sản phẩm phải chạy chỉ với một đường link.

**Giá:** niêm yết **249k/tháng**, gói 3 tháng 599k, free 30 lead đầu.

> Ngày 10/09 có cân nhắc hạ xuống 99k. **Đã phản biện và giữ 249k.** Lý do: ICP tiêu 10–20tr/tháng cho ads, 249k là 1–2,5% — rào cản là *niềm tin*, không phải giá. Hạ giá không sửa được niềm tin, mà neo giá thấp rất khó gỡ. Dùng ưu đãi "5 người đầu tiên 99k giữ vĩnh viễn" làm đòn bẩy thay vì hạ giá niêm yết. **Và đừng chốt giá trước khi phỏng vấn sale.**

**USP giữ lại:** phát hiện lead Ảo · tiêu chí riêng chung cư VN · không cần OA/CRM/cài đặt · tool kèm khoá huấn luyện 10X
**USP bị loại:** "chấm Nóng/Ấm/Lạnh" (trùng ~80% Roof AI) · "rẻ hơn tool US 20 lần"

## 5. Hai đường thu tiền — phân vai rõ

| | Dùng cho | Trạng thái |
|---|---|---|
| **VietQR + SePay** | Khách Việt Nam, sale trả 249k/tháng | Đã dựng, webhook SePay chưa chạy thử |
| **Polar** | Khách quốc tế, sản phẩm số bán ra nước ngoài | Đã duyệt, đã nối Stripe Express về BIDV |

Polar tính USD qua thẻ quốc tế — sale Việt Nam quét VietQR thuận tiện hơn nhiều. **Đừng chuyển khách Việt sang Polar.**

Trên Polar đã có: sản phẩm subscription theo tháng ($9) + một checkout link no-code.

## 6. Việc còn lại, theo thứ tự đòn bẩy

1. **Phỏng vấn 5 sale** ≥1 năm nghề đang chạy ads — *việc quan trọng nhất, vẫn chưa làm*.
   Giả định lớn nhất chưa kiểm chứng: **sale có chịu dán từng hội thoại không, và có trả 249k không.**
   Giờ đã có link chạy thật để họ bấm thử — hỏi bằng sản phẩm mạnh hơn hỏi bằng ý tưởng.
   **Nếu ≤2/5 nói có → đổi ICP sang sàn có Zalo OA.** Phải biết trước Demo Day.
2. **Hiệu chuẩn ngưỡng 9/6/3** bằng 30 lead đã biết kết quả. Ngưỡng hiện tại là suy luận, chưa có dữ liệu.
3. **Ghép thanh toán vào sản phẩm.** Hàng rào = free 30 lead. Cái chìa: đếm trong trình duyệt (nhanh, không chặn được) hay license key (2–3 tiếng, chặn được ở máy chủ). Làm cách nhanh cho Demo Day, cách chắc trước Buổi 7.
4. **Trỏ tên miền `huongai.com`** về Vercel + `support@huongai.com` (hết cảnh báo Polar). Đang vướng 401.
5. **Nộp bù 25 điểm** Tuần 0 và Buổi 1.
6. **Bài Demo Day** — video 90–120 giây, hạn 20/09.

## 7. Hạn chế đã biết của sản phẩm

| Hạn chế | Hướng xử lý |
|---|---|
| Ngưỡng 9/6/3 chưa hiệu chuẩn | Chấm thử 30 lead đã biết kết quả |
| Cờ A4, A5, A6 phải sale tự tick | Bản sau đọc từ lịch sử cuộc gọi |
| Chưa phân biệt phân khúc (2 tỷ vs 15 tỷ) | Bản sau: chọn phân khúc trước khi chấm |
| Chỉ nhận văn bản dán, chưa nhận ảnh chụp | Bản sau |
| Cảnh báo "hai lớp lệch nhau" hiện cả khi hai lớp cùng kết luận Ảo | Chỉ nên hiện khi *phân loại* khác nhau |
| `ANTHROPIC_API_KEY` trên Vercel chỉ có ở Production | Thêm Preview trước Buổi 7 |
