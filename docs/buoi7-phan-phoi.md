# Buổi 7 — bản đồ phân phối đã chọn, link đo lường và nội dung

*Soạn 16/09/2026. Ba kênh chọn từ bản đồ phân phối Buổi 7: Fanpage/cộng đồng Facebook · Zalo · Skill công khai trên GitHub.*

---

## 1. Link có mã nguồn (UTM) — gửi đúng link của kênh nào vào kênh đó

Gửi sai link thì PostHog quy sai nguồn, và cả bài tập mất ý nghĩa. **Không bao giờ gửi link trần.**

| # | Kênh | Chỗ đăng | Link phải dùng |
|---|---|---|---|
| 1 | Facebook | Fanpage *Bà Cô Làm Chủ AI* | `https://loc-lead-chung-cu.vercel.app/?utm_source=facebook&utm_medium=social&utm_campaign=buoi7&utm_content=fanpage` |
| 1 | Facebook | Nhóm sale BĐS | `https://loc-lead-chung-cu.vercel.app/?utm_source=facebook&utm_medium=social&utm_campaign=buoi7&utm_content=nhom-sale` |
| 2 | Zalo | Nhắn riêng từng sale | `https://loc-lead-chung-cu.vercel.app/?utm_source=zalo&utm_medium=tin-nhan&utm_campaign=buoi7&utm_content=ca-nhan` |
| 2 | Zalo | Nhóm Zalo | `https://loc-lead-chung-cu.vercel.app/?utm_source=zalo&utm_medium=tin-nhan&utm_campaign=buoi7&utm_content=nhom` |
| 3 | GitHub Skill | README + trong SKILL.md | `https://loc-lead-chung-cu.vercel.app/?utm_source=github&utm_medium=skill&utm_campaign=buoi7&utm_content=cham-lead-bds` |

**Cách đọc số trong PostHog:** *Web analytics → Channels / Referrers*, lọc theo `utm_campaign = buoi7`.
Sự kiện quan trọng hơn lượt truy cập: `bam_cham` với `tu_ca_mau = false` nghĩa là **có người dán hội thoại thật của họ vào** — đó mới là người dùng thật, không phải người ghé qua.

---

## 2. Facebook — Fanpage *Bà Cô Làm Chủ AI*

> Tệp của Fanpage là người 40–55 muốn đưa AI vào nghề sẵn có, **không phải** sale chung cư.
> Nên bài này không bán công cụ. Nó kể cách làm. Người đọc đúng tệp sẽ tự chuyển tiếp cho người quen làm BĐS.

---

**Tôi vừa làm một công cụ cho một nghề không phải nghề của tôi.**

Bảy ngày trước tôi hỏi một chị sale bất động sản lâu năm: việc gì trong ngày làm chị mệt nhất?

Tôi đoán chị sẽ nói "tìm khách". Chị nói không phải. Khách chị có sẵn từ nhiều năm. Thứ chị muốn làm gọn hơn là **lưu lại thông tin những khách đã từng chăm sóc** — vì mỗi lần khách cũ nhắn lại, chị phải nhớ từ đầu người này thích căn nào, ngân sách bao nhiêu, vướng ở đâu.

Tôi đã định làm một công cụ chấm điểm khách. Sau câu trả lời đó tôi làm thêm phần thứ hai: **dán đoạn chat vào, máy tự điền hồ sơ khách**. Không phải gõ chữ nào.

Và một thứ nữa, cái này tôi nghĩ mới đáng nói:

Công cụ **che số điện thoại, tên, email của khách ngay trên máy người dùng**, trước khi có bất kỳ kết nối mạng nào. Thứ đi ra ngoài là một đoạn chat nói về căn hộ — không phải danh sách khách hàng. Luật Bảo vệ dữ liệu cá nhân có hiệu lực từ 01/01/2026, và tôi không muốn bán cho người ta một công cụ khiến họ vi phạm.

Ba điều tôi học được, áp dụng được cho bất kỳ ai đang định làm sản phẩm AI cho nghề của mình:

**1. Hỏi trước khi làm, và chuẩn bị tinh thần nghe câu trả lời mình không thích.** Nếu tôi không hỏi, tôi đã làm xong một công cụ chấm điểm mà không ai cần.

**2. Người đầu tiên dùng thử nói "cái này em thấy không trực quan lắm".** Tôi không cãi. Tôi sửa lại giao diện. Phản hồi khó nghe ở ngày thứ hai rẻ hơn nhiều so với ở tháng thứ sáu.

**3. Quyền riêng tư không phải là phần thêm vào cuối.** Nó là lý do người ta dám dán đoạn chat với khách của họ vào một trang web lạ.

Công cụ chạy thật, miễn phí, không cần đăng ký, không cần cài gì:
🔗 https://loc-lead-chung-cu.vercel.app/?utm_source=facebook&utm_medium=social&utm_campaign=buoi7&utm_content=fanpage

Mã nguồn mở, ai muốn xem phần che dữ liệu chạy thế nào thì đọc được: github.com/AromAI-Lab/loc-lead-chung-cu

Anh chị nào có người quen làm môi giới căn hộ, gửi giúp tôi. Tôi cần người lạ dùng thật rồi chê thật.

#BTO #BuildToEarn

---

## 3. Facebook — nhóm sale bất động sản

> Nhóm chặn bài bán hàng. Nên bài này **cho trước**: bộ tiêu chí đọc được, không cần bấm đi đâu.
> Công cụ nằm ở dòng cuối, như một hệ quả, không phải như một lời mời.

---

**Cách phân biệt khách thật với môi giới đối thủ dò giá — viết ra thành bộ tiêu chí, ai cần thì lấy dùng**

Em làm công nghệ, không làm sale. Bảy ngày qua em ngồi với mấy anh chị môi giới căn hộ để hiểu một chuyện: **cùng một đoạn chat, sao người này biết khách ảo còn người kia mất nửa ngày mới biết.**

Bóc ra thì thấy nó không phải linh cảm. Nó là mấy dấu hiệu rất cụ thể:

**Dấu hiệu là môi giới đối thủ, không phải khách:**
- Hỏi **giá gốc, chiết khấu, hoa hồng, chính sách cho sàn**. Khách mua không hỏi mấy thứ này.
- Hỏi dồn về **quỹ căn, bảng hàng, còn bao nhiêu căn** mà không hỏi gì về chuyện ở.
- Dùng từ nghề: *quỹ, rổ hàng, lock căn, booking, primary*.
- Hỏi rất sâu nhưng không để lại cách liên lạc nào.
- Im bặt ngay sau khi nhận báo giá chi tiết.

Một dấu hiệu thì hỏi lại cho chắc. **Hai dấu hiệu trở lên thì gần như chắc.**

**Và chỗ này là chỗ em thấy nhiều công cụ làm sai:** khách thật mới bắt đầu tìm hiểu thì điểm thấp — nhưng vẫn đáng nuôi 3–6 tháng. Môi giới đối thủ trả lời rất trơn tru thì **điểm cao**. Nên "ảo" không phải là "điểm thấp". Chấm chung một thang là ném đi lead thật và giữ lại lead ảo.

Phải chấm **hai trục tách rời**: một trục tiềm năng, một trục cờ ảo. Cờ ảo đè lên điểm.

Bộ tiêu chí đầy đủ em viết ra hết, đọc thẳng không cần đăng ký gì:
https://loc-lead-chung-cu.vercel.app/docs/scoring-criteria.md

Em có làm luôn một trang chạy thử bộ tiêu chí đó — dán đoạn chat vào, nó chấm và điền sẵn hồ sơ khách. **Số điện thoại và tên khách bị che ngay trên máy anh chị trước khi gửi đi bất cứ đâu**, cái này em để mã nguồn mở để ai không tin thì kiểm tra được.
https://loc-lead-chung-cu.vercel.app/?utm_source=facebook&utm_medium=social&utm_campaign=buoi7&utm_content=nhom-sale

Miễn phí, không đăng ký, không lấy thông tin. Em đang cần người chê thật để sửa. Anh chị dùng thấy chỗ nào ngu thì nói thẳng giúp em.

---

## 4. Zalo — nhắn riêng từng sale

> Nguyên tắc đã chốt: **một người nhắn một lần.** Không trả lời thì tìm người mới, không nhắn lại.
> Xin một việc nhỏ, đừng xin mua.

---

Chào anh/chị 【tên】, em là Hương.

Em làm một công cụ nhỏ cho môi giới căn hộ: dán đoạn chat với khách vào, nó chấm khách đó nóng hay ảo, và điền sẵn hồ sơ khách để anh/chị khỏi gõ tay.

Em không bán gì cả, đang cần người thật dùng thử rồi chê.

Anh/chị bấm vào, dán thử **một** đoạn chat cũ bất kỳ là thấy ngay, không cần đăng ký:
https://loc-lead-chung-cu.vercel.app/?utm_source=zalo&utm_medium=tin-nhan&utm_campaign=buoi7&utm_content=ca-nhan

Số điện thoại và tên khách bị che ngay trên máy anh/chị trước khi gửi đi, nên không lo lộ data.

Nếu tiện, cho em xin đúng hai câu: **mở ra rồi anh/chị dừng lại ở bước nào**, và **chấm xong thấy có đúng không**. Chỉ vậy thôi ạ, em không làm phiền thêm.

---

## 5. Bài 4 — Email marketing

**Hoạt động:** thu thập email đổi lấy bộ tiêu chí, rồi gửi một thư có nội dung thật.

**Vì sao chọn cách này thay vì gửi thư hàng loạt:** chưa có danh sách email nào. Xây danh sách từ số không, bằng một thứ người ta thật sự muốn, đúng hơn là mua danh sách.

**Vì sao là link chứ không nhúng biểu mẫu vào trang:** nhúng biểu mẫu là thêm script bên thứ ba vào trang — trái với lời hứa "ngoài PostHog ra không có gì khác". Một cái link mở tab mới thì không phá lời hứa đó.

### Cách làm

**Bước 1 — Google Biểu mẫu** — ĐÃ TẠO VÀ ĐÃ XUẤT BẢN 17/09/2026:
- Link phát đi: https://docs.google.com/forms/d/e/1FAIpQLScVBBpD5vCpCEkFTXXZgXy1CLNwWMVp6wK5oS0UlqtkVQ_V_Q/viewform
- Link sửa: https://docs.google.com/forms/d/1gW6yMhvk_FBT6KQ3iiSWmQMAynuQWzcvYljZafzvClA/edit
- Cài đặt quan trọng: *Thu thập địa chỉ email = "Thông tin về người trả lời"* (người nhập tay). KHÔNG dùng "Đã xác minh" — trình duyệt trong Zalo không có phiên Google, bật lên là sale gặp tường đăng nhập rồi thoát.
- Ô khu vực để 5 lựa chọn cố định thay vì ô gõ tự do, cho khỏi phải dọn "HCM / Hồ Chí Minh / Sài Gòn / tphcm" lúc đếm.

Hai câu hỏi thôi:
- *Email của anh/chị*
- *Anh/chị đang bán căn hộ ở khu vực nào?* (câu này để phân loại, và để biết người đăng ký có đúng tệp không)

Tiêu đề: **Bộ tiêu chí chấm lead căn hộ v1.0 — và bản hiệu chuẩn khi xong**
Mô tả:
> Bộ tiêu chí em dùng để chấm lead căn hộ: 4 tiêu chí tính điểm, 5 dấu hiệu nhận môi giới đối thủ giả làm khách, và ngưỡng cắt Nóng/Ấm/Lạnh.
> Ngưỡng điểm đang được hiệu chuẩn bằng 30 lead đã biết kết quả. Xong em gửi bản cập nhật cho anh/chị.
> Em gửi đúng hai thư: bản tiêu chí bây giờ, và bản hiệu chuẩn khi xong. Không gửi gì khác.

**Bước 2 — đặt link biểu mẫu ở ba chỗ:** cuối bài Fanpage, cuối bài nhóm sale, và cuối trang sản phẩm.

**Bước 3 — thư gửi ngay cho người đăng ký:**

> **Tiêu đề:** Bộ tiêu chí chấm lead căn hộ v1.0 — và một điều em nói trước
>
> Chào anh/chị,
>
> Bộ tiêu chí đây ạ: https://loc-lead-chung-cu.vercel.app/docs/scoring-criteria.md
>
> Em nói trước một điều để anh/chị dùng cho đúng: **ngưỡng 9/6/3 chưa được hiệu chuẩn xong.** Em đang đối chiếu trên 30 lead đã biết kết quả thật. Nên lúc này hãy coi điểm số là cách xếp thứ tự gọi ai trước, đừng coi là phán quyết.
>
> Phần em tin nhất trong đó là **năm dấu hiệu nhận môi giới đối thủ giả làm khách** ở mục 3. Cái đó không phụ thuộc ngưỡng điểm.
>
> Muốn chấm thử ngay bằng máy thì dán đoạn chat vào đây: https://loc-lead-chung-cu.vercel.app/?utm_source=email&utm_medium=email&utm_campaign=buoi7&utm_content=thu-1
> Số điện thoại và tên khách bị che ngay trên máy anh/chị trước khi gửi đi.
>
> Khi hiệu chuẩn xong em gửi bản cập nhật. Ngoài hai thư đó em không gửi gì thêm.
>
> Mai Hương — 10X System

**Ảnh chụp làm bằng chứng:** màn hình *Phản hồi* của Google Biểu mẫu (số lượt đăng ký), và một thư đã gửi trong hộp thư đi.

---

## 6. Trung thực về con số

Đề Bài 1 đòi 100 người dùng. Nếu tới hạn không đủ 100 thì **nộp con số thật kèm giải thích**, không độn.

Người chấm kiểm tra được ảnh chụp PostHog, và một bài nộp ghi 100 mà PostHog hiện 23 thì mất nhiều hơn vài điểm.

Con số đáng nói không phải lượt truy cập, mà là: **bao nhiêu người bấm chấm với hội thoại thật của họ** (`bam_cham` có `tu_ca_mau = false`), và **bao nhiêu người lưu hồ sơ**. Hai con số đó nói lên sản phẩm có được dùng thật không.
